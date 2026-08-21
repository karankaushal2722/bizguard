require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Admin client (service role key — server-side only, never expose to the frontend)
// used for account deletion. Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
const supabaseAdmin = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

const allowedOrigins = [
    'http://localhost:5173',
    'capacitor://localhost',
    'https://localhost',
    'https://bizguard.co',
    'https://www.bizguard.co',
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


// ── Document Analysis ──────────────────────────────────────────────────
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
          business_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
          business_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
          enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
          enterprise_yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
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

// ── Account Deletion (Apple Guideline 5.1.1(v)) ──────────────────────────────────────
// Authenticates the caller via their Supabase access token, then permanently
// deletes their profile row and their Supabase auth account.
app.delete('/api/account', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Account deletion is not configured on the server.' });
    }
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing authorization token.' });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid or expired session.' });
    const userId = userData.user.id;

    // Remove app data first, then the auth user itself.
    const { error: profileErr } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    if (profileErr) console.error('Profile delete error:', profileErr.message);

    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteErr) throw deleteErr;

    res.json({ success: true });
  } catch (err) {
    console.error('Account deletion error:', err.message);
    res.status(500).json({ error: 'Could not delete account. Please try again.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Amira backend running on port ${PORT}`));
