import crypto from 'crypto';

const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const ESEWA_FORM_URL = process.env.ESEWA_FORM_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4000';

const toMoney = (value) => Number(value).toFixed(2);

export const createEsewaSignature = (fields) => {
  const signedPayload = fields.signed_field_names
    .split(',')
    .map((fieldName) => `${fieldName}=${fields[fieldName]}`)
    .join(',');

  return crypto.createHmac('sha256', ESEWA_SECRET_KEY).update(signedPayload).digest('base64');
};

export const decodeEsewaResponse = (encodedData) => {
  if (!encodedData) return null;
  try {
    return JSON.parse(Buffer.from(encodedData, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

export const initiateEsewaPayment = async (order, updateOrderStatus) => {
  if (order.payment_method !== 'wallet') {
    throw new Error('This order is not configured for eSewa payment');
  }

  const transactionUuid = `STYLEHER-${order._id}-${Date.now()}`;
  const amount = toMoney(order.total);
  
  const fields = {
    amount,
    tax_amount: '0.00',
    total_amount: amount,
    transaction_uuid: transactionUuid,
    product_code: ESEWA_PRODUCT_CODE,
    product_service_charge: '0.00',
    product_delivery_charge: '0.00',
    success_url: `${CLIENT_URL}/api/payments/esewa/success?orderId=${order._id}`,
    failure_url: `${CLIENT_URL}/api/payments/esewa/failure?orderId=${order._id}`,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
  };

  fields.signature = createEsewaSignature(fields);

  await updateOrderStatus({
    id: order._id,
    status: 'payment_started',
    payment_reference: transactionUuid,
  });

  return {
    formUrl: ESEWA_FORM_URL,
    fields,
  };
};

export const getEsewaFormUrl = () => ESEWA_FORM_URL;