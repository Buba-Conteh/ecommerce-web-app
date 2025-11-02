# Payment Integration Setup Guide

This guide will help you set up Stripe and PayPal payment integrations for the e-commerce system.

## Prerequisites

- PHP 8.2 or higher
- Composer installed
- Stripe account (https://stripe.com)
- PayPal Business account (https://www.paypal.com/business)

## Installation Steps

### 1. Install Required Packages

```bash
# Install Stripe PHP SDK (required)
composer require stripe/stripe-php

# Optional: Install Laravel Cashier for subscriptions/memberships
# NOTE: For one-time e-commerce purchases, Cashier is NOT required.
# Direct Stripe integration (already implemented) is better for your use case.
# Only install Cashier if you plan to add subscriptions later.
composer require laravel/cashier
```

**Important Decision**: 
- ✅ **Direct Stripe** (current implementation) = Best for e-commerce one-time purchases
- ✅ **Laravel Cashier** = Better for subscriptions/SaaS
- ✅ **Both can coexist** = Use direct for purchases, Cashier for subscriptions

See `CASHIER_VS_DIRECT.md` for detailed comparison.

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Stripe Configuration
STRIPE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_SANDBOX=true  # Set to false for production
PAYPAL_WEBHOOK_ID=your_webhook_id
```

### 3. Get Your API Keys

#### Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Click on "Developers" → "API keys"
3. Copy your "Publishable key" (starts with `pk_test_` or `pk_live_`)
4. Copy your "Secret key" (starts with `sk_test_` or `sk_live_`)
5. For webhooks: "Developers" → "Webhooks" → Create webhook endpoint → Copy signing secret

#### PayPal Keys

1. Go to https://developer.paypal.com/
2. Log in with your PayPal business account
3. Navigate to "Dashboard" → "My Apps & Credentials"
4. Create a new app or use an existing one
5. Copy "Client ID" and "Secret"
6. For webhooks: Dashboard → Webhooks → Create webhook

### 4. Set Up Webhooks

#### Stripe Webhook

1. In Stripe Dashboard, go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Enter your URL: `https://your-domain.com/api/payments/stripe/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the "Signing secret"

#### PayPal Webhook

1. In PayPal Developer Dashboard, go to "Webhooks"
2. Click "Create webhook"
3. Enter your URL: `https://your-domain.com/api/payments/paypal/webhook`
4. Select events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
5. Copy the webhook ID

### 5. Update Configuration File

Ensure your `config/services.php` includes:

```php
'stripe' => [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
],

'paypal' => [
    'client_id' => env('PAYPAL_CLIENT_ID'),
    'client_secret' => env('PAYPAL_CLIENT_SECRET'),
    'sandbox' => env('PAYPAL_SANDBOX', true),
    'webhook_id' => env('PAYPAL_WEBHOOK_ID'),
],
```

### 6. Enable Stripe Integration in Code

After installing the `stripe/stripe-php` package, uncomment the Stripe-related code in:

- `app/Http/Controllers/PaymentController.php`

Remove the placeholder code and uncomment the actual Stripe implementation.

### 7. Frontend Setup (React)

For the checkout page, you'll need to load Stripe.js:

#### Option A: Using CDN (Quick Setup)

Add to your `resources/views/app.blade.php`:

```html
@if(request()->routeIs('checkout'))
<script src="https://js.stripe.com/v3/"></script>
<script>
    window.Stripe = Stripe('{{ config('services.stripe.key') }}');
</script>
@endif
```

#### Option B: Using npm Package

```bash
npm install @stripe/stripe-js
```

Then update `resources/js/pages/checkout-improved/page.tsx`:

```typescript
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY)
```

Add to `.env`:
```
VITE_STRIPE_KEY=pk_test_your_publishable_key_here
```

### 8. Database Setup

Run migrations to ensure all payment tables exist:

```bash
php artisan migrate
```

### 9. Test the Integration

#### Test Stripe

1. Use test card numbers from: https://stripe.com/docs/testing
   - Success: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

2. Monitor webhooks in Stripe Dashboard → Developers → Webhooks

#### Test PayPal

1. Use sandbox test accounts from PayPal Developer Dashboard
2. Monitor transactions in PayPal Dashboard
3. Use test credit cards or PayPal test accounts

### 10. Production Checklist

Before going live:

- [ ] Change `PAYPAL_SANDBOX=false` in `.env`
- [ ] Update Stripe to live keys (`pk_live_` and `sk_live_`)
- [ ] Update webhook URLs to production domain
- [ ] Test complete payment flow in production mode
- [ ] Set up SSL certificate (HTTPS required)
- [ ] Configure proper error logging
- [ ] Set up monitoring for failed payments
- [ ] Review PCI compliance requirements
- [ ] Test refund process

## Routes Reference

### Stripe Routes

- `POST /api/payments/stripe/create-intent` - Create payment intent
- `POST /api/payments/stripe/confirm` - Confirm payment
- `POST /api/payments/stripe/webhook` - Webhook handler

### PayPal Routes

- `POST /api/payments/paypal/create-order` - Create PayPal order
- `POST /api/payments/paypal/capture` - Capture payment
- `GET /paypal/success` - Success callback
- `GET /paypal/cancel` - Cancel callback

## Troubleshooting

### Stripe Issues

- **"No such payment_intent"**: Ensure you're using the correct intent ID
- **Webhook signature verification failed**: Check `STRIPE_WEBHOOK_SECRET` is correct
- **API key errors**: Verify keys are from the same account (test/live)

### PayPal Issues

- **"Invalid access token"**: Check `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
- **"Webhook not received"**: Ensure webhook URL is publicly accessible and HTTPS
- **Sandbox vs Production**: Double-check `PAYPAL_SANDBOX` setting

## Security Notes

1. **Never commit** `.env` file to version control
2. **Use HTTPS** in production (required for PCI compliance)
3. **Validate** all webhook signatures
4. **Log** all payment transactions
5. **Implement** rate limiting on payment endpoints
6. **Store** sensitive data encrypted in database

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com/docs)
- [Laravel Cashier Documentation](https://laravel.com/docs/billing)
- [PCI Compliance Guide](https://www.pcisecuritystandards.org/)

## Support

For issues or questions:
- Check the application logs: `storage/logs/laravel.log`
- Review Stripe/PayPal dashboard for errors
- Ensure all environment variables are set correctly

