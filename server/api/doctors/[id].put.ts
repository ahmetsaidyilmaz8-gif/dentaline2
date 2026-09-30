import { User } from '../../models/User';
import { requireDoctor, hashPassword } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const id = event.context.params?.id;
    const body = await readBody(event);

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Hekim ID zorunludur.'
      });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.email !== undefined) updateData.email = body.email.trim();
    if (body.type !== undefined) updateData.type = body.type;
    if (body.rate !== undefined) updateData.rate = Number(body.rate);
    if (body.role !== undefined) updateData.role = body.role;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? body.startDate.trim() : '';
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? body.endDate.trim() : '';
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.notes !== undefined) updateData.notes = body.notes ? body.notes.trim() : '';
    if (body.password) {
      updateData.password = hashPassword(body.password);
    }

    const updatedDoctor = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedDoctor) {
      throw createError({
        statusCode: 404,
        message: 'Hekim bulunamadı.'
      });
    }

    return updatedDoctor;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Hekim güncellenirken hata oluştu.'
    });
  }
});
