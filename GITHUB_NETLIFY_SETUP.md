# GitHub Repository Setup & Netlify Configuration Guide

## Option 1: Create GitHub Repo Using Web Interface (Easiest)

### Step 1a: On GitHub.com
1. Go to [github.com](https://github.com) and login
2. Click **"+"** (top right) → **"New repository"**
3. Fill in:
   - **Repository name:** `interview-pro-frontend`
   - **Description:** `Interview Pro - Angular Frontend`
   - **Visibility:** Public (or Private)
   - **Initialize:** Uncheck "Add a README" (we have files already)
4. Click **"Create repository"**

### Step 1b: Push Your Local Code
```powershell
cd d:\project\interview-pro\frontend\interview-pro

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/interview-pro-frontend.git

# Rename branch if needed (GitHub default is 'main')
git branch -M main

# Push all code to GitHub
git add .
git commit -m "Initial commit: Angular frontend with Netlify config"
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Option 2: Create Using GitHub CLI (Faster)

If GitHub CLI is not installed:
```powershell
# Install GitHub CLI
winget install GitHub.cli
# Or use: scoop install gh
# Or download from: https://cli.github.com
```

After install:
```powershell
# Login to GitHub
gh auth login
# Follow prompts (select HTTPS, use personal access token)

# Create repo
cd d:\project\interview-pro\frontend\interview-pro
gh repo create interview-pro-frontend --source=. --remote=origin --push --public

# Done! Your code is on GitHub automatically
```

---

# Netlify Configuration Details

Once your repo is on GitHub and connected to Netlify, here's what each setting means:

## 1. **Project Name**
**What it is:** Display name in Netlify dashboard

**How to set it:**
- Netlify Dashboard → **Site Settings** → **General** → **Site name**
- Default auto-generated: `your-app-name.netlify.app`
- Change it in Netlify UI

**Example:** `interview-pro` → Domain becomes `interview-pro.netlify.app`

---

## 2. **Branch to Deploy**

**What it is:** Which Git branch triggers automatic deploys

**How to set it:**
- Netlify Dashboard → **Site Settings** → **Build & Deploy** → **Deploy Contexts**
- **Production Branch:** `main` (or `master`)
  - Every push here triggers deployment
  - Usually your stable code

**Best Practice:**
```
main branch         → Automatic production deploy ✓
develop branch      → Preview deploy (optional)
feature/* branches  → Preview deploy (optional)
```

**Example Config in netlify.toml:**
```toml
[build.environment]
  NETLIFY_GIT_BRANCH = "main"
```

---

## 3. **Base Directory**

**What it is:** Root folder where Netlify runs build command (if you have mono-repo)

**How to set it:**
- Most projects: Leave blank (uses repo root)
- Netlify Dashboard → **Site Settings** → **Build & Deploy** → **Build settings**

**Examples:**
```
Your Structure:
├── frontend/              ← Base directory: "frontend"
│   ├── package.json
│   └── angular.json
├── backend/
└── README.md

OR (your case):
interview-pro-frontend/   ← Base directory: "" (empty/root)
├── package.json
├── angular.json
└── src/
```

**YOUR SETTING:** Leave blank (root of repo is the Angular app)

---

## 4. **Build Command**

**What it is:** Shell command Netlify runs to compile your app

**Default (Auto-detected):** `npm run build`

**How to set it:**
- In `netlify.toml` (already configured):
```toml
[build]
  command = "npm run build"
```

- Or Netlify UI: **Site Settings** → **Build & Deploy** → **Build settings** → **Build command**

**What it does:**
1. Runs TypeScript compilation
2. Bundles code
3. Optimizes CSS/JS
4. Creates `dist/interview-pro/browser` folder

**Output Example:**
```
▲ Netlify Build completed
├── npm run build
├── Angular compiled successfully
└── Generated dist/ folder
```

---

## 5. **Publish Directory**

**What it is:** Which folder to deploy to the web (the built app)

**How to set it:**
In `netlify.toml` (already configured):
```toml
[build]
  publish = "dist/interview-pro/browser"
```

Or Netlify UI: **Site Settings** → **Build & Deploy** → **Build settings** → **Publish directory**

**Folder Structure:**
```
After "npm run build" runs, Netlify takes files from:

dist/interview-pro/browser/
├── index.html              ← Entry point
├── main.*.js               ← App code
├── polyfills.*.js
├── styles.*.css
└── assets/                 ← Images, fonts, etc
```

**YOUR SETTING:** `dist/interview-pro/browser`

---

## 6. **Functions Directory**

**What it is:** Netlify serverless functions (only if you use them)

**Do you need it?** 
- ❌ **NO** for your case (using traditional backend)
- ✅ **YES** if you'd write serverless functions

**How to set it:**
```toml
[build]
  functions = "netlify/functions"  # Optional
```

**Example Use Case:**
```javascript
// netlify/functions/send-email.js
exports.handler = async (event) => {
  // Serverless function runs on Netlify
  return { statusCode: 200, body: "Email sent" };
};
```

**YOUR SETTING:** Leave empty (you have a backend server)

---

# Complete Netlify Configuration File

Here's what your complete `netlify.toml` looks like:

```toml
# Build settings
[build]
  command = "npm run build"
  publish = "dist/interview-pro/browser"

# Environment variables
[build.environment]
  NODE_ENV = "production"
  NODE_OPTIONS = "--max_old_space_size=4096"

# SPA routing (redirects all routes to index.html)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "SAMEORIGIN"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets for 1 year
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Cache JS/CSS bundles
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# No cache for HTML (allows updates without hard refresh)
[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

---

# Environment Variables Configuration

## What Are Environment Variables?

Variables that change per environment (dev, staging, production) without changing code.

**Examples:**
```
Development:  apiUrl = "http://localhost:8080"
Production:   apiUrl = "https://api.yourdomain.com"
```

## How to Set Them in Netlify

### Method 1: In netlify.toml (Already Done)
```toml
[build.environment]
  NODE_ENV = "production"
  BACKEND_API_URL = "https://your-api-domain.com"
```

### Method 2: Netlify UI
1. **Site Settings** → **Build & Deploy** → **Environment**
2. Click **"Edit variables"**
3. Add key-value pairs:
   ```
   Key:   BACKEND_API_URL
   Value: https://your-api-domain.com
   ---
   Key:   NODE_ENV
   Value: production
   ```

### Method 3: From .env File
Create `.env.production`:
```
BACKEND_API_URL=https://your-api-domain.com
NODE_ENV=production
```

Then in your build script, Netlify automatically loads it.

## How Your App Uses Them

**In Angular:**
```typescript
// src/environments/environment.production.ts
import { environment } from '../../environments/environment';

export const environment = {
  production: true,
  apiUrl: process.env['NG_APP_API_URL'] || 'https://api.yourdomain.com'
};
```

---

# Your Complete Setup Checklist

## ✅ Before Deployment

- [ ] Created GitHub repo: `interview-pro-frontend`
- [ ] Pushed code to GitHub: `git push origin main`
- [ ] Updated `src/environments/environment.production.ts` with real backend URL
- [ ] `netlify.toml` is configured (✓ Already done)
- [ ] Backend CORS settings updated for your domain

## ✅ Netlify Configuration

### Step 1: Connect Repository
1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** and authenticate
4. Choose **interview-pro-frontend** repo

### Step 2: Configure Build Settings
Netlify auto-detects from `netlify.toml`:
- ✓ Build command: `npm run build`
- ✓ Publish directory: `dist/interview-pro/browser`
- ✓ Base directory: (root)

### Step 3: Set Environment Variables
**Site Settings** → **Build & Deploy** → **Environment**

Add:
```
BACKEND_API_URL = https://your-backend-api.com
```

### Step 4: Deploy
Click **"Deploy site"** → Netlify builds & deploys automatically!

---

# Deployment Flow (After Setup)

```
┌─────────────────────────────────────┐
│  You update code locally            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  git add .                          │
│  git commit -m "message"            │
│  git push origin main               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Netlify detects GitHub push        │
│  Runs: npm install                  │
│  Runs: npm run build                │
│  Uses environment variables         │
│  Uploads dist/interview-pro/browser │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  🚀 Site live in 2-3 minutes!       │
│  https://interview-pro.netlify.app  │
└─────────────────────────────────────┘
```

---

# Quick Reference Table

| Setting | Value | Where | How |
|---------|-------|-------|-----|
| **Project Name** | `interview-pro` | Netlify UI | Site Settings → General |
| **Branch** | `main` | netlify.toml | `[build]` section |
| **Base Directory** | (empty) | Netlify UI | Build settings |
| **Build Command** | `npm run build` | netlify.toml | `[build]` section |
| **Publish Directory** | `dist/interview-pro/browser` | netlify.toml | `[build]` section |
| **Functions Directory** | (none) | netlify.toml | Optional |
| **API URL** | `https://your-api.com` | netlify.toml or UI | `[build.environment]` |
| **Node Version** | Auto-detected | (auto) | From package.json |

---

# Troubleshooting Common Issues

## Build Fails
```
Error in Netlify logs?
→ Check: netlify.toml syntax
→ Check: npm run build works locally
→ Check: All dependencies in package.json
```

## API calls fail after deploy
```
Network errors in browser console?
→ Check: BACKEND_API_URL environment variable
→ Check: Backend CORS allows your domain
→ Check: Backend is actually running
```

## Blank page shows
```
White screen, no errors?
→ Check: index.html exists in publish directory
→ Check: Check browser network tab (F12)
→ Check: Netlify build logs
```

## Custom domain not working
```
DNS not resolving?
→ Wait 24-48 hours for DNS propagation
→ Check: Netlify DNS documentation
→ Test: nslookup yourdomain.com
```

---

**Ready to deploy? Follow the checklist above!** 🚀
