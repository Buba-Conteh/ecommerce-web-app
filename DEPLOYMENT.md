# Deployment Guide for Render.com

This guide will help you deploy your Laravel + Inertia.js + React e-commerce application to Render.com using Docker.

## Prerequisites

- GitHub account
- Render.com account (sign up at https://render.com)
- Stripe account (for payments)
- PayPal Business account (for payments)

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### 1.2 Ensure All Files Are Committed

Make sure these files are in your repository:
- ✅ `Dockerfile`
- ✅ `docker-compose.yml`
- ✅ `render.yaml`
- ✅ `.dockerignore`
- ✅ `composer.json` and `composer.lock`
- ✅ `package.json` and `package-lock.json`
- ✅ All application code

## Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

## Step 3: Create PostgreSQL Database

Render supports PostgreSQL out of the box.

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configuration:
   - **Name**: `e-commerce-db`
   - **Database**: `e_commercce` (or your preferred name)
   - **User**: `laravel`
   - **Region**: Choose closest to your users (e.g., `Oregon`)
   - **PostgreSQL Version**: 16 (latest)
   - **Plan**: Starter (free tier) or Standard
3. Click **"Create Database"**
4. Copy the **Internal Database URL** (you'll need this)

## Step 4: Update Database Configuration

Since Render uses PostgreSQL by default, we need to update our configuration:

### Update `composer.json` (if not already present):

```json
"require": {
    "php": "^8.2",
    "ext-pgsql": "*",
    ...
}
```

### Update Dockerfile

The Dockerfile already includes PostgreSQL support:
```dockerfile
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql ...
```

### Update `render.yaml`

Change the database type:
```yaml
database:
  type: pspg  # PostgreSQL
```

## Step 5: Create Web Service

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will detect `render.yaml` and create services automatically
4. Review the configuration
5. Click **"Apply"**

OR manually create:

1. **"New +"** → **"Web Service"**
2. Configuration:
   - **Build Command**: (auto-filled from render.yaml)
   - **Start Command**: (auto-filled from render.yaml)
   - **Docker**: Leave empty (uses Dockerfile)
   - **Environment**: Docker
   - **Branch**: `main`
3. Click **"Create Web Service"**

## Step 6: Configure Environment Variables

In your Render Web Service dashboard:

### Required Variables

```env
APP_NAME=E-Commerce System
APP_ENV=production
APP_DEBUG=false
APP_KEY=  # Will be generated automatically
APP_URL=https://your-app-name.onrender.com

# Database (from PostgreSQL service)
DB_CONNECTION=pgsql  # Changed from mysql to pgsql
DB_HOST=  # Auto-filled from PostgreSQL service
DB_PORT=5432
DB_DATABASE=  # Auto-filled
DB_USERNAME=  # Auto-filled
DB_PASSWORD=  # Auto-filled

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Logging
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=info

# Mail
MAIL_MAILER=smtp
MAIL_HOST=  # Your SMTP host
MAIL_PORT=587
MAIL_USERNAME=  # Your SMTP username
MAIL_PASSWORD=  # Your SMTP password
MAIL_FROM_ADDRESS=noreply@yourdomain.com

# Payment Gateways
STRIPE_KEY=pk_live_your_key  # Production key
STRIPE_SECRET=sk_live_your_secret
STRIPE_WEBHOOK_SECRET=whsec_your_secret

PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_secret
PAYPAL_SANDBOX=false
```

### How to Add Variables

1. Go to your Web Service in Render
2. Click on **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add each variable one by one
5. Click **"Save Changes"**

Render will automatically redeploy after saving.

## Step 7: Database Migrations

Migrations run automatically on first deploy (see `startCommand` in render.yaml).

### Manual Migration

If you need to run migrations manually:

1. In Render Dashboard, go to your Web Service
2. Click **"Shell"** tab
3. Run:
```bash
php artisan migrate --force
```

### Seed Database

To seed with sample data:
```bash
php artisan db:seed --force
```

## Step 8: Configure Domains & SSL

1. In your Web Service dashboard
2. Go to **"Settings"** → **"Custom Domain"**
3. Add your custom domain (e.g., `yourdomain.com`)
4. Render automatically provisions SSL certificates

## Step 9: Set Up File Storage

For production, you should use S3 or another cloud storage.

### Option A: AWS S3

1. Create S3 bucket
2. Add credentials to environment variables:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
FILESYSTEM_DISK=s3
```

3. Update `.env` to use S3

### Option B: Render Persistent Disk

1. Create a Persistent Disk in Render
2. Mount it to your service:
```yaml
volumes:
  - type: persistentDisk
    name: storage
    mountPath: /var/www/html/storage
```

## Step 10: Configure Webhooks

### Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app-name.onrender.com/api/payments/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy signing secret to Render environment variables

### PayPal Webhook

1. Go to PayPal Developer Dashboard → Webhooks
2. Add endpoint: `https://your-app-name.onrender.com/api/payments/paypal/webhook`
3. Select events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
4. Copy webhook ID to Render environment variables

## Step 11: Enable SSR (Optional)

If you want Server-Side Rendering:

1. Create a Background Worker service in Render
2. Add SSR environment variables
3. Update Inertia configuration

## Step 12: Monitor & Debug

### View Logs

1. Go to your Web Service
2. Click **"Logs"** tab
3. View real-time logs

### Health Check

Your app has a health check endpoint: `https://your-app-name.onrender.com/health`

### Common Issues

1. **Build fails**: Check build logs for missing dependencies
2. **502 errors**: Check application logs, verify database connection
3. **Migrations fail**: Ensure database credentials are correct
4. **Assets not loading**: Check Vite configuration and build process

## Step 13: Performance Optimization

### Enable Redis (Optional)

1. Create Redis service in Render
2. Add Redis environment variables
3. Update `CACHE_STORE` and `SESSION_DRIVER` to redis

### Configure CDN

Use a CDN for static assets:
1. Cloudflare
2. AWS CloudFront
3. Render's built-in CDN

### Database Optimization

1. Add indexes to frequently queried columns
2. Use query caching
3. Optimize images

## Step 14: Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] Strong `APP_KEY` generated
- [ ] HTTPS enabled (automatic with Render)
- [ ] Database credentials secure
- [ ] Stripe/PayPal keys are production keys
- [ ] Webhook secrets configured
- [ ] File permissions correct
- [ ] CORS configured if needed
- [ ] Rate limiting enabled

## Step 15: Backup Strategy

### Database Backups

Render automatically backs up PostgreSQL databases:
1. Go to your Database service
2. Click **"Backups"** tab
3. Configure backup schedule

### Manual Backup

```bash
# In Render Shell
pg_dump $DATABASE_URL > backup.sql
```

## Local Development with Docker

```bash
# Build and start all services
docker-compose up -d

# Run migrations
docker exec -it e-commerce-app php artisan migrate

# Run seeders
docker exec -it e-commerce-app php artisan db:seed

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Update Deployment

To update your app:

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Render automatically deploys
```

Or manually trigger:
1. Go to your service in Render
2. Click **"Manual Deploy"**
3. Select branch and deploy

## Monitoring

### Render Dashboard

- View logs in real-time
- Monitor resource usage
- Check service health
- View deployment history

### External Monitoring

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry, Bugsnag)
- Set up analytics (Google Analytics)

## Troubleshooting

### Build Errors

1. Check Dockerfile syntax
2. Verify all dependencies in composer.json/package.json
3. Review build logs

### Runtime Errors

1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Check file permissions

### Database Errors

1. Verify connection string
2. Check database migrations ran
3. Verify database user permissions

### Payment Errors

1. Check Stripe/PayPal credentials
2. Verify webhook endpoints are accessible
3. Check webhook signature verification
4. Review payment logs

## Support

- Render Documentation: https://render.com/docs
- Laravel Documentation: https://laravel.com/docs
- Inertia.js Documentation: https://inertiajs.com

## Cost Estimation

Render Free Tier:
- 750 hours/month free (enough for light traffic)
- PostgreSQL: 90 days retention
- Redis: Not included

Suggested Starter Setup:
- Web Service: $7/month
- PostgreSQL: $7/month
- Redis (optional): $10/month
- **Total**: ~$14-24/month

## Next Steps

1. Set up custom domain
2. Configure email service (Mailgun, SendGrid)
3. Set up monitoring and alerts
4. Configure backups
5. Set up CI/CD pipeline
6. Add analytics
7. Implement error tracking

## Additional Resources

- [Render Pricing](https://render.com/pricing)
- [Laravel Deployment Guide](https://laravel.com/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

