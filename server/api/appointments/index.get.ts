import { Appointment } from '../../models/Appointment';
import { OrthodonticSession } from '../../models/OrthodonticSession';
import { Patient } from '../../models/Patient';
import '../../models/User';

// Randevuları çeker, isteğe bağlı olarak tarih (date) veya hasta (patientId) bazlı filtreler
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const date = query.date ? String(query.date) : '';
    const startDate = query.startDate ? String(query.startDate) : '';
    const endDate = query.endDate ? String(query.endDate) : '';
    const patientId = query.patientId ? String(query.patientId) : '';

    const filter: any = {};
    if (date) {
      filter.date = date;
    } else if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }

    if (patientId) {
      filter.patientId = patientId;
    }

    const doctorId = query.doctorId ? String(query.doctorId) : '';
    if (doctorId && doctorId !== 'all') {
      filter.doctorId = doctorId;
    }

    filter.isDeleted = { $ne: true };

    const limit = Math.min(2000, Number(query.limit) || (date || (startDate && endDate) || patientId ? 2000 : 500));

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'firstName lastName phone bloodType allergies')
      .populate('doctorId', 'name username title')
      .sort({ date: 1, time: 1 })
      .limit(limit)
      .lean();

    // Ortodonti seanslarını da genel randevular takvimine senkronize et ve ekle
    try {
      const orthoFilter: any = {};
      if (patientId) orthoFilter.patientId = patientId;
      if (doctorId && doctorId !== 'all') orthoFilter.doctorId = doctorId;

      const normalizeDateStr = (raw: string) => {
        if (!raw) return '';
        const trimmed = String(raw).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
          return trimmed.substring(0, 10);
        }
        if (/^\d{2}\.\d{2}\.\d{4}/.test(trimmed)) {
          const parts = trimmed.split('.');
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return trimmed;
      };

      let dateConditions: any[] = [];
      const trDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? `${date.split('-')[2]}.${date.split('-')[1]}.${date.split('-')[0]}`
        : '';

      if (date) {
        dateConditions = [
          { date: date },
          { nextAppointmentDate: date }
        ];
        if (trDate) {
          dateConditions.push({ date: trDate }, { nextAppointmentDate: trDate });
        }
      } else if (startDate && endDate) {
        dateConditions = [
          { date: { $gte: startDate, $lte: endDate } },
          { nextAppointmentDate: { $gte: startDate, $lte: endDate } }
        ];
      } else if (startDate) {
        dateConditions = [
          { date: { $gte: startDate } },
          { nextAppointmentDate: { $gte: startDate } }
        ];
      } else if (endDate) {
        dateConditions = [
          { date: { $lte: endDate } },
          { nextAppointmentDate: { $lte: endDate } }
        ];
      }

      if (dateConditions.length > 0) {
        orthoFilter.$or = dateConditions;
      }

      const orthoSessions = await OrthodonticSession.find(orthoFilter)
        .populate('patientId', 'firstName lastName phone bloodType allergies')
        .populate('doctorId', 'name username title')
        .lean();

      const todayStr = new Date().toISOString().split('T')[0];

      const isDateMatch = (rawD: string) => {
        if (!rawD) return false;
        const d = normalizeDateStr(rawD);
        if (date) return d === date || rawD === date || rawD === trDate;
        if (startDate && endDate) return d >= startDate && d <= endDate;
        if (startDate) return d >= startDate;
        if (endDate) return d <= endDate;
        return true;
      };

      for (const s of orthoSessions) {
        const pId = (s.patientId as any)?._id || s.patientId;
        let pName = `${(s.patientId as any)?.firstName || ''} ${(s.patientId as any)?.lastName || ''}`.trim();
        let pPhone = (s.patientId as any)?.phone || '';

        if (!pName && pId) {
          try {
            const patientDoc = await Patient.findById(pId).lean();
            if (patientDoc) {
              pName = `${patientDoc.firstName || ''} ${patientDoc.lastName || ''}`.trim();
              pPhone = patientDoc.phone || '';
            }
          } catch (e) {}
        }
        if (!pName) pName = 'Ortodonti Hastası';

        const docId = (s.doctorId as any)?._id || s.doctorId;

        // 1. Seansın kendi tarihi randevu olarak eklenir
        if (s.date && isDateMatch(s.date)) {
          const normalizedSDate = normalizeDateStr(s.date);
          const sTime = s.time || '11:00';
          const alreadyExists = appointments.some((a: any) => {
            const aPid = String(a.patientId?._id || a.patientId || '');
            return (aPid === String(pId) || (a.patientName && a.patientName === pName)) &&
                   normalizeDateStr(a.date) === normalizedSDate &&
                   (a.time === sTime || a.procedure?.includes('Ortodonti'));
          });

          if (!alreadyExists) {
            let newApptDoc: any = null;
            try {
              newApptDoc = await Appointment.findOneAndUpdate(
                {
                  patientId: pId,
                  date: normalizedSDate,
                  time: sTime,
                  isDeleted: { $ne: true }
                },
                {
                  $setOnInsert: {
                    patientId: pId,
                    patientName: pName,
                    patientPhone: pPhone,
                    date: normalizedSDate,
                    time: sTime,
                    procedure: `Ortodonti ${s.sessionNumber || 1}. Seans`,
                    duration: 30,
                    notes: s.sessionNotes ? `Seans Notu: ${s.sessionNotes}` : 'Ortodontik seans',
                    status: normalizedSDate >= todayStr ? 'pending' : 'completed',
                    doctorId: docId,
                    isDeleted: false
                  }
                },
                { upsert: true, new: true }
              )
              .populate('patientId', 'firstName lastName phone bloodType allergies')
              .populate('doctorId', 'name username title')
              .lean();
            } catch (syncErr) {
              console.warn('Seans randevu senkronizasyon uyarısı:', syncErr);
            }

            if (!newApptDoc) {
              newApptDoc = {
                _id: `ortho_${s._id}`,
                patientId: s.patientId,
                patientName: pName,
                patientPhone: pPhone,
                date: normalizedSDate,
                time: sTime,
                procedure: `Ortodonti ${s.sessionNumber || 1}. Seans`,
                duration: 30,
                notes: s.sessionNotes ? `Seans Notu: ${s.sessionNotes}` : 'Ortodontik seans',
                status: normalizedSDate >= todayStr ? 'pending' : 'completed',
                doctorId: s.doctorId,
                isDeleted: false
              };
            }
            appointments.push(newApptDoc);
          }
        }

        // 2. Bir sonraki seans kontrol randevusu eklenir
        if (s.nextAppointmentDate && isDateMatch(s.nextAppointmentDate)) {
          const normalizedNextDate = normalizeDateStr(s.nextAppointmentDate);
          const nextTime = (s as any).nextAppointmentTime || '11:00';
          const alreadyExistsNext = appointments.some((a: any) => {
            const aPid = String(a.patientId?._id || a.patientId || '');
            return (aPid === String(pId) || (a.patientName && a.patientName === pName)) &&
                   normalizeDateStr(a.date) === normalizedNextDate &&
                   (a.time === nextTime || a.procedure?.includes('Ortodonti'));
          });

          if (!alreadyExistsNext) {
            let nextApptDoc: any = null;
            try {
              nextApptDoc = await Appointment.findOneAndUpdate(
                {
                  patientId: pId,
                  date: normalizedNextDate,
                  time: nextTime,
                  isDeleted: { $ne: true }
                },
                {
                  $setOnInsert: {
                    patientId: pId,
                    patientName: pName,
                    patientPhone: pPhone,
                    date: normalizedNextDate,
                    time: nextTime,
                    procedure: `Ortodonti ${(s.sessionNumber || 0) + 1}. Seans Kontrolü`,
                    duration: 30,
                    notes: s.nextAppointmentNotes ? `Ortodonti Notu: ${s.nextAppointmentNotes}` : 'Ortodontik kontrol randevusu',
                    status: 'pending',
                    doctorId: docId,
                    isDeleted: false
                  }
                },
                { upsert: true, new: true }
              )
              .populate('patientId', 'firstName lastName phone bloodType allergies')
              .populate('doctorId', 'name username title')
              .lean();
            } catch (syncNextErr) {
              console.warn('Sonraki seans randevu senkronizasyon uyarısı:', syncNextErr);
            }

            if (!nextApptDoc) {
              nextApptDoc = {
                _id: `ortho_next_${s._id}`,
                patientId: s.patientId,
                patientName: pName,
                patientPhone: pPhone,
                date: normalizedNextDate,
                time: nextTime,
                procedure: `Ortodonti ${(s.sessionNumber || 0) + 1}. Seans Kontrolü`,
                duration: 30,
                notes: s.nextAppointmentNotes ? `Ortodonti Notu: ${s.nextAppointmentNotes}` : 'Ortodontik kontrol randevusu',
                status: 'pending',
                doctorId: s.doctorId,
                isDeleted: false
              };
            }
            appointments.push(nextApptDoc);
          }
        }
      }

      // Tarih ve saate göre yeniden sırala
      appointments.sort((a: any, b: any) => {
        const dateComp = (a.date || '').localeCompare(b.date || '');
        if (dateComp !== 0) return dateComp;
        return (a.time || '').localeCompare(b.time || '');
      });
    } catch (orthoErr) {
      console.warn('Ortodonti seansları çekilirken uyarı:', orthoErr);
    }

    return appointments;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Randevular listelenirken hata oluştu: ${error.message}`
    });
  }
});

