import mongoose from 'mongoose';

export const createObjectIdFromSting = (
  id: string,
): mongoose.Types.ObjectId | null => {
  try {
    // Отлавливаем ошибку, когда в ID передается неверные данные
    // Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer
    // BSONError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer
    return new mongoose.Types.ObjectId(id);
  } catch (e) {
    return null;
  }
};
