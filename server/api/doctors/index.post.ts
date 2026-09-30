import { User } from '../../models/User';
import { requireDoctor, normalizeUsername, hashPassword } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const body = await readBody(event);

    if (!body.name) {
      throw createError({
        statusCode: 400,
        message: 'Hekim adı zorunludur.'
      });
    }

    const username = body.username
      ? normalizeUsername(body.username)
      : normalizeUsername(body.name.replace(/\s+/g, '').toLowerCase());

    const existing = await User.findOne({ username });
    if (existing) {
      throw createError({
        statusCode: 400,
        message: `"${username}" kullanıcı adına sahip bir kullanıcı zaten mevcut.`
      });
    }

    const rawPassword = body.password || '123456';
    const hashedPassword = hashPassword(rawPassword);

    const newDoctor = new User({
      name: body.name.trim(),
      username,
      password: hashedPassword,
      title: body.title ? body.title.trim() : 'Diş Hekimi',
      role: body.role || 'doctor',
      phone: body.phone ? body.phone.trim() : '',
      email: body.email ? body.email.trim() : '',
      type: body.type || 'percentage',
      rate: body.rate !== undefined ? Number(body.rate) : 30,
      startDate: body.startDate ? body.startDate.trim() : '',
      endDate: body.endDate ? body.endDate.trim() : '',
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      notes: body.notes ? body.notes.trim() : ''
    });

    await newDoctor.save();

    const result = newDoctor.toObject();
    delete (result as any).password;
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Hekim kaydedilirken hata oluştu.'
    });
  }
});
