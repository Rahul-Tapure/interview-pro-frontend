# 📊 Netlify Configuration Visual Guide

## Configuration Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    NETLIFY.TOML                             │
│              (Automatic Configuration)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [build]                                                     │
│  ├─ command = "npm run build"     ← HOW TO BUILD             │
│  └─ publish = "dist/..."          ← WHAT TO DEPLOY           │
│                                                               │
│  [build.environment]                                         │
│  ├─ NODE_ENV = "production"       ← ENV VARIABLES            │
│  └─ NODE_OPTIONS = "..."                                     │
│                                                               │
│  [[headers]]                                                 │
│  ├─ Cache-Control = "..."         ← CACHING STRATEGY         │
│  └─ X-Content-Type-Options = ...  ← SECURITY                 │
│                                                               │
│  [[redirects]]                                               │
│  └─ "/*" → "/index.html"          ← SPA ROUTING              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Settings Mapping

```
YOUR CONFIG FILE                          NETLIFY UI
──────────────────────────────────────────────────────────────

netlify.toml                              Netlify Dashboard
├─ [build]
│  ├─ command                            → Site Settings →
│  │   "npm run build"                     Build & Deploy →
│  │                                       Build settings
│  │
│  └─ publish                            → Site Settings →
│      "dist/..."                          Build & Deploy →
│                                          Build settings
│
├─ [build.environment]                   → Site Settings →
│  └─ KEY = VALUE                          Build & Deploy →
│                                          Environment
│
└─ [[headers]]  &  [[redirects]]        → Auto-applied
   (No UI equivalent)                      to all responses
```

---

## Complete Setup Timeline

```
Day 1: Local Development
┌─────────────────────────────────────────────────────────────┐
│ You write Angular code                                       │
│ Testing locally on http://localhost:4200                    │
│ Backend running on http://localhost:8080                    │
└─────────────────────────────────────────────────────────────┘

Day 1: Prepare for Deployment
┌─────────────────────────────────────────────────────────────┐
│ ✅ Update environment.production.ts with real API URL       │
│ ✅ Create GitHub repository                                 │
│ ✅ Push code to GitHub                                      │
│ ✅ netlify.toml is already configured                       │
└─────────────────────────────────────────────────────────────┘

Day 1: Connect to Netlify
┌─────────────────────────────────────────────────────────────┐
│ ✅ Sign up on netlify.com (free)                            │
│ ✅ Connect GitHub repo                                      │
│ ✅ Netlify reads: netlify.toml (auto-configured)            │
│ ✅ Netlify auto-detects build settings                      │
│ ✅ Click "Deploy site"                                      │
└─────────────────────────────────────────────────────────────┘

Day 1: Configure & First Deploy
┌─────────────────────────────────────────────────────────────┐
│ Time: ~2-3 minutes                                          │
│ 1. Netlify builds: npm run build                            │
│ 2. Netlify runs tests (optional)                            │
│ 3. Netlify deploys dist/ to CDN                             │
│ 4. Site LIVE at: https://interview-pro.netlify.app          │
└─────────────────────────────────────────────────────────────┘

Day 1: Backend Configuration
┌─────────────────────────────────────────────────────────────┐
│ Update backend CORS:                                        │
│ CORS_ORIGINS=https://interview-pro.netlify.app             │
│ Restart backend service                                    │
│ Test login flow end-to-end                                 │
└─────────────────────────────────────────────────────────────┘

Day 2+: Continuous Deployment
┌─────────────────────────────────────────────────────────────┐
│ Every git push triggers:                                    │
│   git push origin main                                      │
│      → GitHub receives push                                 │
│      → Netlify webhook triggered                            │
│      → Auto build & deploy                                  │
│      → Site updated (2-3 min)                               │
│      → No manual intervention!                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Netlify Build Process (What Happens Behind Scenes)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: GitHub Webhook Trigger                              │
│ Your push → GitHub detects → Notifies Netlify               │
│ Time: ~10 seconds after push                                │
└────────┬────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Netlify Clones Repository                           │
│ Gets latest code from GitHub                                │
│ Time: ~10-20 seconds                                        │
└────────┬────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Reads netlify.toml                                  │
│ Understands build settings                                  │
│ Loads environment variables                                 │
│ Time: Instant                                               │
└────────┬────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Install Dependencies                                │
│ Command: npm install                                        │
│ Downloads packages from package.json                        │
│ Time: ~30-60 seconds                                        │
└────────┬────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Run Build Command                                   │
│ Command: npm run build                                      │
│ Runs: ng build (TypeScript compilation)                     │
│ Output: dist/interview-pro/browser/                         │
│ Time: ~40-60 seconds                                        │
└────────┬────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Run Tests (Optional)                                │
│ Command: npm test                                           │
│ If configured in netlify.toml                               │
│ Time: ~30-120 seconds                                       │
└────────┬────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Deploy to Netlify CDN                               │
│ Takes files from: dist/interview-pro/browser/               │
│ Uploads to: Edge servers worldwide                          │
│ Applies config from netlify.toml:                           │
│   • Headers (security, caching)                             │
│   • Redirects (SPA routing)                                 │
│ Time: ~10-30 seconds                                        │
└────────┬────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────┐
│ ✅ DEPLOYMENT COMPLETE                                       │
│                                                              │
│ Your site is LIVE                                           │
│ https://interview-pro.netlify.app                            │
│                                                              │
│ Total Time: ~2-3 minutes                                    │
│ No manual steps required!                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Configuration Flow

```
Local Development                Production (Netlify)
─────────────────────────────────────────────────
                                
ng serve                         npm run build
   ↓                                ↓
imports environment.ts          imports environment.production.ts
   ↓                                ↓
apiUrl: "http://localhost:8080"  apiUrl: "https://api.yourdomain.com"
   ↓                                ↓
Browser runs on              Browser runs on
http://localhost:4200        https://interview-pro.netlify.app
   ↓                                ↓
Calls: http://localhost:8080   Calls: https://api.yourdomain.com
     (local backend)                (production backend)
```

---

## File Organization: What Goes Where

```
interview-pro-frontend/
│
├── 📦 GITHUB                              NETLIFY
│   ├── source code (src/, angular.json)   → Clone repo
│   └── build config (netlify.toml)        → Read config
│                                             ↓
├── 🏗️ BUILD (npm run build)                Execute build cmd
│   └── Creates: dist/interview-pro/browser/
│                ├── index.html
│                ├── main.*.js
│                ├── styles.*.css
│                └── assets/
│                    ↓
├── 🚀 DEPLOYMENT (Netlify CDN)            Deploy publish dir
│   └── Served worldwide on CDN
│       https://interview-pro.netlify.app
│
├── ⚙️ CONFIGURATION FILES
│   ├── netlify.toml         ← Build settings
│   ├── package.json         ← Dependencies & scripts
│   ├── angular.json         ← Angular build config
│   ├── src/environments/    ← API URLs per environment
│   │   ├── environment.ts        (dev)
│   │   └── environment.production.ts (prod)
│   └── .gitignore           ← Don't push node_modules, dist/
│
└── 📚 DOCUMENTATION
    ├── DEPLOY_STEPS.md           ← Follow this!
    ├── GITHUB_NETLIFY_SETUP.md   ← Detailed setup
    ├── CONFIG_REFERENCE.md       ← Settings reference
    └── NETLIFY_DEPLOYMENT.md     ← Troubleshooting
```

---

## Quick Configuration Reference

```
╔════════════════════════════════════════════════════════════╗
║              YOUR NETLIFY SETTINGS                         ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Project Name:                                            ║
║  └─ interview-pro (or your custom name)                   ║
║                                                            ║
║  Build Settings:                                          ║
║  ├─ Build command:    npm run build                       ║
║  ├─ Publish dir:      dist/interview-pro/browser          ║
║  ├─ Base dir:         (leave blank)                       ║
║  └─ Functions dir:    (leave blank)                       ║
║                                                            ║
║  Environment Variables:                                   ║
║  ├─ BACKEND_API_URL = https://api.yourdomain.com          ║
║  └─ NODE_ENV = production                                 ║
║                                                            ║
║  Domain:                                                  ║
║  ├─ Netlify subdomain: interview-pro.netlify.app          ║
║  └─ Custom domain:     interview-pro.yourdomain.com       ║
║      (optional, requires DNS configuration)               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## From Code Push to Live (Visual Timeline)

```
You:                    $ git push origin main
                              ↓
GitHub:                 Receives push, stores code
                              ↓
Webhook:                Notifies Netlify (auto)
                              ↓               
Netlify:                [Build in progress...]
                        ├─ 0:10 - Clone repo
                        ├─ 0:20 - npm install
                        ├─ 1:00 - npm run build
                        └─ 1:30 - Deploy to CDN
                              ↓
You:                    $ visit https://interview-pro.netlify.app
                              ↓
Browser:                Shows updated site!
                        (All changes live!)

Total Time: ~2-3 minutes (completely automatic!)
```

---

## Environment Variables Explanation

```
Build Time (when Netlify builds):
┌────────────────────────────────────────────┐
│ netlify.toml defines:                      │
│ [build.environment]                        │
│ BACKEND_API_URL = "https://api.yourdomain" │
│ NODE_ENV = "production"                    │
│                                            │
│ During build, Angular imports:             │
│ environment.production.ts                  │
│   → Uses apiUrl from config                │
│   → Bundles into JavaScript              │
└────────────────────────────────────────────┘

Runtime (when user runs app):
┌────────────────────────────────────────────┐
│ Browser loads: https://interview-pro...     │
│               /main.*.js                     │
│                                            │
│ JavaScript has apiUrl baked in (from build) │
│   → All API calls use correct backend      │
│   → No environment variable lookup         │
│                                            │
│ Auth service calls:                        │
│ https://api.yourdomain.com/interviewpro/...│
└────────────────────────────────────────────┘
```

---

## Troubleshooting Decision Tree

```
Build fails on Netlify?
├─ Check: netlify.toml syntax
├─ Check: npm run build works locally
├─ Check: All dependencies in package.json
└─ View: Netlify build logs → Deployments tab

Blank page after deploy?
├─ Check: index.html exists in dist/
├─ Check: Build command in netlify.toml correct
├─ Check: Publish directory points to right folder
└─ View: Browser DevTools (F12 → Console)

API calls fail?
├─ Check: environment.production.ts has correct URL
├─ Check: Backend CORS allows your domain
├─ Check: Backend is actually running
└─ View: Browser Network tab (F12 → Network)

Custom domain not working?
├─ Check: DNS records point to Netlify
├─ Check: SSL certificate provisioned
├─ Wait: DNS propagation (24-48 hours)
└─ Test: nslookup yourdomain.com
```

---

## Summary: What You Need to Do

| # | Task | File(s) | Time |
|---|------|---------|------|
| 1 | Update backend URL | `src/environments/environment.production.ts` | 2 min |
| 2 | Create GitHub repo | GitHub website | 2 min |
| 3 | Push code to GitHub | Terminal: `git push` | 3 min |
| 4 | Connect to Netlify | Netlify website | 5 min |
| 5 | Set environment vars | Netlify UI → Environment | 2 min |
| 6 | Update backend CORS | Your backend server | 2 min |
| 7 | Test deployment | Browser: visit live URL | 5 min |
| **TOTAL** | | | **21 min** |

**After setup?** Just push code → auto-deploy! 🚀

---

## Next Steps

1. **Read:** [DEPLOY_STEPS.md](./DEPLOY_STEPS.md) (Copy-paste commands)
2. **Follow:** Each step exactly
3. **Done:** Enjoy automatic deployments!

---

**Ready to deploy? 🚀**
