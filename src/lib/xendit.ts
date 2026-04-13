import { Xendit } from 'xendit-node';

// We initialize the SDK with secret key.
export const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || 'xnd_development_dummy_key_please_replace',
});

// For QR Code creation we can use qrCode endpoint from xendit-node
export const { QrCode } = xenditClient;
