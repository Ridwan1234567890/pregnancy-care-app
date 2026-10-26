// Paystack checkout (cards, bank transfer, USSD). The public key is safe to ship in the browser.
// Real money still needs a server to verify each payment (see README), so treat "paid" here as "Paystack said yes".
import { PAYSTACK_PUBLIC_KEY } from './config';

let loading = null;
const loadScript = () => {
  if (window.PaystackPop) return Promise.resolve();
  if (!loading) loading = new Promise((res, rej) => {
    const sc = document.createElement('script');
    sc.src = 'https://js.paystack.co/v1/inline.js'; sc.async = true;
    sc.onload = res; sc.onerror = () => { loading = null; rej(new Error('Could not load the payment window. Check your connection and try again.')); };
    document.head.appendChild(sc);
  });
  return loading;
};

export const paymentsEnabled = !!PAYSTACK_PUBLIC_KEY;

// amountNaira is in naira; Paystack wants kobo.
export async function payWithPaystack({ email, amountNaira, onSuccess, onClose }) {
  await loadScript();
  const ref = 'PC-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY, email, amount: Math.round(amountNaira * 100), currency: 'NGN', ref,
    callback: () => onSuccess(ref),
    onClose: () => onClose && onClose()
  });
  handler.openIframe();
}
