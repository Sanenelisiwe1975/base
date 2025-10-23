// Payment verification system for premium analytics access
export interface PaymentRecord {
  address: string;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: number;
  expiresAt: number;
  status: 'pending' | 'confirmed' | 'expired';
}

export interface PremiumAccess {
  hasAccess: boolean;
  expiresAt?: number;
  daysRemaining?: number;
}

// In-memory storage for demo (in production, use a database)
const paymentRecords: Record<string, PaymentRecord[]> = {};

// Premium access costs $5 USDC and lasts 30 days
export const PREMIUM_PRICE = 5;
export const PREMIUM_DURATION_DAYS = 30;
export const PREMIUM_DURATION_MS = PREMIUM_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Record a payment for premium access
 */
export function recordPayment(
  address: string, 
  transactionId: string, 
  amount: number = PREMIUM_PRICE
): PaymentRecord {
  const now = Date.now();
  const payment: PaymentRecord = {
    address: address.toLowerCase(),
    transactionId,
    amount,
    currency: 'USDC',
    timestamp: now,
    expiresAt: now + PREMIUM_DURATION_MS,
    status: 'confirmed'
  };

  const userPayments = paymentRecords[address.toLowerCase()] || [];
  userPayments.push(payment);
  paymentRecords[address.toLowerCase()] = userPayments;

  return payment;
}

/**
 * Check if user has premium access
 */
export function checkPremiumAccess(address: string): PremiumAccess {
  if (!address) {
    return { hasAccess: false };
  }

  const userPayments = paymentRecords[address.toLowerCase()] || [];
  const now = Date.now();

  // Find the most recent valid payment
  const validPayment = userPayments
    .filter(payment => 
      payment.status === 'confirmed' && 
      payment.expiresAt > now &&
      payment.amount >= PREMIUM_PRICE
    )
    .sort((a, b) => b.expiresAt - a.expiresAt)[0];

  if (validPayment) {
    const daysRemaining = Math.ceil((validPayment.expiresAt - now) / (24 * 60 * 60 * 1000));
    return {
      hasAccess: true,
      expiresAt: validPayment.expiresAt,
      daysRemaining
    };
  }

  return { hasAccess: false };
}

/**
 * Get payment history for a user
 */
export function getPaymentHistory(address: string): PaymentRecord[] {
  return paymentRecords[address.toLowerCase()] || [];
}

/**
 * Simulate payment verification (in production, verify on-chain)
 */
export async function verifyPayment(transactionId: string): Promise<boolean> {
  // In production, you would:
  // 1. Query the Base blockchain for the transaction
  // 2. Verify it's a USDC payment of $5 to your address
  // 3. Confirm the transaction is confirmed
  
  // For demo purposes, we'll simulate verification
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Assume payment is valid
    }, 1000);
  });
}

/**
 * Initialize with some demo data for testing
 */
export function initializeDemoPayments() {
  // Add a demo payment that expires in 29 days for testing
  const demoAddress = "0x1234567890123456789012345678901234567890";
  const now = Date.now();
  
  const demoPayment: PaymentRecord = {
    address: demoAddress,
    transactionId: "demo-tx-123",
    amount: 5,
    currency: 'USDC',
    timestamp: now - (24 * 60 * 60 * 1000), // 1 day ago
    expiresAt: now + (29 * 24 * 60 * 60 * 1000), // 29 days from now
    status: 'confirmed'
  };
  
  paymentRecords[demoAddress] = [demoPayment];
}

// Initialize demo data
if (typeof window === 'undefined') {
  initializeDemoPayments();
}