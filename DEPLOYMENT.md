# בִּינָה Deployment Guide

**How to deploy the Binah platform to production.**

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Build Verification](#build-verification)
3. [Deployment Options](#deployment-options)
4. [Vercel Deployment](#vercel-deployment-recommended)
5. [Self-Hosted Deployment](#self-hosted-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Rollback](#monitoring--rollback)
9. [Performance Optimization](#performance-optimization)
10. [Security Checklist](#security-checklist)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No ESLint errors: `npm run lint`
- [ ] All tests passing: `npm test`
- [ ] No console warnings/errors
- [ ] Code reviewed by team member

### Dependencies

- [ ] All dependencies updated: `npm update`
- [ ] No security vulnerabilities: `npm audit`
- [ ] `package-lock.json` committed to git

### Documentation

- [ ] README.md updated
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment steps clear

### Performance

- [ ] Build output < 200KB gzipped
- [ ] Lighthouse score 90+
- [ ] Core Web Vitals green
- [ ] No layout shift issues (CLS < 0.1)

### Features

- [ ] All screens implemented
- [ ] Animations test at 60fps
- [ ] Mobile responsive verified
- [ ] RTL direction verified (Hebrew)
- [ ] No dead links

### Data & API

- [ ] All API endpoints working
- [ ] Authentication tested
- [ ] Error handling verified
- [ ] Rate limiting configured
- [ ] Database backups ready

---

## Build Verification

### Local Build Test

```bash
# Clean previous build
rm -rf .next

# Build for production
npm run build

# Verify build output
echo "Build size:"
du -sh .next/standalone
du -sh .next/static

# Run production build locally
npm run start

# Test at http://localhost:3000
```

### Expected Output

```
$ npm run build
▲ Next.js 15.0.0

Creating an optimized production build ...
Compiled successfully.

Linting source files ...
✓ All files linted successfully

Route (app)                              Size     First Load JS
┌ ○ /                                  3.5 kB       152 kB
├ ○ /api/health                        0 B           0 B
├ ○ /404                               3.2 kB       155 kB
└ ○ /500                               3.2 kB       155 kB

First Load JS shared by all            149 kB
  chunks (web)/layout                  25.3 kB
  chunks (web)/page                    3.5 kB

○ (Static) Prerendered as static HTML
```

### Performance Audit

```bash
# Run Lighthouse audit
npm run build
npm run start

# In another terminal:
# Visit http://localhost:3000
# Open DevTools (F12)
# Lighthouse tab → Generate report
# Target: Score 90+
```

---

## Deployment Options

### Recommended: Vercel (Easiest)

- ✅ Zero-config Next.js deployment
- ✅ Automatic CI/CD from GitHub
- ✅ Edge Functions support
- ✅ Automatic scaling
- ✅ Free tier available
- ⏱️ Deployment time: < 2 minutes

### Alternative: Docker + Self-Hosted

- ✅ Full control over infrastructure
- ✅ Private deployment option
- ❌ Requires DevOps knowledge
- ❌ More manual setup
- ⏱️ Deployment time: 5-15 minutes

### Alternative: AWS / GCP / Azure

- ✅ Enterprise-grade infrastructure
- ✅ Advanced scaling options
- ❌ Complex configuration
- ❌ Higher cost
- ⏱️ Deployment time: 15-30 minutes

---

## Vercel Deployment (Recommended)

### Step 1: Prepare Repository

```bash
# Ensure all changes committed
git add .
git commit -m "Prepare for production deployment"

# Push to GitHub (required for Vercel)
git push origin main
```

### Step 2: Create Vercel Account

1. Visit https://vercel.com/signup
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### Step 3: Deploy Project

#### Option A: Via Vercel Dashboard (Easiest)

1. Visit https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your repository (binah / ai-ios)
4. Click "Import"
5. Vercel detects Next.js automatically
6. Configure environment variables (see below)
7. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy (first time)
vercel

# Follow prompts:
# - Select account
# - Select project directory
# - Build settings (auto-detected)
# - Environment variables

# Deploy to production
vercel --prod

# Deploy to staging
vercel --prod=false
```

### Step 4: Configure Environment Variables

In Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add environment variables:

```env
# Database & API (example)
NEXT_PUBLIC_API_URL=https://binah.yourdomain.com/api
DATABASE_URL=postgresql://user:pass@host/dbname
API_SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# Analytics & Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_VERCEL_ENV=production
```

3. Click "Save"
4. Redeploy project for variables to take effect

### Step 5: Configure Custom Domain

1. In Vercel Dashboard → Settings → Domains
2. Add custom domain: `binah.yourdomain.com`
3. Add DNS records:
   - A record: `35.184.97.32` (Vercel IP)
   - Or use CNAME record: `cname.vercel-dns.com`
4. Wait for DNS propagation (usually 5-15 minutes)

### Step 6: Enable HTTPS & SSL

- Vercel automatically issues SSL certificate (free)
- Wait 5-15 minutes for certificate generation
- Verify: Visit `https://binah.yourdomain.com`

### Step 7: Configure Automatic CI/CD

1. In Vercel Dashboard → Settings → Git
2. Enable "Automatic Deployments"
3. Configure branch deployment rules:
   - Production Deployment: `main` branch
   - Preview Deployment: Pull Requests

Now:
- Every push to `main` → Auto-deploy to production
- Every PR → Auto-deploy to preview URL for testing

### Monitoring Vercel Deployment

```bash
# View deployment logs
vercel logs

# View performance metrics
vercel analytics

# Rollback to previous version
vercel rollback

# View environment details
vercel env pull     # Pull env vars from production
```

---

## Self-Hosted Deployment

### Option 1: Docker Deployment

#### Step 1: Create Dockerfile

```dockerfile
# Dockerfile (in project root)
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV production

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
# Copy build output from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

#### Step 2: Create Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  binah:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://binah.yourdomain.com/api
      - DATABASE_URL=postgresql://user:pass@postgres:5432/binah
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=binah
      - POSTGRES_USER=binah_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Step 3: Deploy Docker

```bash
# Build Docker image
docker build -t binah:latest .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f binah

# Stop deployment
docker-compose down
```

### Option 2: Node.js Server Deployment

#### Step 1: Set Up Server

```bash
# SSH into server
ssh user@your-server.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Create app directory
mkdir -p /var/www/binah
cd /var/www/binah
```

#### Step 2: Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/binah.git .

# Install dependencies
npm install --production

# Build for production
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'binah',
    script: './node_modules/.bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

# Verify running
pm2 list
```

#### Step 3: Configure Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/binah
upstream binah {
  server 127.0.0.1:3000;
}

server {
  listen 80;
  server_name binah.yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name binah.yourdomain.com;

  # SSL certificates (Let's Encrypt)
  ssl_certificate /etc/letsencrypt/live/binah.yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/binah.yourdomain.com/privkey.pem;

  # Proxy to Node.js
  location / {
    proxy_pass http://binah;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css text/javascript application/json;
}
```

#### Step 4: Enable SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d binah.yourdomain.com

# Auto-renew certificates
sudo certbot renew --dry-run
```

---

## Environment Configuration

### .env.local (Development)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development

# Optional
DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### .env.production (Production)

```env
# API
NEXT_PUBLIC_API_URL=https://binah.yourdomain.com/api
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@db.example.com/binah

# Authentication
JWT_SECRET=your-very-secure-jwt-secret-min-32-chars
API_SECRET_KEY=your-very-secure-api-key-min-32-chars

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Performance
NEXT_REVALIDATE_TIME=3600  # ISR cache 1 hour

# Feature flags
FEATURE_NEW_DASHBOARD=true
FEATURE_DARK_MODE=false
```

### Environment Variables (Vercel UI)

In Vercel Dashboard → Settings → Environment Variables:

- Set all production values
- Mark sensitive values as "Sensitive"
- Configure different values per environment (preview/production)

---

## Post-Deployment Verification

### Health Checks

```bash
# Check if deployment is live
curl -I https://binah.yourdomain.com

# Should return 200 OK with headers
HTTP/2 200
content-type: text/html; charset=utf-8
```

### Functional Testing

```bash
# Test main page loads
curl https://binah.yourdomain.com | grep -o "<title>.*</title>"

# Expected: <title>بِّינָה - AI Academy Platform</title>
```

### Performance Testing

```bash
# Lighthouse audit (via CLI)
npm install -g lighthouse

lighthouse https://binah.yourdomain.com --view

# Expected scores:
# - Performance: 90+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

### Analytics

1. Visit Vercel Dashboard → Analytics
2. Check:
   - Response time < 500ms
   - Error rate < 1%
   - Request count growing
   - Edge function performance

### Manual Smoke Test

1. Open `https://binah.yourdomain.com` in browser
2. ✅ Parallax animations play smoothly (60fps)
3. ✅ Sidebar navigation works
4. ✅ Click screens → zoom animation triggers
5. ✅ Scroll page → parallax responds
6. ✅ Mouse tracking effects visible
7. ✅ No console errors (F12 → Console)
8. ✅ Mobile responsive (toggle device mode)
9. ✅ Hebrew RTL renders correctly
10. ✅ All fonts loaded (no layout shift)

---

## Monitoring & Rollback

### Monitoring

#### Vercel Analytics

```bash
# View in dashboard
vercel analytics

# Metrics:
# - Response time (FCP, LCP)
# - Error rate
# - Request patterns
# - Edge Function duration
```

#### Error Tracking (Sentry)

1. Sign up at https://sentry.io
2. Create project for Next.js
3. Add `NEXT_PUBLIC_SENTRY_DSN` to env vars
4. Monitor errors in Sentry Dashboard

#### Performance Monitoring

```bash
# Set up Vercel Web Analytics
# In vercel.json:
{
  "analytics": true,
  "webAnalytics": {
    "enabled": true
  }
}
```

### Rollback to Previous Version

#### Vercel

```bash
# List deployments
vercel list

# View specific deployment
vercel list

# Rollback to previous version
vercel promote <deployment-id>

# Or via Dashboard:
# 1. Go to Deployments
# 2. Select previous version
# 3. Click "Promote to Production"
```

#### Docker

```bash
# Stop current container
docker-compose down

# Checkout previous code
git checkout <previous-commit>

# Rebuild and restart
docker-compose up -d
```

#### PM2 (Self-Hosted)

```bash
# View PM2 logs
pm2 logs binah

# Restart process
pm2 restart binah

# Reload gracefully
pm2 reload binah

# If something wrong, revert git and restart
git revert HEAD
npm run build
pm2 restart binah
```

---

## Performance Optimization

### CDN Configuration

```
Vercel: Built-in CDN (auto-optimized)

Custom CDN:
1. Use Cloudflare (free tier available)
2. Add CNAME: binah.yourdomain.com → vercel.com
3. Enable caching rules
4. Set browser cache: 1 day
5. Set edge cache: 1 week
```

### Image Optimization

```typescript
// Ensure all images use next/image
import Image from 'next/image'

// Not this:
<img src="/avatar.png" />

// Do this:
<Image
  src="/avatar.png"
  alt="Avatar"
  width={100}
  height={100}
  priority      // Critical images
  sizes="(max-width: 640px) 80px, 100px"
/>
```

### Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Create .env.local:
# ANALYZE=true

# Run build with analysis
npm run build

# Opens interactive bundle visualizer
```

### Caching Strategy

```typescript
// app/api/data/route.ts
export const revalidate = 3600  // 1 hour ISR

export async function GET() {
  // Cached for 1 hour, then revalidates in background
  const data = await fetchData()
  return Response.json({ data })
}
```

---

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables not in code
- [ ] API authentication enabled (JWT tokens)
- [ ] Rate limiting configured
- [ ] CORS headers set correctly
- [ ] CSP headers enabled
- [ ] XSS protection enabled
- [ ] CSRF tokens for forms
- [ ] SQL injection protection (if using DB)
- [ ] Secrets in Vercel/CI encrypted
- [ ] `.env.local` in `.gitignore`
- [ ] No API keys in logs
- [ ] Database backups enabled
- [ ] Regular security audits: `npm audit`

---

## Summary

### Quick Deployment (Vercel)

```bash
# 1. Build & test locally
npm run build && npm run start

# 2. Push to GitHub
git push origin main

# 3. Deploy via Vercel
vercel --prod

# 4. Verify live
curl https://binah.yourdomain.com
```

### Deployment Checklist

- ✅ Pre-deployment checks pass
- ✅ Build succeeds locally
- ✅ Environment variables set
- ✅ Deploy to staging first
- ✅ Run smoke tests
- ✅ Monitor for errors
- ✅ Ready to deploy to production

The platform is now live and accessible to users!

