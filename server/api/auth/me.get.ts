import { getDoctorFromEvent } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const doctor = await getDoctorFromEvent(event);
  if (!doctor) {
    return {
      authenticated: false,
      user: null
    };
  }

  return {
    authenticated: true,
    user: {
      id: (doctor as any)._id.toString(),
      username: (doctor as any).username,
      name: (doctor as any).name,
      title: (doctor as any).title || 'Diş Hekimi',
      role: (doctor as any).role
    }
  };
});
