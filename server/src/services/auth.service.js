import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/env.js';
import AppError from '../utils/AppError.js';

const generateAccessToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

const generateRefreshToken = (user) =>
  jwt.sign({ userId: user._id }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });

export const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password_hash });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refresh_tokens.push(refreshToken);
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refresh_tokens.push(refreshToken);
  if (user.refresh_tokens.length > 5) {
    user.refresh_tokens = user.refresh_tokens.slice(-5);
  }
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token required', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.refresh_tokens.includes(refreshToken)) {
    throw new AppError('Invalid refresh token', 401);
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refresh_tokens = user.refresh_tokens.filter((t) => t !== refreshToken);
  user.refresh_tokens.push(newRefreshToken);
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) return;

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
  } catch {
    return;
  }

  const user = await User.findById(decoded.userId);
  if (user) {
    user.refresh_tokens = user.refresh_tokens.filter((t) => t !== refreshToken);
    await user.save();
  }
};
