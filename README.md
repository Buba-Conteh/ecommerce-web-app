# E-Commerce System

A modern, full-featured e-commerce platform built with Laravel, Inertia.js, React, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- ✅ Product catalog with categories, brands, and tags
- ✅ Shopping cart with persistent storage
- ✅ Secure checkout process
- ✅ Order management
- ✅ User authentication
- ✅ Admin dashboard for product management

### Payment Integration
- ✅ Stripe payment processing
- ✅ PayPal integration
- ✅ Secure payment handling
- ✅ Webhook support
- ✅ Transaction logging

### Technical Stack
- **Backend**: Laravel 12, PHP 8.2
- **Frontend**: React 19, Inertia.js, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: MySQL/PostgreSQL
- **Deployment**: Docker + Render.com

## 📦 Quick Start

### Local Development with Docker

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Navigate to project directory
cd e-commerce-system

# Start all services
docker-compose up -d

# Install dependencies
docker exec -it e-commerce-app composer install
docker exec -it e-commerce-app npm install

# Run migrations
docker exec -it e-commerce-app php artisan migrate

# Seed database (optional)
docker exec -it e-commerce-app php artisan db:seed

# Visit the app
# http://localhost:8000
```

### Without Docker

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Build assets
npm run dev

# Start the server
php artisan serve
```

## 🌐 Deploy to Render.com

See **[QUICK_START_DEPLOYMENT.md](QUICK_START_DEPLOYMENT.md)** for a 10-minute deployment guide.

1. Push code to GitHub
2. Connect repository to Render
3. Render auto-detects `render.yaml`
4. Add environment variables
5. Deploy!

For detailed instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**

## 🔧 Configuration

### Environment Variables

Copy `env.production.example` to `.env` and configure:

```env
# App Settings
APP_NAME=E-Commerce System
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=e_commercce
DB_USERNAME=root
DB_PASSWORD=

# Payment Gateways
STRIPE_KEY=pk_test_your_key
STRIPE_SECRET=sk_test_your_secret
STRIPE_WEBHOOK_SECRET=whsec_your_secret

PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_SANDBOX=true
```

### Payment Setup

See **[PAYMENT_SETUP.md](PAYMENT_SETUP.md)** for detailed payment gateway configuration.

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[QUICK_START_DEPLOYMENT.md](QUICK_START_DEPLOYMENT.md)** - Fast deployment guide
- **[PAYMENT_SETUP.md](PAYMENT_SETUP.md)** - Payment integration guide
- **[CASHIER_VS_DIRECT.md](CASHIER_VS_DIRECT.md)** - Payment method comparison
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[E-COMMERCE_DATABASE_SCHEMA.md](E-COMMERCE_DATABASE_SCHEMA.md)** - Database documentation

## 🗂️ Project Structure

```
e-commerce-system/
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/ProductController.php
│   │   ├── PaymentController.php (Stripe)
│   │   └── PayPalController.php
│   └── Models/
│       ├── Product.php
│       ├── Order.php
│       ├── Cart.php
│       └── Payment.php
├── resources/
│   ├── js/pages/
│   │   ├── admin/products/page.tsx
│   │   ├── checkout-improved/page.tsx
│   │   └── ...
│   └── views/app.blade.php
├── docker/
│   ├── nginx.conf
│   ├── php-fpm.conf
│   └── supervisord.conf
├── Dockerfile
├── docker-compose.yml
├── render.yaml
└── routes/web.php
```

## 🧪 Testing

```bash
# Run PHP tests
php artisan test

# Run with coverage
php artisan test --coverage
```

## 🐳 Docker Commands

```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Access container shell
docker exec -it e-commerce-app bash
```

## 🔐 Security

- ✅ CSRF protection
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Secure password hashing
- ✅ HTTPS enforcement
- ✅ Environment-based configuration
- ✅ Secure API key storage
- ✅ Webhook signature verification

## 📊 Admin Features

### Product Management
- Create/edit/delete products
- Upload multiple images
- Set primary images
- Manage categories and brands
- Add tags
- Track inventory

### Order Management
- View all orders
- Update order status
- Track shipments
- Process refunds

## 🛒 Customer Features

- Browse products by category
- Search functionality
- Add to cart
- Secure checkout
- Multiple payment methods
- Order tracking
- User dashboard

## 🚀 Performance

- Asset optimization
- Database indexing
- Query caching
- Gzip compression
- CDN ready
- Redis support

## 📞 Support

- **Issues**: Open an issue on GitHub
- **Documentation**: See the `docs/` folder
- **Laravel**: https://laravel.com/docs
- **Inertia.js**: https://inertiajs.com

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE.md).

## 🎯 Roadmap

- [ ] User reviews and ratings
- [ ] Wishlist functionality
- [ ] Subscription products (monthly boxes)
- [ ] Email notifications
- [ ] Order tracking integration
- [ ] Multi-currency support
- [ ] Inventory alerts
- [ ] Advanced analytics

## 🙏 Acknowledgments

- Laravel framework
- Inertia.js
- React
- Tailwind CSS
- Stripe
- PayPal

---

**Built with ❤️ using modern web technologies**

