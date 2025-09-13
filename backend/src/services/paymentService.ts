import Razorpay from 'razorpay';

// Initialize Razorpay only if keys are available
let razorpay: Razorpay | null = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

// User Plans (Work Licensing)
export const userPlans: PaymentPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual writers',
    price: 99, // ₹99 per license
    currency: 'inr',
    interval: 'month',
    features: [
      '2 licenses per month',
      'Up to 1000 words per file',
      'License valid for 1 month',
      'Basic plagiarism detection',
      'PDF license generation',
      'Email support'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'For regular content creators',
    price: 499, // ₹499
    currency: 'inr',
    interval: 'month',
    popular: true,
    features: [
      '5 licenses per month',
      'Up to 2500 words per file',
      'License valid for 1 month',
      'Advanced plagiarism detection',
      'Priority PDF generation',
      'Email support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For serious content creators',
    price: 999, // ₹999
    currency: 'inr',
    interval: 'month',
    features: [
      'Up to 8000 words per file',
      'License valid for 1 month',
      'Advanced plagiarism detection',
      'Priority PDF generation',
      'Priority email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professional writers',
    price: 1999, // ₹1999
    currency: 'inr',
    interval: 'month',
    features: [
      'Max 25 licenses per month',
      'Unlimited words per file',
      'License valid for 1 month',
      'Advanced plagiarism detection',
      'Priority PDF generation',
      'Priority email support',
      'API access (1000 calls/month)'
    ]
  }
];

// API Plans (For Developers)
export const apiPlans: PaymentPlan[] = [
  {
    id: 'api-starter',
    name: 'API Starter',
    description: 'For developers getting started',
    price: 999, // ₹999
    currency: 'inr',
    interval: 'month',
    features: [
      '500 API calls per month',
      'License verification API',
      'Webhook support',
      'Email support',
      'Documentation access'
    ]
  },
  {
    id: 'api-unlimited',
    name: 'API Unlimited',
    description: 'For high-volume integrations',
    price: 1999, // ₹1999
    currency: 'inr',
    interval: 'month',
    features: [
      'Unlimited API calls',
      'License verification API',
      'Webhook support',
      'Priority email support',
      'Full documentation access',
      'Custom integrations support'
    ]
  }
];

// Combined plans for display
export const paymentPlans: PaymentPlan[] = [
  ...userPlans,
  ...apiPlans
];

export const paymentService = {
  async createOrder(
    planId: string,
    userId: string,
    userEmail: string,
    userName?: string
  ) {
    if (!razorpay) {
      throw new Error('Payment service not configured. Please set Razorpay credentials.');
    }

    const plan = paymentPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    const options = {
      amount: plan.price * 100, // Razorpay expects amount in paise
      currency: plan.currency.toUpperCase(),
      receipt: `order_${Date.now()}_${userId}`,
      notes: {
        userId,
        planId,
        userEmail,
        userName: userName || 'User',
        planName: plan.name,
      },
    };

    const order = await razorpay!.orders.create(options);
    return order;
  },

  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature === signature) {
      return { verified: true };
    } else {
      return { verified: false };
    }
  },

  async createSubscription(
    planId: string,
    userId: string,
    userEmail: string,
    userName?: string
  ) {
    if (!razorpay) {
      throw new Error('Payment service not configured. Please set Razorpay credentials.');
    }

    const plan = paymentPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    // For Razorpay, we'll create a plan first, then subscription
    const razorpayPlan = await razorpay!.plans.create({
      period: plan.interval === 'month' ? 'monthly' : 'yearly',
      interval: 1,
      item: {
        name: `${plan.name} Plan - ISOWS-INDIA`,
        description: plan.description,
        amount: plan.price * 100,
        currency: plan.currency.toUpperCase(),
      },
    });

    const subscription = await razorpay!.subscriptions.create({
      plan_id: razorpayPlan.id,
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months subscription
      notes: {
        userId,
        planId,
        userEmail,
        userName: userName || 'User',
      },
    });

    return subscription;
  },

  async getSubscription(subscriptionId: string) {
    if (!razorpay) {
      throw new Error('Payment service not configured. Please set Razorpay credentials.');
    }
    return await razorpay!.subscriptions.fetch(subscriptionId);
  },

  async cancelSubscription(subscriptionId: string) {
    if (!razorpay) {
      throw new Error('Payment service not configured. Please set Razorpay credentials.');
    }
    return await razorpay!.subscriptions.cancel(subscriptionId);
  },

  async getCustomerSubscriptions(customerId: string) {
    if (!razorpay) {
      throw new Error('Payment service not configured. Please set Razorpay credentials.');
    }
    return await razorpay!.subscriptions.all({
      // Note: customer_id filter may not be available in all Razorpay API versions
      // You might need to filter results manually
    });
  },

  async createCustomer(email: string, name?: string) {
    if (!razorpay) {
      throw new Error('Payment service not configured. Please set Razorpay credentials.');
    }
    return await razorpay!.customers.create({
      email,
      name: name || 'User',
    });
  },

  async getPayment(paymentId: string) {
    if (!razorpay) {
      throw new Error('Payment service not configured. Please set Razorpay credentials.');
    }
    return await razorpay!.payments.fetch(paymentId);
  },

  async getPlans(): Promise<PaymentPlan[]> {
    return paymentPlans;
  },

  async getPlan(planId: string): Promise<PaymentPlan | null> {
    return paymentPlans.find(p => p.id === planId) || null;
  }
};
