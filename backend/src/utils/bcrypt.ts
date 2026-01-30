import bcrypt from 'bcryptjs';
import { logger } from '@/utils/logger';

export const hash = async (password: string, saltRounds: number = 12): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

export const compare = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    logger.error('Error comparing passwords:', error);
    throw new Error('Failed to compare passwords');
  }
};

export const generateSalt = async (saltRounds: number = 12): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return salt;
  } catch (error) {
    logger.error('Error generating salt:', error);
    throw new Error('Failed to generate salt');
  }
};

export default { hash, compare, generateSalt };
