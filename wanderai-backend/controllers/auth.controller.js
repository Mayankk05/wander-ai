import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { z } from 'zod';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/emailService.js';

import { 
  registerSchema, 
  loginSchema, 
  profileUpdateSchema, 
  passwordSchema 
} from '../lib/schemas.js';

const generateToken = () => crypto.randomBytes(32).toString('hex');

const signAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const createRefreshToken = async (userId) => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return prisma.refreshToken.create({
    data: { token, userId, expiresAt }
  });
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res, next) => {
  try {
    const data = req.validatedData?.body || req.body;
    const { name, password } = data;
    const email = data.email?.toLowerCase();
    
    if (!email) throw new Error("Email is required");

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        emailVerified: false
      },
    });

    // Link pre-existing invites
    try {
      await prisma.collaborator.updateMany({
        where: { 
          email: email, 
          userId: null 
        },
        data: { userId: user.id }
      });
    } catch (collabError) {
      req.log?.error({ err: collabError, email }, "Failed to link orphan collaborations during signup");
    }

    sendVerificationEmail(email, name, verificationToken).catch(err => {
      req.log?.error({ err }, "Background verification email failed");
    });

    const accessToken = signAccessToken(user.id);
    const refreshTokenRecord = await createRefreshToken(user.id);
    setTokenCookies(res, accessToken, refreshTokenRecord.token);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify.',
      user: { id: user.id, name: user.name, email: user.email, emailVerified: false },
      token: accessToken,
      ...(process.env.NODE_ENV !== 'production' && { debugToken: verificationToken })
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const dbError = new Error('Email already registered');
      dbError.statusCode = 400;
      return next(dbError);
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = req.validatedData?.body || req.body;
    const email = data.email.toLowerCase();
    const { password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      req.log.warn({ email }, "Login failed: User not found");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.log.warn({ email }, "Login failed: Password mismatch");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(user.id);
    const refreshTokenRecord = await createRefreshToken(user.id);
    setTokenCookies(res, accessToken, refreshTokenRecord.token);

    res.status(200).json({
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified },
      token: accessToken
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'Refresh token missing' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const refreshTokenRecord = await tx.refreshToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
        throw new Error("Invalid or expired token");
      }

      if (refreshTokenRecord.revoked) {
        await tx.refreshToken.updateMany({
          where: { userId: refreshTokenRecord.userId },
          data: { revoked: true }
        });
        throw new Error("Session compromised");
      }

      const user = refreshTokenRecord.user;
      const newAccessToken = signAccessToken(user.id);
      const newRefreshTokenRecord = await tx.refreshToken.create({
        data: { 
          token: generateToken(), 
          userId: user.id, 
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        }
      });

      await tx.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: { 
          revoked: true,
          replacedBy: newRefreshTokenRecord.token 
        }
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshTokenRecord.token };
    });

    setTokenCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    if (error.message === "Invalid or expired token" || error.message === "Session compromised") {
      error.statusCode = 401;
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { revoked: true }
      });
    }
  } catch (error) {
    req.log.error({ err: error }, "Logout session revocation failed");
    // Continue anyway to clear client cookies
  } finally {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired verification link" });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null }
    });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    req.log.error({ err: error }, "Email verification failed");
    next(error);
  }
};

export const verifyEmailWithLink = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) return res.status(400).send("Invalid link");

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null }
    });

    res.send(`<h1>Verified!</h1><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login">Login</a>`);
  } catch (error) {
    res.status(500).send("Error");
  }
};

export const sendVerifyLink = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.emailVerified) return res.status(400).json({ error: "Cannot send" });

    const token = generateToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token }
    });
    await sendVerificationEmail(user.email, user.name, token);
    res.status(200).json({ message: "Sent" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: "Check email" });

    const token = generateToken();
    const expiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry }
    });

    await sendPasswordResetEmail(user.email, user.name, token);
    res.status(200).json({ message: "Check email" });
  } catch (error) {
    req.log.error({ err: error }, "Forgot password failed");
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    const pwValidation = passwordSchema.safeParse(password);
    if (!pwValidation.success) {
      const err = new Error(pwValidation.error.issues[0].message);
      err.statusCode = 400;
      return next(err);
    }

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } }
    });

    if (!user) {
      const err = new Error("Invalid or expired reset token");
      err.statusCode = 400;
      return next(err);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        emailVerified: true,
        image: true,
        bio: true,
        location: true,
        createdAt: true 
      },
    });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        createdAt: true,
        _count: {
          select: { trips: true }
        }
      }
    });

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      profile: {
        ...user,
        stats: {
          totalTrips: user._count.trips,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const data = req.validatedData?.body || req.body;
    const { password, email, ...otherData } = data;
    const updateData = { ...otherData };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Reset verification if email changed
    const currentUser = await prisma.user.findUnique({ where: { id: req.userId } });
    if (email && email.toLowerCase() !== currentUser.email.toLowerCase()) {
      updateData.email = email.toLowerCase();
      updateData.emailVerified = false;
      
      const token = crypto.randomBytes(32).toString('hex');
      updateData.verificationToken = token;

      sendVerificationEmail(updateData.email, otherData.name || "User", token)
        .catch(err => req.log?.error({ err }, "Background verification email for profile update failed"));
    } else if (email) {
      updateData.email = email.toLowerCase();
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        emailVerified: true
      }
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const err = new Error("Email already in use");
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};
