import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../models/userModel';
import { JWT_SECRET, SEND_GRID_API_KEY } from '../../config';

import sgMail from '@sendgrid/mail';
import { responseHandler } from '../../helpers/responseHandler';
import { z } from 'zod';
import { publicProcedure } from '../../trpc';

sgMail.setApiKey(SEND_GRID_API_KEY);

// Verify a password reset token and return the user's email address
const verifyPasswordResetToken = (token) => {
  const secret = JWT_SECRET;
  try {
    const decoded: any = jwt.verify(token, secret);
    return decoded.email;
  } catch (error) {
    console.error('Error verifying password reset token:', error);
    return null;
  }
};

export const handlePasswordReset = async (c) => {
  try {
    const { password } = c.req.json();
    const { token } = c.req.param();
    const email = verifyPasswordResetToken(token);
    const hashedPassword = bcrypt.hashSync(password, 10); // hash the password

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('No user found with this email address');
    }

    if (Date.now() > user.passwordResetTokenExpiration.getTime()) {
      throw new Error('Password reset token has expired');
    }

    await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiration: null,
      },
    );

    res.locals.data = { message: 'Password reset successful' };
    responseHandler(c);
  } catch (error) {
    console.error('Error resetting password:', error);
    return res
      .status(500)
      .send({ error: error.message || 'Internal server error' });
  }
};

export function handlePasswordResetRoute() {
  return publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async (opts) => {
      const { token } = opts.input;
      const email = verifyPasswordResetToken(token);
      const user = await User.findOne({ email });

      if (!user) {
        return { error: 'No user found with this email address' };
      }

      if (Date.now() > user.passwordResetTokenExpiration.getTime()) {
        return { error: 'Password reset token has expired' };
      }
    });
}
