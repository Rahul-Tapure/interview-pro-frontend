# 🚀 Deploy to Netlify in 3 Steps

## Step 1: Update Backend URL (IMPORTANT!)

Edit `src/environments/environment.production.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-domain.com'  // ← SET YOUR REAL BACKEND!
};
```

Run locally to verify:
```powershell
npm run build
```

---

## Step 2: Commit to Git

```powershell
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "chore: setup Netlify deployment with production environment"

# Push to GitHub
git push origin main
# (or 'master' if that's your default branch)
```

---

## Step 3: Deploy on Netlify

1. Go to **[netlify.com](https://netlify.com)**
2. **Sign up** (free account)
3. Click **"Add new site"** → **"Import an existing project"**
4. Click **"Connect to Git"** → Choose **GitHub**
5. Select your **interview-pro** repository
6. **Verify settings:**
   - Build command: `npm run build` ✓
   - Publish directory: `dist/interview-pro/browser` ✓
   - Node version: Auto-detected ✓
7. Click **"Deploy site"** 🎉
8. Netlify auto-builds and deploys (takes 2-3 minutes)

---

## Step 4: Configure Backend (CRITICAL!)

### On Your Backend Server

**Update CORS in `application.properties`:**
```properties
# Replace with your Netlify domain
cors.allowed.origins=https://your-app-name.netlify.app
cors.allowed.methods=GET,POST,PUT,DELETE,OPTIONS
cors.allow.credentials=true
```

Or **in Netlify Environment Variables:**
1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Add `BACKEND_API_URL=https://your-backend-domain.com`

---

## Done! ✅

Now every time you push to GitHub, Netlify automatically:
- Builds your app
- Runs tests
- Deploys to CDN
- Goes live in 2-3 minutes

No manual uploads needed! 🎉

---

## Test Your Deployment

Access your site at:
```
https://your-app-name.netlify.app
```

Check for errors in browser (F12 → Console tab)

---

## Common Issues & Fixes

### "Blank page after deploy"
→ Check browser console (F12) for API errors
→ Verify backend URL in `environment.production.ts`

### "API calls fail"
→ Check CORS settings on backend
→ Verify API domain is accessible
→ Check Netlify environment variables

### "Build fails"
→ Check Netlify build logs for errors
→ Run `npm run build` locally to debug
→ Fix TypeScript/build errors

---

**Questions?** Check [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)
