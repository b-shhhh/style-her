import { User } from '../models/User.js';

export const createUser = async ({ email, password, name, image }) => {
  const user = new User({ email, password, name, image });
  return await user.save();
};

export const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const updateUser = async (id, updates) => {
  return await User.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteUser = async (id) => {
  await User.findByIdAndDelete(id);
};