const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Stripe配置
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 中间件
app.use(cors());
app.use(express.json());

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'Amazon Clone Backend API is running!' });
});

// 创建支付Intent
app.post('/payments/create', async (req, res) => {
  try {
    const { total } = req.query;
    
    if (!total) {
      return res.status(400).json({ error: 'Total amount is required' });
    }

    // 创建PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(total), // 金额（分）
      currency: 'usd',
      metadata: {
        integration_check: 'accept_a_payment'
      }
    });

    res.json({
      client_secret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message 
    });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📝 API endpoint: http://localhost:${port}/payments/create`);
});
