
/**
 * Paystack payment integration for Pregnant Care.
 * Uses real Paystack checkout when a public key is configured.
 * Never put your secret key in frontend code.
 */

import { PAYSTACK_PUBLIC_KEY } from './config';

let loading = null;

const loadScript = () => {
  if (window.PaystackPop) {
    return Promise.resolve();
  }

  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = resolve;

      script.onerror = () => {
        loading = null;
        reject(
          new Error(
            'Could not load Paystack. Check your internet connection and try again.'
          )
        );
      };

      document.head.appendChild(script);
    });
  }

  return loading;
};

export const paymentsEnabled = Boolean(PAYSTACK_PUBLIC_KEY);

export const METHOD_LABEL = {
  card: 'Card',
  transfer: 'Bank transfer',
  ussd: 'USSD',
};

const CHANNELS = {
  card: ['card'],
  transfer: ['bank_transfer'],
  ussd: ['ussd'],
};

export const newRef = () =>
  'PC-' +
  Date.now() +
  '-' +
  Math.random().toString(36).slice(2, 8).toUpperCase();

export async function payWithPaystack({
  email,
  amountNaira,
  method,
  reference,
  onSuccess,
  onClose,
}) {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error(
      'Paystack is not configured. Add your public key to .env.local.'
    );
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please provide a valid email address.');
  }

  if (!Number.isFinite(Number(amountNaira)) || Number(amountNaira) <= 0) {
    throw new Error('The payment amount must be greater than zero.');
  }

  await loadScript();

  const ref = reference || newRef();

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: Math.round(Number(amountNaira) * 100),
    currency: 'NGN',
    ref,
    ...(CHANNELS[method] ? { channels: CHANNELS[method] } : {}),

    callback: (response) => {
      onSuccess?.({
        reference: response.reference || ref,
      });
    },

    onClose: () => {
      onClose?.();
    },
  });

  handler.openIframe();
}

export const creditFor = (state, patientId, doctorId) =>
  (state.payments || []).find(
    (payment) =>
      payment.patientId === patientId &&
      payment.doctorId === doctorId &&
      !payment.usedBy
  );
