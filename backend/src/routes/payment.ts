import { Router } from 'express';
import { paymentService } from '../services/paymentService';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get available payment plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await paymentService.getPlans();
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Create Razorpay order for one-time payment
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user?.uid;
    const userEmail = req.user?.email;
    const userName = req.user?.displayName;

    if (!userId || !userEmail) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const order = await paymentService.createOrder(
      planId,
      userId,
      userEmail,
      userName
    );

    res.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Create Razorpay subscription
router.post('/create-subscription', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user?.uid;
    const userEmail = req.user?.email;
    const userName = req.user?.displayName;

    if (!userId || !userEmail) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const subscription = await paymentService.createSubscription(
      planId,
      userId,
      userEmail,
      userName
    );

    res.json({ 
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Verify payment
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ error: 'Payment verification data is required' });
    }

    const verification = await paymentService.verifyPayment(paymentId, orderId, signature);

    if (verification.verified) {
      // Payment successful - update user subscription status
      // You can add logic here to update user's subscription in your database
      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        paymentId,
        orderId
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Webhook for Razorpay events
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Razorpay webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSignature !== signature) {
    console.error('Webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  // Handle the event
  switch (event.event) {
    case 'payment.captured':
      console.log('Payment captured:', event.payload.payment.entity.id);
      // Handle successful payment
      break;
    
    case 'subscription.activated':
      console.log('Subscription activated:', event.payload.subscription.entity.id);
      // Handle new subscription
      break;
    
    case 'subscription.charged':
      console.log('Subscription charged:', event.payload.subscription.entity.id);
      // Handle subscription renewal
      break;
    
    case 'subscription.cancelled':
      console.log('Subscription cancelled:', event.payload.subscription.entity.id);
      // Handle subscription cancellation
      break;
    
    default:
      console.log(`Unhandled event type ${event.event}`);
  }

  res.json({ received: true });
});

// Get user's subscriptions
router.get('/subscriptions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.uid;
    // In a real app, you'd store customer IDs in your database
    // For now, we'll return a placeholder
    res.json({ subscriptions: [] });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

export { router as paymentRoutes };
