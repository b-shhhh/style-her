import { getUserById } from '../repositories/user.repository.js';

export const authenticateUser = async (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.body.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

export const requireAdmin = (req, res, next) => {
  // For now, we'll check if user has admin role
  // This can be extended to check for admin privileges
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};