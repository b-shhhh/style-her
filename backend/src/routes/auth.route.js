import express from 'express';
import { registerUser, loginUser, updateUserProfile, deleteUserProfile } from '../services/auth.service.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { email, password, name, phone, image } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  try {
    const user = await registerUser({ email, password, name, phone, image });
    res.status(201).json(user);
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await loginUser({ email, password });
    res.json(user);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  const { userId, name, email, phone, address, image } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const updated = await updateUserProfile(userId, { name, email, phone, address, image });
    res.json(updated);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Delete user profile
router.delete('/profile', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    await deleteUserProfile(userId);
    res.status(204).end();
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to delete profile' });
  }
});

export default router;