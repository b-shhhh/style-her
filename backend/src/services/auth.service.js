import { createUser, getUserByEmail, getUserById, updateUser, deleteUser } from '../repositories/user.repository.js';

export const registerUser = async ({ email, password, name, phone }) => {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error('User already exists');
  }
  const user = await createUser({ email, password, name, phone });
  return { id: user._id, email: user.email, name: user.name, phone: user.phone };
};

export const loginUser = async ({ email, password }) => {
  const user = await getUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }
  return { id: user._id, email: user.email, name: user.name, phone: user.phone, address: user.address };
};

export const updateUserProfile = async (userId, updates) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const updated = await updateUser(userId, updates);
  return { id: updated._id, email: updated.email, name: updated.name, phone: updated.phone, address: updated.address };
};

export const deleteUserProfile = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  await deleteUser(userId);
};