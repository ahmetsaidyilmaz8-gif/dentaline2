import { User } from '../../models/User';
import { Patient } from '../../models/Patient';
import { Appointment } from '../../models/Appointment';
import { Reminder } from '../../models/Reminder';
import { Payment } from '../../models/Payment';
import { Treatment } from '../../models/Treatment';
import { requireDoctor, makeTurkishRegex } from '../../utils/auth';

function makeTurkishRegex(text) {
  const clean = text.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
  const pattern = clean.replace(/[iİıI]/g, "[i\u0130\u0131I]").replace(/[çÇcC]/g, "[\xE7\xC7cC]").replace(/[ğĞgG]/g, "[\u011F\u011EgG]").replace(/[öÖoO]/g, "[\xF6\xD6oO]").replace(/[üÜuU]/g, "[\xFC\xDCuU]").replace(/[şŞsS]/g, "[\u015F\u015EsS]");
  return new RegExp(pattern, "i");
}
function cleanPatientSearchTerm(raw) {
  if (!raw || typeof raw !== "string") return "";
  const cleaned = raw.replace(/\b(bakiye|bakiyesi|borcu|borç|borcunu|kalan|ödenen|ödeme|tutar|tutarı|sorgula|sorgulama|bilgisi|bilgileri|bilgilerini|kimdir|hastası|hastanın|randevu|randevusu|ne kadar|kaç para)\b/gi, " ").replace(/\s+/g, " ").trim();
  return cleaned || raw.trim();
}
async function findMatchingPatients(searchTerm, limit = 6) {
  const cleaned = cleanPatientSearchTerm(searchTerm);
  if (!cleaned) return [];
  const words = cleaned.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return [];
  const andConditions = words.map((w) => {
    const rx = makeTurkishRegex(w);
    return {
      $or: [
        { fullName: rx },
        { firstName: rx },
        { lastName: rx },
        { phone: rx },
        { tcNo: rx }
      ]
    };
  });
  let matched = await Patient.find({ $and: andConditions }).limit(limit).lean();
  if (matched.length === 0 && words.length > 1) {
    const orConditions = words.map((w) => {
      const rx = makeTurkishRegex(w);
      return {
        $or: [
          { fullName: rx },
          { firstName: rx },
          { lastName: rx }
        ]
      };
    });
    matched = await Patient.find({ $or: orConditions }).limit(limit).lean();
  }
  if (matched.length === 0 && cleaned !== (searchTerm == null ? void 0 : searchTerm.trim())) {
    const rawWords = (searchTerm || "").trim().split(/\s+/).filter(Boolean);
    if (rawWords.length > 0) {
      const fallbackRx = makeTurkishRegex(rawWords[0]);
      matched = await Patient.find({
        $or: [
          { fullName: fallbackRx },
          { firstName: fallbackRx },
          { lastName: fallbackRx }
        ]
      }).limit(limit).lean();
    }
  }
  return matched;
}
async function findDoctorByName(doctorName) {
  if (!doctorName || !doctorName.trim()) return null;
  const regex = makeTurkishRegex(doctorName.trim());
  const found = await User.findOne({
    $or: [
      { name: regex },
      { username: regex }
    ]
  }).lean();
  return found;
}
function calculateReminderDate(targetDateStr, leadDays = 0) {
  const parts = targetDateStr.split("-").map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return targetDateStr;
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - (Number(leadDays) || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatTurkishDateFull(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dayNames = ["Pazar", "Pazartesi", "Sal\u0131", "\xC7ar\u015Famba", "Per\u015Fembe", "Cuma", "Cumartesi"];
  const monthNames = [
    "Ocak",
    "\u015Eubat",
    "Mart",
    "Nisan",
    "May\u0131s",
    "Haziran",
    "Temmuz",
    "A\u011Fustos",
    "Eyl\xFCl",
    "Ekim",
    "Kas\u0131m",
    "Aral\u0131k"
  ];
  const dayName = dayNames[dateObj.getUTCDay()];
  const monthName = monthNames[m - 1];
  return `${d} ${monthName} ${y}, ${dayName}`;
}
function normalizeDateStr(dateStr, todayStr, calendarDate) {
  if (!dateStr || typeof dateStr !== "string") return void 0;
  const clean = dateStr.trim().toLowerCase();
  const currentBase = calendarDate || todayStr || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const currentYear = currentBase.split("-")[0];
  if (clean === "bug\xFCn" || clean === "bugun" || clean === "today") {
    return currentBase;
  }
  if (clean === "yar\u0131n" || clean === "yarin" || clean === "tomorrow") {
    const d = new Date(currentBase);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }
  if (clean === "d\xFCn" || clean === "dun" || clean === "yesterday") {
    const d = new Date(currentBase);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }
  const dmyMatch = clean.match(/^(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    let year = dmyMatch[3] || currentYear;
    if (year.length === 2) year = "20" + year;
    return `${year}-${month}-${day}`;
  }
  const turkishMonths = {
    "ocak": "01",
    "subat": "02",
    "\u015Fubat": "02",
    "mart": "03",
    "nisan": "04",
    "mayis": "05",
    "may\u0131s": "05",
    "haziran": "06",
    "temmuz": "07",
    "agustos": "08",
    "a\u011Fustos": "08",
    "eylul": "09",
    "eyl\xFCl": "09",
    "ekim": "10",
    "kasim": "11",
    "kas\u0131m": "11",
    "aralik": "12",
    "aral\u0131k": "12"
  };
  const trMatch = clean.match(/(\d{1,2})\s+([a-zçğıöşü]+)/i);
  if (trMatch) {
    const day = trMatch[1].padStart(2, "0");
    const monthWord = trMatch[2].toLowerCase();
    for (const [mName, mNum] of Object.entries(turkishMonths)) {
      if (monthWord.startsWith(mName)) {
        const yearMatch = clean.match(/\b(20\d{2})\b/);
        const year = yearMatch ? yearMatch[1] : currentYear;
        return `${year}-${mNum}-${day}`;
      }
    }
  }
  return dateStr;
}
async function findTargetAppointments(args, todayStr, calendarDate) {
  if (args.appointmentId) {
    const byId = await Appointment.findById(args.appointmentId).populate("patientId", "firstName lastName phone").populate("doctorId", "name username title").lean();
    return byId ? [byId] : [];
  }
  const pName = (args.patientName || "").trim();
  const normalizedDate = normalizeDateStr(args.date, todayStr, calendarDate);
  let patientIds = [];
  if (pName) {
    const matchingPatients = await findMatchingPatients(pName, 10);
    patientIds = matchingPatients.map((p) => p._id);
  }
  const executeQuery = async (targetDate) => {
    const q = {};
    const cleaned = cleanPatientSearchTerm(pName) || pName;
    const regex = cleaned ? makeTurkishRegex(cleaned) : null;
    if (pName) {
      const orClauses = [];
      if (regex) {
        orClauses.push({ patientName: regex });
      }
      if (patientIds.length > 0) {
        orClauses.push({ patientId: { $in: patientIds } });
      }
      if (orClauses.length > 0) {
        q.$or = orClauses;
      }
    }
    if (targetDate) {
      q.date = targetDate;
    }
    if (args.time) {
      q.time = args.time;
    }
    if (!pName && !q.date && !q.time) {
      return [];
    }
    return await Appointment.find(q).populate("patientId", "firstName lastName phone").populate("doctorId", "name username title").sort({ date: 1, time: 1 }).lean();
  };
  let appts = await executeQuery(normalizedDate);
  if (appts.length === 0 && calendarDate && calendarDate !== normalizedDate) {
    const calAppts = await executeQuery(calendarDate);
    if (calAppts.length > 0) {
      appts = calAppts;
    }
  }
  if (appts.length === 0 && pName) {
    const allPatientAppts = await executeQuery(void 0);
    if (allPatientAppts.length > 0) {
      const pendingOnes = allPatientAppts.filter((a) => a.status === "pending");
      if (pendingOnes.length === 1) {
        appts = pendingOnes;
      } else {
        appts = allPatientAppts;
      }
    }
  }
  return appts;
}
const chat_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  try {
    const doctor = await requireDoctor(event);
    const body = await readBody(event);
    const messages = (body == null ? void 0 : body.messages) || [];
    const calendarDate = (body == null ? void 0 : body.calendarDate) || null;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        reply: "\u26A0\uFE0F **Gemini API Anahtar\u0131 Bulunamad\u0131!**\n\nAsistan\u0131 kullanabilmek i\xE7in Google AI Studio'dan (https://aistudio.google.com/app/apikey) ald\u0131\u011F\u0131n\u0131z API anahtar\u0131n\u0131z\u0131 `.env` dosyan\u0131za ekleyin:\n\n```env\nGEMINI_API_KEY=AIzaSy...\n```\nAnahtar\u0131 ekledikten sonra asistana tekrar yazabilirsiniz."
      };
    }
    let userTimeZone = "Europe/Istanbul";
    if ((body == null ? void 0 : body.timeZone) && typeof body.timeZone === "string") {
      try {
        Intl.DateTimeFormat(void 0, { timeZone: body.timeZone });
        userTimeZone = body.timeZone;
      } catch {
        userTimeZone = "Europe/Istanbul";
      }
    }
    const now = /* @__PURE__ */ new Date();
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: userTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now);
    const currentTimeStr = new Intl.DateTimeFormat("tr-TR", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(now);
    const currentDayName = new Intl.DateTimeFormat("tr-TR", {
      timeZone: userTimeZone,
      weekday: "long"
    }).format(now);
    const systemInstruction = `Sen TenaxLine Dental Suite klinik y\xF6netim sisteminin hekime/klini\u011Fe \xF6zel ak\u0131ll\u0131 yapay zeka asistan\u0131s\u0131n.
Bug\xFCn\xFCn yerel tarihi: ${todayStr} (${currentDayName}).
\u015Eu anki yerel saat: ${currentTimeStr} (${userTimeZone === "Europe/Istanbul" ? "T\xFCrkiye Saati" : userTimeZone}).
${calendarDate ? `Hekimin \u015Fu anda ekranda a\xE7\u0131k tuttu\u011Fu takvim tarihi: ${calendarDate}.` : ""}
Giri\u015F yapm\u0131\u015F hekim: ${doctor.name || "Hekim"}.

\u{1F6D1} KES\u0130N YETK\u0130 VE G\xD6REV SINIRLAMASI:
Sen YALNIZCA \u015Fu d\xF6rt alanda yetkilisin:
1. HASTA ARAMA VE B\u0130LG\u0130 SORGULAMA: 'search_patient' (Hastan\u0131n ileti\u015Fim, ya\u015F, kay\u0131t ve son durumunu getirme)
2. HASTA BAK\u0130YE VE BOR\xC7 SORGULAMA: 'get_patient_balance' (Yaln\u0131zca bilgi/sorgulama ama\xE7l\u0131)
3. RANDEVU \u0130\u015ELEMLER\u0130 (Olu\u015Fturma, \u0130ptal, Erteleme, Silme, G\xFCncelleme, Not D\xFCzenleme, Listeleme)
4. HATIRLATICI \u0130\u015ELEMLER\u0130 (Tedavi ve \xD6deme Hat\u0131rlat\u0131c\u0131lar\u0131 Ekleme/Listeleme)

KAPSAM KURALLARI:
1. HASTA ARAMA VE B\u0130LG\u0130 SORGULAMA:
   * Hasta Arama / Profil Sorgulama: 'search_patient' (query: hasta ad\u0131 soyad\u0131, telefon, tc veya arama terimi).
   * Hekim do\u011Frudan bir hasta ad\u0131 s\xF6yledi\u011Finde (\xF6rn: "Leyla Karag\xF6l", "Berivan Peker", "Hasta sorgula Ahmet"), "kimdir", "ileti\u015Fim bilgisi nedir", "telefonu ka\xE7" diye sordu\u011Funda KES\u0130NL\u0130KLE 'search_patient' arac\u0131n\u0131 \xE7a\u011F\u0131r.

2. HASTA BAK\u0130YE VE BOR\xC7 SORGULAMA (SADECE B\u0130LG\u0130/SORGULAMA AMA\xC7LI):
   * Bakiye ve Bor\xE7 Sorgulama: 'get_patient_balance' (patientName).
   * Hekim "ka\xE7 para borcu kalm\u0131\u015F", "ne kadar \xF6demi\u015F", "kalan borcu ne kadar", "bakiyesi nedir", "Berivan Peker bakiye sorgula" dedi\u011Finde 'get_patient_balance' arac\u0131n\u0131 \xE7a\u011F\u0131r. Hastan\u0131n toplam tedavi tutar\u0131n\u0131, bug\xFCne kadar yapt\u0131\u011F\u0131 toplam \xF6demeyi, son \xF6demelerini ve kalan borcunu net olarak bildir.
   * \u{1F6D1} KES\u0130NL\u0130KLE sisteme YEN\u0130 \xD6DEME G\u0130RME (tahsilat alma) VEYA \xD6DEME S\u0130LME i\u015Flemi YAPMA. Bu i\u015Flemleri yapmak yasakt\u0131r; hekime \xF6deme tahsilat\u0131n\u0131n g\xFCvenlik sebebiyle cari karttan veya kasa men\xFCs\xFCnden yap\u0131lmas\u0131 gerekti\u011Fini kibarca belirt.

3. RANDEVU \u0130\u015ELEMLER\u0130:
   * Randevu Olu\u015Fturma: 'create_appointment' (hasta ad\u0131, tarih, saat, i\u015Flem, hekim, not). Hekim randevu a\xE7mak istedi\u011Finde bu arac\u0131 \xE7a\u011F\u0131r.
   * Randevu \u0130ptal Etme / Erteleme:
     - \u0130ptal i\xE7in: 'cancel_appointment' arac\u0131n\u0131 \xE7a\u011F\u0131r.
     - Erteleme i\xE7in: 'update_appointment' arac\u0131n\u0131 'status: postponed' veya yeni bir tarih belirtilmi\u015Fse 'newDate' parametresiyle \xE7a\u011F\u0131r.
   * Randevu Silme: 'delete_appointment' (randevuyu sistemden tamamen siler). Hekim 'randevuyu sil' dedi\u011Finde bu arac\u0131 \xE7a\u011F\u0131r.
   * Randevu G\xFCncelleme: 'update_appointment' (ilgili hekim, durum, tarih, saat, i\u015Flem, not de\u011Fi\u015Ftirme).
   * Not Ekleme / D\xFCzenleme: 'update_appointment_notes' (mevcut bir randevuya not ekleme/d\xFCzenleme).
   * Randevu Listeleme: 'get_appointments' (belirli bir g\xFCn\xFCn veya hastan\u0131n randevular\u0131n\u0131 ve notlar\u0131n\u0131 listeleme).

4. HATIRLATICI \u0130\u015ELEMLER\u0130 (TEDAV\u0130 VE \xD6DEME HATIRLATICILARI):
   * Hat\u0131rlat\u0131c\u0131 Ekleme: 'create_reminder' (patientName, category: 'treatment' | 'payment' | 'general', note, targetDate, leadDays).
     - Hekim "hat\u0131rlat\u0131c\u0131 ekle", "tedavi hat\u0131rlat\u0131c\u0131s\u0131", "kontrol hat\u0131rlat\u0131c\u0131s\u0131", "\xF6deme hat\u0131rlat\u0131c\u0131s\u0131", "taksit hat\u0131rlat" dedi\u011Finde KES\u0130NL\u0130KLE 'create_reminder' arac\u0131n\u0131 \xE7a\u011F\u0131r.
     - ASLA VE KES\u0130NL\u0130KLE hat\u0131rlat\u0131c\u0131 yerine randevu ('create_appointment') olu\u015Fturma!
     - ASLA "hat\u0131rlat\u0131c\u0131 mod\xFCl\xFC yok" deme! Sistemde eksiksiz bir Hat\u0131rlatma & Bildirim Merkezi mevcuttur ve 'create_reminder' do\u011Frudan sisteme i\u015Fler.
   * Hat\u0131rlat\u0131c\u0131lar\u0131 Listeleme: 'get_reminders' (mevcut aktif tedavi/\xF6deme hat\u0131rlat\u0131c\u0131lar\u0131n\u0131 listeleme).

4. TAR\u0130H VE YAZIM KURALLARI (\xC7OK \xD6NEML\u0130):
   * Hekime tarih bildirirken ASLA tek rakamlar\u0131 veya tarihleri sat\u0131r ortas\u0131nda b\xF6lme (\xD6rn: '2' yaz\u0131p alt sat\u0131ra '7 Eyl\xFCl' ge\xE7me!). Daima tek bir sat\u0131rda tam T\xFCrk\xE7e yaz: \xD6rn: '27 Eyl\xFCl 2026, Pazar'.
   * Markdown y\u0131ld\u0131z i\u015Faretlerini (*) dikkatli kullan. Kelime ortas\u0131nda veya rakam ba\u015F\u0131nda a\xE7\u0131lmam\u0131\u015F/kapanmam\u0131\u015F tek y\u0131ld\u0131z b\u0131rakma.
   * "27 Eyl\xFCl", "yar\u0131n", "\xF6n\xFCm\xFCzdeki hafta", "27.09" gibi t\xFCm tarih ifadelerini do\u011Fru \xE7\xF6z\xFCmle.
   * Saat soruldu\u011Funda do\u011Frudan g\xFCncel yerel saati (${currentTimeStr}) bildir.
5. CEVAP \xDCSLUBU:
   * Kibar, net, profesyonel ol. Yap\u0131lan i\u015Flemi (randevu olu\u015Fturuldu, hat\u0131rlat\u0131c\u0131 eklendi vb.) net bir \u015Fekilde teyit et.`;
    const tools = [
      {
        functionDeclarations: [
          {
            name: "create_appointment",
            description: "Sistemde yeni bir hasta randevusu olu\u015Fturur.",
            parameters: {
              type: "OBJECT",
              properties: {
                patientName: { type: "STRING", description: "Hastan\u0131n ad\u0131 ve soyad\u0131" },
                date: { type: "STRING", description: "Randevu tarihi (YYYY-MM-DD veya 27 Eyl\xFCl format\u0131nda)" },
                time: { type: "STRING", description: "Randevu saati (HH:MM)" },
                procedure: { type: "STRING", description: "Yap\u0131lacak tedavi veya i\u015Flem (Muayene, Dolgu, Kanal Tedavisi vb.)" },
                doctorName: { type: "STRING", description: "Randevunun atanaca\u011F\u0131 hekim ad\u0131 (\xF6rn: Muhammed Selman Y\u0131lmaz, Klinik vb.)" },
                notes: { type: "STRING", description: "Randevu notu (iste\u011Fe ba\u011Fl\u0131)" }
              },
              required: ["patientName", "date", "time", "procedure"]
            }
          },
          {
            name: "cancel_appointment",
            description: 'Mevcut bir randevuyu iptal eder (durumunu "cancelled" olarak de\u011Fi\u015Ftirir) ve gerekirse randevu notuna a\xE7\u0131klama ekler.',
            parameters: {
              type: "OBJECT",
              properties: {
                patientName: { type: "STRING", description: "Randevusu iptal edilecek hastan\u0131n ad\u0131 ve soyad\u0131" },
                notes: { type: "STRING", description: "\u0130ptal gerek\xE7esi veya eklenecek randevu notu" },
                date: { type: "STRING", description: "Randevu tarihi (YYYY-MM-DD veya 27 Eyl\xFCl format\u0131nda)" },
                time: { type: "STRING", description: "Randevu saati (HH:MM)" },
                appointmentId: { type: "STRING", description: "Randevunun do\u011Frudan sistem ID kimli\u011Fi (varsa)" }
              },
              required: ["patientName"]
            }
          },
          {
            name: "delete_appointment",
            description: "Sistemde kay\u0131tl\u0131 mevcut bir hasta randevusunu tamamen siler.",
            parameters: {
              type: "OBJECT",
              properties: {
                patientName: { type: "STRING", description: "Randevusu silinecek hastan\u0131n ad\u0131 ve soyad\u0131" },
                date: { type: "STRING", description: "Randevu tarihi (YYYY-MM-DD veya 27 Eyl\xFCl format\u0131nda)" },
                time: { type: "STRING", description: "Randevu saati (HH:MM)" },
                appointmentId: { type: "STRING", description: "Randevunun do\u011Frudan sistem ID kimli\u011Fi (varsa)" }
              }
            }
          },
          {
            name: "update_appointment",
            description: "Mevcut bir randevunun hekimini, durumunu (postponed: ertelendi, cancelled: iptal vb.), notunu, tarihini, saatini veya i\u015Flemini g\xFCnceller/d\xFCzenler.",
            parameters: {
              type: "OBJECT",
              properties: {
                patientName: { type: "STRING", description: "Randevusu d\xFCzenlenecek hastan\u0131n ad\u0131 ve soyad\u0131" },
                doctorName: { type: "STRING", description: "Randevunun atanaca\u011F\u0131 yeni hekim ad\u0131" },
                status: { type: "STRING", description: "Randevu durumu: pending (bekliyor), completed (tamamland\u0131), cancelled (iptal), noshow (gelmedi), postponed (ertelendi)", enum: ["pending", "completed", "cancelled", "noshow", "postponed"] },
                notes: { type: "STRING", description: "Yeni veya g\xFCncellenecek randevu notu" },
                newDate: { type: "STRING", description: "Yeni randevu tarihi (YYYY-MM-DD veya 27 Eyl\xFCl format\u0131nda)" },
                newTime: { type: "STRING", description: "Yeni randevu saati (HH:MM)" },
                newProcedure: { type: "STRING", description: "Yeni tedavi veya i\u015Flem t\xFCr\xFC" },
                date: { type: "STRING", description: "Mevcut randevunun tarihi (YYYY-MM-DD)" },
                time: { type: "STRING", description: "Mevcut randevunun saati (HH:MM)" },
                appointmentId: { type: "STRING", description: "Randevunun ID kimli\u011Fi (varsa)" }
              }
            }
          },
          {
            name: "update_appointment_notes",
            description: "Mevcut bir randevunun notunu (a\xE7\u0131klamas\u0131n\u0131) d\xFCzenler, g\xFCnceller veya yeni not ekler.",
            parameters: {
              type: "OBJECT",
              properties: {
                patientName: { type: "STRING", description: "Randevu notu g\xFCncellenecek hastan\u0131n ad\u0131 ve soyad\u0131" },
                notes: { type: "STRING", description: "Yeni randevu notu metni" },
                date: { type: "STRING", description: "Randevu tarihi (YYYY-MM-DD)" },
                time: { type: "STRING", description: "Randevu saati (HH:MM)" },
                appointmentId: { type: "STRING", description: "Randevunun ID kimli\u011Fi (varsa)" }
              },
              required: ["notes"]
            }
          },
          {
            name: "get_appointments",
            description: "Belirtilen g\xFCn\xFCn veya belirli bir hastan\u0131n randevular\u0131n\u0131 ve notlar\u0131n\u0131 sorgular.",
            parameters: {
              type: "OBJECT",
              properties: {
                date: { type: "STRING", description: "Sorgulanacak tarih (YYYY-MM-DD veya 27 Eyl\xFCl format\u0131nda). Belirtilmezse bug\xFCn al\u0131n\u0131r." },
                patientName: { type: "STRING", description: "Randevular\u0131 sorgulanacak hastan\u0131n ad\u0131 ve soyad\u0131 (iste\u011Fe ba\u011Fl\u0131)" }
              }
            }
          },
          {
            name: "create_reminder",
            description: "Hasta i\xE7in veya genel klinik i\xE7in yeni bir Tedavi veya \xD6deme hat\u0131rlat\u0131c\u0131s\u0131 olu\u015Fturur ve Bildirim & Hat\u0131rlatma Merkezi'ne (\u{1F514}) kaydeder.",
            parameters: {
              type: "OBJECT",
              properties: {
                patientName: { type: "STRING", description: "Hat\u0131rlat\u0131c\u0131n\u0131n ilgili oldu\u011Fu hastan\u0131n ad\u0131 soyad\u0131 (varsa)" },
                category: { type: "STRING", description: "Hat\u0131rlat\u0131c\u0131 kategorisi: treatment (tedavi/kontrol takibi), payment (\xF6deme/tahsilat takibi), general (genel hat\u0131rlatma)", enum: ["treatment", "payment", "general"] },
                note: { type: "STRING", description: 'Hat\u0131rlat\u0131lacak konu veya not (\xF6rn: "2. seans kanal dolgusu yap\u0131lacak", "5.000 TL kalan taksit hat\u0131rlat\u0131lacak" vb.)' },
                targetDate: { type: "STRING", description: "Hat\u0131rlat\u0131c\u0131n\u0131n hedef tarihi (YYYY-MM-DD veya 27 Eyl\xFCl vb.)" },
                leadDays: { type: "NUMBER", description: "Hedef tarihten ka\xE7 g\xFCn \xF6nce bildirim d\xFC\u015Fs\xFCn (varsay\u0131lan: 0 - hedef g\xFCn\xFCnde)" }
              },
              required: ["note", "targetDate"]
            }
          },
          {
            name: "get_reminders",
            description: "Sistemdeki bekleyen tedavi, \xF6deme ve genel hat\u0131rlat\u0131c\u0131lar\u0131 sorgular ve listeler.",
            parameters: {
              type: "OBJECT",
              properties: {
                patientName: { type: "STRING", description: "Filtrelenecek hasta ad\u0131 (iste\u011Fe ba\u011Fl\u0131)" },
                category: { type: "STRING", description: "Kategori filtresi: treatment, payment, general (iste\u011Fe ba\u011Fl\u0131)", enum: ["treatment", "payment", "general"] },
                date: { type: "STRING", description: "Tarih filtresi (YYYY-MM-DD veya 27 Eyl\xFCl vb.) (iste\u011Fe ba\u011Fl\u0131)" }
              }
            }
          },
          {
            name: "get_patient_balance",
            description: "Kay\u0131tl\u0131 bir hastan\u0131n toplam tedavi \xFCcretini, bug\xFCne kadar \xF6dedi\u011Fi toplam tutar\u0131, son \xF6demelerini ve kalan g\xFCncel bor\xE7/bakiye durumunu sorgular (Salt okunur bilgi ama\xE7l\u0131d\u0131r; sisteme \xF6deme girme veya silme yapmaz).",
            parameters: {
              type: "OBJECT",
              properties: {
                patientName: { type: "STRING", description: "Bor\xE7 ve bakiye durumu sorgulanacak hastan\u0131n ad\u0131 ve soyad\u0131" }
              },
              required: ["patientName"]
            }
          },
          {
            name: "search_patient",
            description: "Klinikte kay\u0131tl\u0131 bir hastay\u0131 ad\u0131, soyad\u0131, telefon numaras\u0131 veya T.C. kimlik numaras\u0131 ile arar; ileti\u015Fim, ya\u015F, kay\u0131t tarihi ve \xF6zet bakiye/randevu durumunu getirir.",
            parameters: {
              type: "OBJECT",
              properties: {
                query: { type: "STRING", description: 'Aranacak hastan\u0131n ad\u0131 soyad\u0131, telefon numaras\u0131 veya arama terimi (\xF6rn: "Berivan Peker", "Leyla Karag\xF6l", "0542...")' }
              },
              required: ["query"]
            }
          }
        ]
      }
    ];
    const geminiContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }]
    }));
    const availableModels = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.5-flash-lite"];
    const callGemini = async (reqPayload) => {
      var _a2;
      let lastErr = null;
      for (const m of availableModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
          const res = await $fetch(url, {
            method: "POST",
            body: reqPayload
          });
          if ((_a2 = res == null ? void 0 : res.candidates) == null ? void 0 : _a2[0]) return res;
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr || new Error("Gemini servisi \u015Fu anda yan\u0131t veremiyor.");
    };
    const geminiReqBody = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: geminiContents,
      tools
    };
    const initialResponse = await callGemini(geminiReqBody);
    const candidate = (_a = initialResponse == null ? void 0 : initialResponse.candidates) == null ? void 0 : _a[0];
    const candidateParts = ((_b = candidate == null ? void 0 : candidate.content) == null ? void 0 : _b.parts) || [];
    const functionCallParts = candidateParts.filter((p) => p.functionCall);
    if (functionCallParts.length === 0) {
      const replyText = candidateParts.map((p) => p.text || "").join("\n").trim();
      return {
        reply: replyText || "\u0130\u015Fleminizi anlayamad\u0131m, l\xFCtfen tekrar belirtiniz."
      };
    }
    const toolResults = [];
    for (const part of functionCallParts) {
      const { name: funcName, args: funcArgs } = part.functionCall;
      let toolResult = null;
      if (funcName === "create_appointment") {
        const pName = (funcArgs.patientName || "").trim();
        const pDate = normalizeDateStr(funcArgs.date, todayStr, calendarDate) || calendarDate || todayStr;
        const pTime = funcArgs.time || "10:00";
        const pProc = funcArgs.procedure || "Muayene";
        const pNotes = funcArgs.notes || "";
        let assignedDoctorId = doctor._id;
        let assignedDoctorName = doctor.name;
        if (funcArgs.doctorName) {
          const docUser = await findDoctorByName(funcArgs.doctorName);
          if (docUser) {
            assignedDoctorId = docUser._id;
            assignedDoctorName = docUser.name;
          }
        }
        let patientId = null;
        let patientPhone = "";
        let matchedPatientName = pName;
        if (pName) {
          const matchedPatients = await findMatchingPatients(pName, 1);
          if (matchedPatients.length > 0) {
            const existingPatient = matchedPatients[0];
            patientId = existingPatient._id;
            patientPhone = existingPatient.phone || "";
            matchedPatientName = existingPatient.fullName || `${existingPatient.firstName} ${existingPatient.lastName}`.trim();
          }
        }
        const newAppt = await Appointment.create({
          patientId,
          patientName: pName,
          patientPhone,
          date: pDate,
          time: pTime,
          procedure: pProc,
          notes: pNotes,
          status: "pending",
          doctorId: assignedDoctorId
        });
        const formattedDate = formatTurkishDateFull(pDate);
        toolResult = {
          success: true,
          appointmentId: newAppt._id,
          patientName: pName,
          date: pDate,
          formattedDate,
          time: pTime,
          procedure: pProc,
          message: `${pName} i\xE7in ${formattedDate} saat ${pTime}'e "${pProc}" randevusu (Hekim: ${assignedDoctorName}) ba\u015Far\u0131yla olu\u015Fturuldu.${patientId ? " (Kay\u0131tl\u0131 hasta e\u015Fle\u015Ftirildi)" : ""}`
        };
      } else if (funcName === "cancel_appointment") {
        const pName = (funcArgs.patientName || "").trim();
        const appts = await findTargetAppointments(funcArgs, todayStr, calendarDate);
        if (appts.length === 0) {
          toolResult = {
            success: false,
            error: `\u0130ptal edilecek randevu bulunamad\u0131.${pName ? ` ("${pName}" i\xE7in` : ""}${funcArgs.date ? ` ${funcArgs.date} tarihinde` : ""}${pName ? ")" : ""}`
          };
        } else if (appts.length === 1) {
          const target = appts[0];
          const updateData = { status: "cancelled" };
          if (funcArgs.notes) {
            updateData.notes = funcArgs.notes;
          }
          const updated = await Appointment.findByIdAndUpdate(target._id, updateData, { new: true });
          const name = target.patientId ? `${target.patientId.firstName} ${target.patientId.lastName}` : target.patientName || "\u0130simsiz";
          toolResult = {
            success: true,
            appointmentId: target._id,
            message: `${name} hastas\u0131n\u0131n ${target.date} saat ${target.time}'deki randevusu ba\u015Far\u0131yla \u0130PTAL ED\u0130LD\u0130${funcArgs.notes ? ` ve notuna "${funcArgs.notes}" yaz\u0131ld\u0131` : ""}.`
          };
        } else {
          const list = appts.map((a) => {
            const name = a.patientId ? `${a.patientId.firstName} ${a.patientId.lastName}` : a.patientName || "\u0130simsiz";
            return `\u2022 ${a.date} saat ${a.time} - ${name} (${a.procedure || "Muayene"}) [Durum: ${a.status}]`;
          }).join("\n");
          toolResult = {
            success: false,
            needClarification: true,
            message: `Birden fazla e\u015Fle\u015Fen randevu bulundu:
${list}
L\xFCtfen iptal etmek istedi\u011Finiz randevunun tarih veya saatini belirtiniz.`
          };
        }
      } else if (funcName === "delete_appointment") {
        const pName = (funcArgs.patientName || "").trim();
        const appts = await findTargetAppointments(funcArgs, todayStr, calendarDate);
        if (appts.length === 0) {
          toolResult = {
            success: false,
            error: `Silinecek randevu bulunamad\u0131.${pName ? ` ("${pName}" i\xE7in` : ""}${funcArgs.date ? ` ${funcArgs.date} tarihinde` : ""}${pName ? ")" : ""}`
          };
        } else if (appts.length === 1) {
          const target = appts[0];
          await Appointment.findByIdAndDelete(target._id);
          const name = target.patientId ? `${target.patientId.firstName} ${target.patientId.lastName}` : target.patientName || "\u0130simsiz";
          toolResult = {
            success: true,
            deletedAppointmentId: target._id,
            message: `${name} i\xE7in ${target.date} saat ${target.time}'deki "${target.procedure}" randevusu ba\u015Far\u0131yla sistemden silindi.`
          };
        } else {
          const list = appts.map((a) => {
            const name = a.patientId ? `${a.patientId.firstName} ${a.patientId.lastName}` : a.patientName || "\u0130simsiz";
            return `\u2022 ${a.date} saat ${a.time} - ${name} (${a.procedure || "Muayene"})`;
          }).join("\n");
          toolResult = {
            success: false,
            needClarification: true,
            message: `Birden fazla e\u015Fle\u015Fen randevu bulundu:
${list}
L\xFCtfen silmek istedi\u011Finiz randevunun tam tarihini veya saatini belirtiniz.`
          };
        }
      } else if (funcName === "update_appointment") {
        const appts = await findTargetAppointments(funcArgs, todayStr, calendarDate);
        if (appts.length === 0) {
          toolResult = {
            success: false,
            error: `G\xFCncellenecek randevu bulunamad\u0131.`
          };
        } else if (appts.length === 1) {
          const target = appts[0];
          const updates = {};
          if (funcArgs.newDate) updates.date = funcArgs.newDate;
          if (funcArgs.newTime) updates.time = funcArgs.newTime;
          if (funcArgs.newProcedure) updates.procedure = funcArgs.newProcedure;
          if (funcArgs.notes !== void 0) updates.notes = funcArgs.notes;
          if (funcArgs.status) updates.status = funcArgs.status;
          let docMsg = "";
          if (funcArgs.doctorName) {
            const docUser = await findDoctorByName(funcArgs.doctorName);
            if (docUser) {
              updates.doctorId = docUser._id;
              docMsg = `, \u0130lgili Hekim: ${docUser.name}`;
            } else {
              docMsg = ` ("${funcArgs.doctorName}" ad\u0131nda hekim bulunamad\u0131)`;
            }
          }
          const updated = await Appointment.findByIdAndUpdate(
            target._id,
            updates,
            { new: true }
          );
          const name = target.patientId ? `${target.patientId.firstName} ${target.patientId.lastName}` : target.patientName || "\u0130simsiz";
          toolResult = {
            success: true,
            appointmentId: target._id,
            message: `${name} hastas\u0131n\u0131n randevusu ba\u015Far\u0131yla g\xFCncellendi (Durum: ${(updated == null ? void 0 : updated.status) === "cancelled" ? "\u0130ptal Edildi" : updated == null ? void 0 : updated.status}, Not: "${(updated == null ? void 0 : updated.notes) || "Yok"}"${docMsg}, Tarih: ${updated == null ? void 0 : updated.date}, Saat: ${updated == null ? void 0 : updated.time}).`
          };
        } else {
          const list = appts.map((a) => {
            const name = a.patientId ? `${a.patientId.firstName} ${a.patientId.lastName}` : a.patientName || "\u0130simsiz";
            return `\u2022 ${a.date} saat ${a.time} - ${name} (${a.procedure || "Muayene"}) [Durum: ${a.status}]`;
          }).join("\n");
          toolResult = {
            success: false,
            needClarification: true,
            message: `Birden fazla randevu bulundu:
${list}
L\xFCtfen d\xFCzenlemek istedi\u011Finiz randevunun tarih veya saatini belirtiniz.`
          };
        }
      } else if (funcName === "update_appointment_notes") {
        const newNotes = funcArgs.notes !== void 0 ? String(funcArgs.notes) : "";
        const appts = await findTargetAppointments(funcArgs, todayStr, calendarDate);
        if (appts.length === 0) {
          toolResult = {
            success: false,
            error: `Notu g\xFCncellenecek randevu bulunamad\u0131.`
          };
        } else if (appts.length === 1) {
          const target = appts[0];
          const updated = await Appointment.findByIdAndUpdate(
            target._id,
            { notes: newNotes },
            { new: true }
          );
          const name = target.patientId ? `${target.patientId.firstName} ${target.patientId.lastName}` : target.patientName || "\u0130simsiz";
          toolResult = {
            success: true,
            appointmentId: target._id,
            message: `${name} i\xE7in ${target.date} saat ${target.time}'deki randevunun notu ba\u015Far\u0131yla g\xFCncellendi: "${newNotes}".`
          };
        } else {
          const list = appts.map((a) => {
            const name = a.patientId ? `${a.patientId.firstName} ${a.patientId.lastName}` : a.patientName || "\u0130simsiz";
            return `\u2022 ${a.date} saat ${a.time} - ${name} (${a.procedure || "Muayene"}) [Mevcut Not: ${a.notes || "Yok"}]`;
          }).join("\n");
          toolResult = {
            success: false,
            needClarification: true,
            message: `Birden fazla randevu bulundu:
${list}
L\xFCtfen notunu d\xFCzenlemek istedi\u011Finiz randevunun tarihini veya saatini belirtiniz.`
          };
        }
      } else if (funcName === "get_appointments") {
        const pName = (funcArgs.patientName || "").trim();
        let appts = [];
        let header = "";
        if (pName) {
          appts = await findTargetAppointments(funcArgs, todayStr, calendarDate);
          header = `"${pName}" i\xE7in`;
        } else {
          const targetDate = normalizeDateStr(funcArgs.date, todayStr, calendarDate) || calendarDate || todayStr;
          appts = await Appointment.find({ date: targetDate }).populate("patientId", "firstName lastName phone").populate("doctorId", "name username title").sort({ time: 1 }).lean();
          header = `${targetDate} tarihinde`;
        }
        if (appts.length === 0) {
          toolResult = {
            total: 0,
            message: `${header} planlanm\u0131\u015F randevu bulunmuyor.`
          };
        } else {
          const list = appts.map((a) => {
            var _a2;
            const name = a.patientId ? `${a.patientId.firstName} ${a.patientId.lastName}` : a.patientName || "\u0130simsiz";
            const docName = ((_a2 = a.doctorId) == null ? void 0 : _a2.name) ? ` [Hekim: ${a.doctorId.name}]` : "";
            const noteText = a.notes ? ` [Not: ${a.notes}]` : "";
            return `${a.date} ${a.time} - ${name} (${a.procedure || "\u0130\u015Flem belirtilmedi"})${docName}${noteText} [Durum: ${a.status}]`;
          });
          toolResult = {
            total: appts.length,
            appointments: list
          };
        }
      } else if (funcName === "create_reminder") {
        const pName = (funcArgs.patientName || "").trim();
        const rawTargetDate = funcArgs.targetDate || funcArgs.date;
        const pTargetDate = normalizeDateStr(rawTargetDate, todayStr, calendarDate) || calendarDate || todayStr;
        const leadDays = Number(funcArgs.leadDays) || 0;
        const category = funcArgs.category || "treatment";
        const note = (funcArgs.note || funcArgs.notes || "").trim();
        if (!note) {
          toolResult = {
            success: false,
            error: "Hat\u0131rlat\u0131c\u0131 notu bo\u015F olamaz. L\xFCtfen neyin hat\u0131rlat\u0131laca\u011F\u0131n\u0131 belirtiniz."
          };
        } else if (!pTargetDate) {
          toolResult = {
            success: false,
            error: "Hedef tarih belirlenemedi."
          };
        } else {
          let patientId = null;
          let patientPhone = "";
          let matchedPatientName = pName;
          if (pName) {
            const matchedPatients = await findMatchingPatients(pName, 1);
            if (matchedPatients.length > 0) {
              const existingPatient = matchedPatients[0];
              patientId = existingPatient._id;
              patientPhone = existingPatient.phone || "";
              matchedPatientName = existingPatient.fullName || `${existingPatient.firstName} ${existingPatient.lastName}`.trim();
            }
          }
          const reminderDate = calculateReminderDate(pTargetDate, leadDays);
          const newReminder = await Reminder.create({
            patientId,
            patientName: matchedPatientName,
            patientPhone,
            category,
            note,
            targetDate: pTargetDate,
            leadDays,
            reminderDate,
            status: "active",
            snoozedUntil: null,
            doctorId: doctor._id
          });
          const categoryLabel = category === "treatment" ? "Tedavi Takibi" : category === "payment" ? "\xD6deme / Tahsilat Takibi" : "Genel Hat\u0131rlatma";
          const formattedDate = formatTurkishDateFull(pTargetDate);
          toolResult = {
            success: true,
            reminderId: newReminder._id,
            patientName: matchedPatientName,
            category: categoryLabel,
            targetDate: pTargetDate,
            formattedDate,
            reminderDate,
            note,
            message: `${matchedPatientName ? `"${matchedPatientName}" i\xE7in ` : ""}${formattedDate} tarihine [${categoryLabel}] hat\u0131rlat\u0131c\u0131s\u0131 ba\u015Far\u0131yla kaydedildi:
\u2022 Konu / Not: "${note}"
\u2022 Hedef Tarih: ${formattedDate}
\u2022 Kay\u0131t: Bildirim & Hat\u0131rlatma Merkezi'ne (\u{1F514}) ba\u015Far\u0131yla i\u015Flendi.`
          };
        }
      } else if (funcName === "get_reminders") {
        const pName = (funcArgs.patientName || "").trim();
        const q = {
          doctorId: doctor._id,
          status: { $in: ["active", "completed"] }
        };
        if (funcArgs.category) {
          q.category = funcArgs.category;
        }
        if (funcArgs.date) {
          const normDate = normalizeDateStr(funcArgs.date, todayStr, calendarDate);
          if (normDate) {
            q.targetDate = normDate;
          }
        }
        if (pName) {
          const regex = makeTurkishRegex(pName);
          q.$or = [
            { patientName: regex },
            { note: regex }
          ];
        }
        const reminders = await Reminder.find(q).sort({ targetDate: 1 }).lean();
        if (reminders.length === 0) {
          toolResult = {
            total: 0,
            message: "Kriterlere uygun bekleyen hat\u0131rlat\u0131c\u0131 bulunamad\u0131."
          };
        } else {
          const list = reminders.map((r) => {
            const cat = r.category === "treatment" ? "Tedavi" : r.category === "payment" ? "\xD6deme" : "Genel";
            const pText = r.patientName ? `[Hasta: ${r.patientName}] ` : "";
            const formatted = formatTurkishDateFull(r.targetDate);
            return `\u2022 ${formatted} (${cat}): ${pText}"${r.note}" [Durum: ${r.status === "completed" ? "Tamamland\u0131" : "Aktif"}]`;
          });
          toolResult = {
            total: reminders.length,
            reminders: list,
            message: `Toplam ${reminders.length} hat\u0131rlat\u0131c\u0131 bulundu:
${list.join("\n")}`
          };
        }
      } else if (funcName === "get_patient_balance") {
        const rawName = (funcArgs.patientName || "").trim();
        const pName = cleanPatientSearchTerm(rawName) || rawName;
        if (!pName) {
          toolResult = {
            success: false,
            error: "L\xFCtfen bakiye ve bor\xE7 durumu sorgulanacak hastan\u0131n ad\u0131n\u0131 belirtiniz."
          };
        } else {
          const matchedPatients = await findMatchingPatients(pName, 5);
          if (matchedPatients.length === 0) {
            toolResult = {
              success: false,
              error: `"${pName}" ad\u0131nda kay\u0131tl\u0131 bir hasta bulunamad\u0131. L\xFCtfen ad\u0131 veya soyad\u0131n\u0131 kontrol ediniz.`
            };
          } else if (matchedPatients.length > 1 && !matchedPatients.some((p) => (p.fullName || "").toLowerCase() === pName.toLowerCase())) {
            const list = matchedPatients.map((p) => `\u2022 ${p.fullName || `${p.firstName} ${p.lastName}`} (Tel: ${p.phone || "Yok"})`).join("\n");
            toolResult = {
              success: false,
              needClarification: true,
              message: `Birden fazla benzer hasta kayd\u0131 bulundu:
${list}
L\xFCtfen hastan\u0131n tam ad\u0131n\u0131 veya telefon numaras\u0131n\u0131 belirterek tekrar sorunuz.`
            };
          } else {
            const patient = matchedPatients[0];
            const [treatmentAgg, paymentAgg, recentPayments] = await Promise.all([
              Treatment.aggregate([
                { $match: { patientId: patient._id } },
                { $group: { _id: null, totalFee: { $sum: "$fee" } } }
              ]),
              Payment.aggregate([
                { $match: { patientId: patient._id } },
                { $group: { _id: null, totalPaid: { $sum: "$amount" } } }
              ]),
              Payment.find({ patientId: patient._id }).sort({ date: -1, createdAt: -1 }).limit(3).lean()
            ]);
            const totalFee = Number((_c = treatmentAgg[0]) == null ? void 0 : _c.totalFee) || 0;
            const totalPaid = Number((_d = paymentAgg[0]) == null ? void 0 : _d.totalPaid) || 0;
            const balance = totalFee - totalPaid;
            const patientFullName = patient.fullName || `${patient.firstName} ${patient.lastName}`.trim();
            let debtStatusText = "";
            if (balance > 0) {
              debtStatusText = `${balance.toLocaleString("tr-TR")} TL Kalan Bor\xE7`;
            } else if (balance < 0) {
              debtStatusText = `${Math.abs(balance).toLocaleString("tr-TR")} TL Fazla \xD6deme / Alacak`;
            } else {
              debtStatusText = "0 TL (Borcu Yok, Hesap Kapal\u0131)";
            }
            const paymentsSummary = recentPayments.map((p) => {
              const mLabel = p.method === "card" ? "Kart" : p.method === "transfer" ? "Havale" : "Nakit";
              const pDateStr = p.date ? formatTurkishDateFull(p.date) : "Tarih belirtilmedi";
              return `\u2022 ${pDateStr}: ${Number(p.amount).toLocaleString("tr-TR")} TL (${mLabel})${p.notes ? ` - ${p.notes}` : ""}`;
            });
            toolResult = {
              success: true,
              patientName: patientFullName,
              phone: patient.phone || "Yok",
              totalFee,
              totalPaid,
              balance,
              debtStatusText,
              message: `\u{1F4B0} **${patientFullName} - Finansal Durum & Bakiye \xD6zeti**

\u2022 **Toplam Tedavi Tutar\u0131:** ${totalFee.toLocaleString("tr-TR")} TL
\u2022 **Bug\xFCne Kadar \xD6denen:** ${totalPaid.toLocaleString("tr-TR")} TL
\u2022 **Kalan G\xFCncel Bor\xE7:** **${debtStatusText}**
\u2022 **\u0130leti\u015Fim Telefonu:** ${patient.phone || "Kay\u0131tl\u0131 de\u011Fil"}
` + (paymentsSummary.length > 0 ? `
**Son Yap\u0131lan \xD6demeler:**
${paymentsSummary.join("\n")}` : "\n*(Hen\xFCz kay\u0131tl\u0131 bir \xF6deme bulunmuyor)*")
            };
          }
        }
      } else if (funcName === "search_patient") {
        const rawQuery = (funcArgs.query || funcArgs.patientName || "").trim();
        const query = cleanPatientSearchTerm(rawQuery) || rawQuery;
        if (!query) {
          toolResult = {
            success: false,
            error: "L\xFCtfen aranacak hasta ad\u0131, soyad\u0131 veya telefon numaras\u0131n\u0131 belirtiniz."
          };
        } else {
          const matchedPatients = await findMatchingPatients(query, 5);
          if (matchedPatients.length === 0) {
            toolResult = {
              success: false,
              total: 0,
              message: `"${query}" kriterine uygun kay\u0131tl\u0131 hasta bulunamad\u0131. L\xFCtfen ad\u0131 veya telefon numaras\u0131n\u0131 kontrol ediniz.`
            };
          } else {
            const patientSummaries = await Promise.all(
              matchedPatients.map(async (p) => {
                var _a2, _b2;
                const fullName = p.fullName || `${p.firstName} ${p.lastName}`.trim();
                const [treatmentAgg, paymentAgg, lastAppt] = await Promise.all([
                  Treatment.aggregate([
                    { $match: { patientId: p._id } },
                    { $group: { _id: null, totalFee: { $sum: "$fee" } } }
                  ]),
                  Payment.aggregate([
                    { $match: { patientId: p._id } },
                    { $group: { _id: null, totalPaid: { $sum: "$amount" } } }
                  ]),
                  Appointment.findOne({ patientId: p._id }).sort({ date: -1, time: -1 }).lean()
                ]);
                const totalFee = Number((_a2 = treatmentAgg[0]) == null ? void 0 : _a2.totalFee) || 0;
                const totalPaid = Number((_b2 = paymentAgg[0]) == null ? void 0 : _b2.totalPaid) || 0;
                const balance = totalFee - totalPaid;
                let balanceSummary = "Borcu Yok (0 TL)";
                if (balance > 0) {
                  balanceSummary = `${balance.toLocaleString("tr-TR")} TL Kalan Bor\xE7`;
                } else if (balance < 0) {
                  balanceSummary = `${Math.abs(balance).toLocaleString("tr-TR")} TL Alacak / Fazla \xD6deme`;
                }
                let lastApptText = "Ge\xE7mi\u015F randevu kayd\u0131 yok";
                if (lastAppt) {
                  lastApptText = `${formatTurkishDateFull(lastAppt.date)} saat ${lastAppt.time} (${lastAppt.procedure || "Muayene"}, Durum: ${lastAppt.status})`;
                }
                return {
                  patientId: p._id,
                  fullName,
                  phone: p.phone || "Yok",
                  tcNo: p.tcNo || "Yok",
                  balanceSummary,
                  lastApptText
                };
              })
            );
            const cards = patientSummaries.map((s) => {
              return `\u{1F464} **${s.fullName}**
\u2022 **Telefon:** ${s.phone}
` + (s.tcNo !== "Yok" ? `\u2022 **TC Kimlik No:** ${s.tcNo}
` : "") + `\u2022 **Cari/Bakiye Durumu:** ${s.balanceSummary}
\u2022 **Son Randevu:** ${s.lastApptText}`;
            }).join("\n\n---\n\n");
            toolResult = {
              success: true,
              total: patientSummaries.length,
              patients: patientSummaries,
              message: `\u{1F4CB} **${patientSummaries.length} Hasta Kayd\u0131 Bulundu:**

${cards}`
            };
          }
        }
      }
      toolResults.push({ name: funcName, result: toolResult });
    }
    const responseParts = functionCallParts.map((p) => {
      const funcName = p.functionCall.name;
      const matched = toolResults.find((r) => r.name === funcName);
      return {
        functionResponse: {
          name: funcName,
          response: (matched == null ? void 0 : matched.result) || { success: true }
        }
      };
    });
    const secondContents = [
      ...geminiContents,
      candidate.content,
      // Orijinal model cevabı (thoughtSignature'ları koruyarak)
      {
        role: "user",
        parts: responseParts
      }
    ];
    let finalReply = "";
    try {
      const followUpResponse = await callGemini({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: secondContents
      });
      const finalParts = ((_g = (_f = (_e = followUpResponse == null ? void 0 : followUpResponse.candidates) == null ? void 0 : _e[0]) == null ? void 0 : _f.content) == null ? void 0 : _g.parts) || [];
      finalReply = finalParts.map((p) => p.text || "").join("\n").trim();
    } catch (followUpErr) {
      console.warn("AI takip yan\u0131t\u0131 \xFCretilemedi, do\u011Frudan ara\xE7 sonu\xE7lar\u0131 iletiliyor:", followUpErr);
    }
    if (!finalReply) {
      finalReply = toolResults.map((r) => {
        var _a2, _b2;
        return ((_a2 = r.result) == null ? void 0 : _a2.message) || ((_b2 = r.result) == null ? void 0 : _b2.error);
      }).filter(Boolean).join("\n\n") || "\u0130\u015Fleminiz ba\u015Far\u0131yla tamamland\u0131.";
    }
    return {
      reply: finalReply
    };
  } catch (error) {
    console.error("AI Chat Hatas\u0131:", error);
    return {
      reply: `\u26A0\uFE0F Yapay zeka ile ileti\u015Fim kurulurken bir hata olu\u015Ftu: ${((_h = error == null ? void 0 : error.data) == null ? void 0 : _h.message) || error.message || "Bilinmeyen hata"}`
    };
  }
});

export default chat_post;

