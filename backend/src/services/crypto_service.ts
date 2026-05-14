import crypto from 'crypto';

const ALGORITMO = 'aes-256-cbc';
const KEY = process.env.ENCRYPTION_KEY || 'abcd1234abcd1234abcd1234abcd1234';
const IV = process.env.ENCRYPTION_IV || '1234567890abcdef';

export const encryptLine = (texto: string): string => {
  const cipher = crypto.createCipheriv(ALGORITMO, Buffer.from(KEY), Buffer.from(IV));
  let encrypted = cipher.update(texto, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decipherLine = (textoCifrado: string): string => {
  try {
    const decipher = crypto.createDecipheriv(ALGORITMO, Buffer.from(KEY), Buffer.from(IV));
    let decrypted = decipher.update(textoCifrado, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return "ERROR_DECIPHER";
  }
};