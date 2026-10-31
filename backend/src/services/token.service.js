import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const tokenOptions = {
  issuer: 'beauty-oil-market',
  audience: 'beauty-oil-market-web',
};

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    env.jwtSecret,
    {
      ...tokenOptions,
      expiresIn: env.jwtExpiresIn,
    },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret, tokenOptions);
}

export function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: env.cookieMaxAgeMs,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
  });
}
