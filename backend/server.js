require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const Stripe = require('stripe');

const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) callback(null, true);
          else callback(new Error('Not allowed by CORS'));
    }
}));

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
          event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
          return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case 'checkout.session.completed':
              console.log('Checkout completed:', event.data.object.customer_email);
              break;
      case 'customer.subscription.deleted':
              console.log('Subscription cancelled');
              break;
    }
    res.json({ received: true });
});

app.use(express.json({ limit: '25mb' }));

app.get('/health', (req, res) => {
    res.json({ status: 'Amira is online', timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
    try {
          const { messages, systemPrompt } = req.body;
          if (!messages || !Array.isArray(messages)) {
                  return res.status(400).json({ error: 'Messages array required' });
          }
          const response = await client.messages.create({
                  model: 'claude-opus-4-6',
                  max_tokens: 1024,
                  system: systemPrompt,
                  messages,
          });
          res.json({ content: response.content[0].text });
    } catch (err) {
          console.error('Chat error:', err.message);
          res.status(500).json({ error: err.message });
    }
});


// ── Document Analysis ─────────────────────────────────────────────────────────
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });
    res.json({ content: response.content[0].text });
  } catch (err) {
    console.error('Document analysis error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stripe/create-checkout', async (req, res) => {
    try {
          const { userId, userEmail, planId } = req.body;
          const plans = {
                  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
                  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
          };
          const priceId = plans[planId];
          if (!priceId) return res.status(400).json({ error: 'Invalid plan' });
          const session = await stripe.checkout.sessions.create({
                  mode: 'subscription',
                  payment_method_types: ['card'],
                  customer_email: userEmail,
                  line_items: [{ price: priceId, quantity: 1 }],
                  metadata: { userId, planId },
                  success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
                  cancel_url: `${process.env.FRONTEND_URL}/upgrade?cancelled=true`,
                  allow_promotion_codes: true,
          });
          res.json({ url: session.url });
    } catch (err) {
          console.error('Checkout error:', err.message);
          res.status(500).json({ error: err.message });
    }
});

app.post('/api/stripe/billing-portal', async (req, res) => {
    try {
          const { customerId } = req.body;
          const session = await stripe.billingPortal.sessions.create({
                  customer: customerId,
                  return_url: `${process.env.FRONTEND_URL}/dashboard`,
          });
          res.json({ url: session.url });
    } catch (err) {
          res.status(500).json({ error: err.message });
    }
});

app.get('/api/stripe/subscription/:userId', async (req, res) => {
    try {
          const { userId } = req.params;
          const customers = await stripe.customers.search({
                  query: `metadata['userId']:'${userId}'`,
          });
          if (!customers.data.length) return res.json({ status: 'free', plan: 'free' });
          const customer = customers.data[0];
          const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: 'active' });
          if (!subscriptions.data.length) return res.json({ status: 'free', plan: 'free', customerId: customer.id });
          const sub = subscriptions.data[0];
          res.json({ status: 'active', plan: sub.metadata?.planId || 'pro_monthly', customerId: customer.id, subscriptionId: sub.id, currentPeriodEnd: sub.current_period_end });
    } catch (err) {
          res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Amira backend running on port ${PORT}`));
