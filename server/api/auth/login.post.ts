import { User } from '../../models/User';
import { normalizeUsername, verifyPassword } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const rawUsername = body?.username || '';
    const password = body?.password || '';

    if (!rawUsername || !password) {
      throw createError({
        statusCode: 400,
        message: 'Kullanıcı adı ve şifre gereklidir.'
      });
    }

    const username = normalizeUsername(rawUsername);
    const user = await User.findOne({ username });

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Kullanıcı adı veya şifre hatalı!'
      });
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      throw createError({
        statusCode: 401,
        message: 'Kullanıcı adı veya şifre hatalı!'
      });
    }

    const doctorId = user._id.toString();
    const cookieOptions = {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production'
    };

    setCookie(event, 'tenax_doctor_id', doctorId, cookieOptions);
    setCookie(event, 'tenax_doctor_name', user.name, cookieOptions);
    setCookie(event, 'tenax_doctor_username', user.username, cookieOptions);
    setCookie(event, 'tenax_auth', 'logged_in', cookieOptions);

    return {
      success: true,
      user: {
        id: doctorId,
        username: user.username,
        name: user.name,
        title: user.title || 'Diş Hekimi',
        role: user.role
      }
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Giriş yapılırken bir hata oluştu.'
    });
  }
});
