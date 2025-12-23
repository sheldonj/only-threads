#!/bin/bash

# Migrate environment variables to Vercel
# Run this script interactively: ./scripts/migrate-env-to-vercel.sh

echo "This script will help you add environment variables to Vercel."
echo "You'll be prompted to enter the value for each variable."
echo ""

# Auth & Email
echo "=== Auth & Email ==="
vercel env add BETTER_AUTH_SECRET development preview production
vercel env add BETTER_AUTH_EMAIL development preview production
vercel env add RESEND_API_KEY development preview production
vercel env add ADMIN_EMAIL development preview production

# Test email (dev only)
echo ""
echo "=== Test Email (dev only) ==="
vercel env add TEST_EMAIL development

# Stripe
echo ""
echo "=== Stripe ==="
vercel env add STRIPE_SECRET_KEY development preview production
vercel env add STRIPE_WEBHOOK_SECRET development preview production

# App Config
echo ""
echo "=== App Config ==="
vercel env add NEXT_PUBLIC_APP_URL development preview production

echo ""
echo "=== Done! ==="
echo "Now run: vercel env pull .env.local"
echo "This will create .env.local with all your Vercel environment variables."

