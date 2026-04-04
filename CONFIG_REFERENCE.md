# Configuration Files Summary

## Files Created for Deployment

### 1. **netlify.toml** ⭐ (Most Important)
**Location:** `netlify.toml` (project root)

**What it does:**
- Tells Netlify how to build your app
- Configures security headers
- Sets up routing for Angular SPA
- Manages caching strategies

**Key sections:**
```toml
[build]
  command = "npm run build"           # Build command
  publish = "dist/interview-pro/browser"  # Where is build output

[build.environment]
  NODE_ENV = "production"              # Build environment

[[redirects]]
  from = "/*"                          # SPA routing
  to = "/index.html"
  status = 200

[[headers]]                             # Security headers
  X-Content-Type-Options = "nosniff"
```

---

### 2. **src/environments/environment.production.ts**
**Location:** `src/environments/environment.production.ts`

**What it does:**
- Stores production API URL
- Switches between dev/prod configs
- Imported by your services

**Current content:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-actual-backend-domain.com'  // ← UPDATE THIS!
};
```

**✅ TODO:** Replace with your real backend domain

---

### 3. **src/environments/environment.ts**
**Location:** `src/environments/environment.ts`

**What it does:**
- Stores development API URL
- Used when running `ng serve`

**Current content:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'   // Local development
};
```

---

### 4. **Documentation Files**

#### a) **DEPLOY_STEPS.md** - Step-by-step execution
Commands you copy-paste to deploy

#### b) **GITHUB_NETLIFY_SETUP.md** - Detailed configuration
Explains every Netlify setting

#### c) **NETLIFY_DEPLOYMENT.md** - Full reference
Complete guide with troubleshooting

#### d) **QUICK_DEPLOY.md** - Quick reference
TL;DR version

#### e) **DEPLOYMENT_GUIDE.md** - General deployment info
Different hosting options

---

## How They Work Together

```
┌──────────────────────────────────────────────────────┐
│  You Update Code & Push to GitHub                    │
└────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  Netlify Webhook Triggered (auto, no manual step)    │
└────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  Netlify Reads netlify.toml                          │
│  ├─ Understands build settings                       │
│  ├─ Loads environment variables                      │
│  └─ Knows where to deploy                           │
└────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  Build Process (npm run build)                       │
│  ├─ Runs TypeScript compiler                        │
│  ├─ Bundles code with Angular                       │
│  ├─ Uses environment.production.ts                  │
│  └─ Creates dist/interview-pro/browser/             │
└────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  Netlify Deploys                                     │
│  ├─ Takes files from dist/interview-pro/browser/    │
│  ├─ Uploads to CDN                                  │
│  ├─ Applies security headers (from netlify.toml)    │
│  ├─ Sets up redirects for SPA (from netlify.toml)   │
│  └─ Site live!                                      │
└────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  🚀 Your App Live                                    │
│  https://interview-pro.netlify.app                   │
└──────────────────────────────────────────────────────┘
```

---

## What Each Config Does

### netlify.toml → Netlify Settings

**Build Command**
```toml
[build]
  command = "npm run build"
```
↓ Equivalent to running in terminal:
```bash
npm run build
```
Compiles TypeScript, bundles code, creates `dist/` folder

---

**Publish Directory**
```toml
[build]
  publish = "dist/interview-pro/browser"
```
↓ Tells Netlify:
```
After build, deploy these files:
dist/interview-pro/browser/
├── index.html
├── main.*.js
├── styles.*.css
└── assets/
```

---

**Environment Variables**
```toml
[build.environment]
  NODE_ENV = "production"
```
↓ Makes available during build:
```bash
process.env.NODE_ENV  # = "production"
```
Your app can read: `environment.production.ts`

---

**SPA Routing**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
↓ When user visits:
```
https://interview-pro.netlify.app/user/dashboard
                                   ^^^^^^^^^^^^^^^^
                    Netlify redirects to /index.html
                         Angular Router handles URL
```

---

**Security Headers**
```toml
[[headers]]
  X-Content-Type-Options = "nosniff"
```
↓ HTTP Response:
```
Response Headers:
├─ X-Content-Type-Options: nosniff
├─ X-Frame-Options: SAMEORIGIN
├─ Referrer-Policy: strict-origin-when-cross-origin
└─ (Protects against XSS, clickjacking, etc)
```

---

**Caching**
```toml
[[headers]]
  for = "/assets/*"
  Cache-Control = "public, max-age=31536000"  # 1 year
```
↓ Browser behavior:
```
Images/fonts in /assets/ cached for 1 year
User doesn't re-download on repeat visits
Faster loading! ⚡
```

---

## Netlify Configuration Parameters Explained

### 1. Project Name
```
Default: "interview-pro.netlify.app"
Custom:  "my-awesome-app.netlify.app" (if available)
Or Custom Domain: "interview-pro.yourdomain.com"

Netlify UI: Site Settings → General → Site name
```

### 2. Branch to Deploy
```
From netlify.toml or Netlify UI
Default: main branch
Other: develop (preview deploy)

Netlify UI: Build & Deploy → Deploy Contexts
```

### 3. Base Directory
```
If mono-repo:
├── frontend/     ← Base directory: "frontend"
├── backend/      ← Base directory: "backend"

Your case: "" (empty/root, because Angular app is in root)

Netlify UI: Build & Deploy → Build settings
```

### 4. Build Command
```
What Netlify executes:
$ npm run build

Customizable, but yours is:
command = "npm run build"  # in netlify.toml

Could also be:
command = "ng build --configuration production"
```

### 5. Publish Directory
```
Which folder to serve on the web:

WRONG: "" (would serve package.json, src folders - bad!)
RIGHT: "dist/interview-pro/browser" (only compiled app)

Netlify UI: Build & Deploy → Build settings
```

### 6. Functions Directory
```
For Netlify serverless functions (optional)
Your case: Not needed (you have Node.js backend)

If you added: netlify/functions/
Can write: netlify/functions/send-email.js
Then call from frontend

For you: Leave empty!
```

### 7. Environment Variables
```
Key-value pairs that change per environment:

BACKEND_API_URL=https://api.yourdomain.com
NODE_ENV=production
DATABASE_URL=postgresql://...
API_KEY=sk-xxx...

Netlify UI: Site Settings → Build & Deploy → Environment
Or in netlify.toml:
[build.environment]
  BACKEND_API_URL = "https://api.yourdomain.com"
  NODE_ENV = "production"

Applied to build process & available to your code
```

---

## Complete Configuration Checklist

### ✅ Local Files (Already Done for You)

- [x] `netlify.toml` - Build & deployment config
- [x] `src/environments/environment.ts` - Dev config
- [x] `src/environments/environment.production.ts` - Prod config
- [x] `src/app/services/auth.service.ts` - Updated to use environment.apiUrl
- [x] Security headers configured in netlify.toml
- [x] SPA routing configured in netlify.toml
- [x] Cache settings configured in netlify.toml

### ⏳ You Need to Do

1. **Update Backend URL**
   - [ ] Edit `src/environments/environment.production.ts`
   - [ ] Set real backend domain

2. **Create GitHub Repo**
   - [ ] Create new repo: `interview-pro-frontend`
   - [ ] Push your code
   - [ ] Verify on GitHub

3. **Connect to Netlify**
   - [ ] Sign up at netlify.com (free)
   - [ ] Click "Add new site"
   - [ ] Connect your GitHub repo
   - [ ] Review settings (auto-detected from netlify.toml)

4. **Set Environment Variables**
   - [ ] In Netlify UI: Site Settings → Environment
   - [ ] Add `BACKEND_API_URL` with your backend domain
   - [ ] Save and trigger rebuild

5. **Update Backend CORS**
   - [ ] Update backend to allow `*.netlify.app` domain
   - [ ] Or allow specific domain: `interview-pro.netlify.app`

6. **Test Deployment**
   - [ ] Visit live site
   - [ ] Test login functionality
   - [ ] Check console for errors (F12)

---

## Your Exact Settings for Netlify

When Netlify asks for configuration during setup:

```
Project name:           interview-pro
Branch to deploy:       main
Base directory:         (leave blank)
Build command:          npm run build
Publish directory:      dist/interview-pro/browser
Functions directory:    (leave blank)

Environment Variables:
  BACKEND_API_URL → https://your-backend-domain.com
  NODE_ENV → production
```

All auto-detected from `netlify.toml` file! ✅

---

## Next Action

**Step 1:** Follow [DEPLOY_STEPS.md](./DEPLOY_STEPS.md)

It has all the commands you need to copy-paste! 🚀
