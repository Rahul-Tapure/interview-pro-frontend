# Frontend Deployment Guide

## Step 1: Update Your Backend URL

Before building, update the production API URL:

**File:** `src/environments/environment.production.ts`
```
apiUrl: 'https://your-backend-domain.com' // Your actual backend URL
```

## Step 2: Build for Production

Run the production build:
```bash
npm run build
```

This creates an optimized bundle in the `dist/interview-pro/browser` folder with:
- Minified code
- Tree-shaking (unused code removed)
- Source maps
- Output hashing for caching

## Step 3: Verify Build Output

After building, you should see:
```
dist/interview-pro/browser/
├── index.html
├── main.*.js
├── polyfills.*.js
├── styles.*.css
└── assets/
```

## Step 4: Deployment Options

### Option A: Netlify (Easiest)
1. Connect your GitHub repo to Netlify
2. Build Command: `npm run build`
3. Publish Directory: `dist/interview-pro/browser`
4. Deploy

### Option B: Vercel
1. Import project from Git
2. Framework: Angular
3. Build Output: `dist/interview-pro/browser`
4. Deploy

### Option C: AWS S3 + CloudFront
1. Build the app
2. Upload `dist/interview-pro/browser` to S3
3. Create CloudFront distribution
4. Point domain to CloudFront

### Option D: Traditional Server (Nginx)
1. Build the app
2. Copy contents of `dist/interview-pro/browser` to `/var/www/html`
3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (optional, if same server)
    location /interviewpro/ {
        proxy_pass http://backend:8080/interviewpro/;
    }
}
```

## Step 5: Environment Setup

### Backend Domain Configuration
- Update API URLs before deploying
- Ensure CORS is enabled on backend for your frontend domain
- Use HTTPS for production

### Required Backend Configuration
```
CORS Allowed Origins: https://your-frontend-domain.com
Webhook URLs: https://your-backend-domain.com/webhook-endpoint
```

## Step 6: Testing Before Deployment
```bash
# Build locally
npm run build

# Test the bundle locally (requires http-server)
npx http-server dist/interview-pro/browser -p 4200
```

## Build Size Check
Current budget limits:
- Initial bundle: 500KB warning / 1MB error
- Component styles: 8KB warning / 16KB error

Check your actual sizes after building.

## Post-Deployment Checklist
- [ ] Verify API endpoints point to production backend
- [ ] Test login/authentication flow
- [ ] Check console for errors
- [ ] Verify webhook configurations
- [ ] Test file uploads (if applicable)
- [ ] Check HTTPS is enabled
- [ ] Set proper cache headers
- [ ] Monitor performance metrics
