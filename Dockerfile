# Use PHP 8.2 FPM as the base image
FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy environment file
# COPY .env.example .env
# RUN npm install
# RUN npm run build --force
# Generate key
# RUN php artisan key:generate
# RUN npm install && npm run build
# Expose port
EXPOSE 8000

# Start Laravel server
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
