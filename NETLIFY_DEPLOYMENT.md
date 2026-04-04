# Netlify Git Deployment Guide

## What is Netlify Deployment?

Netlify automatically builds and deploys your app whenever you push to your Git repository. No manual uploads needed!

**Flow:** 
```
Git Push → Netlify detects → Runs `npm run build` → Deploys to CDN → Live!
```

---

## Step 1: Prepare Your Repository

### 1a. Check Git Status
```powershell
cd d:\project\interview-pro\frontend\interview-pro
git status
```

### 1b. Update Environment for Production
Edit [src/environments/environment.production.ts](../src/environments/environment.production.ts) and set your real backend URL:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-api-domain.com'  // ← Update this!
};
```

### 1c. Commit Changes
```powershell
git add .
git commit -m "chore: setup Netlify deployment and production environment"
git push origin main
```

---

## Step 2: Connect to Netlify

### 2a. Sign Up / Login to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Create free account or login
3. Click **"Add new site"** → **"Import an existing project"**

### 2b. Connect Your GitHub Repository
1. Click **"Connect to Git"**
2. Select **GitHub** (authorize if prompted)
3. Select your repository: `interview-pro`
4. Click **"Deploy site"**

Netlify will automatically detect:
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist/interview-pro/browser`
- ✅ Node version from package.json

---

## Step 3: Configure Environment Variables (Important!)

### 3a. In Netlify Dashboard
1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Click **"Edit variables"**
3. Add your variables:
   - **Key:** `BACKEND_API_URL`
   - **Value:** `https://your-backend-domain.com`

**Or** you can set them in `netlify.toml` (already done in this project).

---

## Step 4: Update Backend CORS Settings

Your backend must allow requests from your Netlify domain.

**Backend Configuration (application.properties):**
```properties
# CORS Settings
cors.allowed.origins=https://your-app-name.netlify.app,https://yourdomain.com
cors.allowed.methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed.headers=*
cors.allow.credentials=true
```

Or in your Spring Boot backend code:
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/interviewpro/**")
                    .allowedOrigins(
                        "https://your-app-name.netlify.app",
                        "https://yourdomain.com"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowCredentials(true);
            }
        };
    }
}
```

---

## Step 5: Verify Deployment

### 5a. Check Build Status
- Netlify will show your **latest deploy** on the dashboard
- Click the deploy card to see build logs
- Look for: ✅ "Deploy complete"

### 5b. Test the Live Site
- Your site URL: `https://your-app-name.netlify.app`
- Test login functionality
- Check browser console for API errors (F12 → Console)

---

## Step 6: Custom Domain (Optional)

1. In Netlify: **Site Settings** → **Domain Management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `interview-pro.com`)
4. Update DNS records to point to Netlify
5. Netlify auto-generates FREE SSL certificate

---

## Automatic Deployments

From now on, every `git push` automatically:

```
1. Netlify detects the push
2. Clones your repo
3. Runs: npm install
4. Runs: npm run build
5. Deploys to CDN (takes ~2-3 minutes)
6. Your site updates live!
```

No manual steps needed!

---

## Deployment Workflow

### Normal Development
```powershell
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main
# → Netlify auto-deploys! ✅
```

### Preview Deploys (Optional)
Create a `develop` branch for testing:
```powershell
git checkout -b develop
# Make changes
git push origin develop
# Netlify creates a preview URL automatically
```

---

## Troubleshooting

### Build Fails
- Check Netlify build logs: **Deployments** → **Failed Deploy** → **Logs**
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - CSS budget warnings (non-blocking)

### API Errors After Deploy
- Check CORS settings on backend
- Verify `environment.production.ts` has correct API URL
- Check backend logs for incoming requests

### DNS Issues
- Wait 24-48 hours for DNS propagation
- Test with `nslookup yourdomain.com`

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy changes | `git push origin main` |
| View build logs | Netlify Dashboard → Deployments |
| View errors | Browser DevTools (F12) → Network tab |
| Trigger rebuild | Netlify Dashboard → Deploys → **Trigger Deploy** |
| Rollback deploy | Netlify Dashboard → Deploys → click old version → **Publish Deploy** |

---

## Security Checklist

- [ ] Backend has CORS configured for your domain
- [ ] No API keys/secrets in code (use environment variables)
- [ ] HTTPS enabled (automatic with Netlify)
- [ ] Backend validates all requests
- [ ] Webhook URLs use HTTPS

---

## Current Setup Summary

```
Repository: Your GitHub repo
Build Command: npm run build
Publish Directory: dist/interview-pro/browser
Node Version: 20.x (detected from package.json)
Deployment: Automatic on every push
Domain: your-app-name.netlify.app
```

**You're ready to deploy!** 🚀
