export default defineEventHandler(async (event) => {
  const clearCookieOptions = {
    maxAge: 0,
    path: '/'
  };

  deleteCookie(event, 'tenax_doctor_id', clearCookieOptions);
  deleteCookie(event, 'tenax_doctor_name', clearCookieOptions);
  deleteCookie(event, 'tenax_doctor_username', clearCookieOptions);
  deleteCookie(event, 'tenax_auth', clearCookieOptions);

  return {
    success: true,
    message: 'Başarıyla çıkış yapıldı.'
  };
});
