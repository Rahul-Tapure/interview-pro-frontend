# Step-by-Step: Push Code to New GitHub Repo & Deploy

## Step 1: Create New GitHub Repository

### Option A: Web Interface (Easiest)
1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `interview-pro-frontend`
   - **Description:** `Interview Pro - Angular Frontend Application`
   - **Visibility:** Choose `Public` or `Private`
   - **Don't** check "Add README" (we have files)
3. Click **"Create repository"**
4. Copy the HTTPS URL (you'll need it next)

### Option B: GitHub CLI (Fast)
```powershell
# Install if needed
winget install GitHub.cli

# Login
gh auth login

# Create and push
cd d:\project\interview-pro\frontend\interview-pro
gh repo create interview-pro-frontend --public --source=. --remote=origin --push
```

---

## Step 2: Push Your Code to GitHub

Run these commands in PowerShell:

```powershell
# Navigate to project
cd d:\project\interview-pro\frontend\interview-pro

# Verify you're in the right folder
ls -la | grep angular.json

# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/interview-pro-frontend.git

# Change branch name to 'main' (if using 'master')
git branch -M main

# Stage all files
git add .

# Commit with message
git commit -m "chore: initial commit - Angular frontend with Netlify config"

# Push to GitHub
git push -u origin main

# Verify
git remote -v
```

**Output should show:**
```
origin  https://github.com/YOUR_USERNAME/interview-pro-frontend.git (fetch)
origin  https://github.com/YOUR_USERNAME/interview-pro-frontend.git (push)
```

---

## Step 3: Verify on GitHub

1. Go to https://github.com/YOUR_USERNAME/interview-pro-frontend
2. Should see all your files:
   - ✓ `src/` folder
   - ✓ `netlify.toml`
   - ✓ `package.json`
   - ✓ `angular.json`
   - ✓ Documentation files

---

## Step 4: Connect to Netlify

### 4a. Netlify Dashboard
1. Go to https://netlify.com (or sign up free)
2. Click **"Add new site"**
3. Choose **"Import an existing project"**
4. Click **"Connect to Git"**
5. Select **"GitHub"** and authorize
6. Choose your repository: **interview-pro-frontend**

### 4b: Review Build Settings
Netlify will auto-detect from `netlify.toml`:

```
✅ Build command:       npm run build
✅ Publish directory:   dist/interview-pro/browser
✅ Base directory:      (blank/root)
✅ Functions directory: (blank/not needed)
```

Click **"Deploy site"** - Netlify auto-builds!

---

## Step 5: Set Environment Variables

### In Netlify Dashboard:

1. Go to **Site Settings**
2. Navigate to **Build & Deploy** → **Environment**
3. Click **"Edit variables"** (or **"Add environment variables"**)
4. Add these variables:

```
KEY:                   VALUE:
─────────────────────  ───────────────────────────────────
BACKEND_API_URL        https://your-backend-domain.com
NODE_ENV               production
```

Then click **"Save"**

---

## Step 6: Update Backend Configuration

### On Your Backend Server

Update CORS settings to allow your Netlify domain:

**application.properties:**
```properties
cors.allowed.origins=https://interview-pro.netlify.app,https://yourdomain.com
cors.allowed.methods=GET,POST,PUT,DELETE,OPTIONS
cors.allow.credentials=true
```

**Or Spring Boot Config:**
```java
@Configuration
public class CorsConfiguration {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/interviewpro/**")
                    .allowedOrigins(
                        "https://interview-pro.netlify.app",
                        "https://yourdomain.com"
                    )
                    .allowedMethods("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

Restart your backend service!

---

## Step 7: Test Deployment

1. Check Netlify Deploy Status:
   - Go to **Deployments** tab
   - Should see green checkmark = Success ✅
   - Click deploy to see build logs

2. Test Live Site:
   - Visit: `https://interview-pro.netlify.app`
   - Test login (check browser console F12 → Console)
   - Test API calls work

3. Debug Any Issues:
   - **Browser Console (F12):**
     - Look for API/CORS errors
     - Red error messages indicate problems
   - **Network Tab:**
     - Check API requests to backend
     - Should see 200 status codes
   - **Netlify Build Logs:**
     - View actual build output
     - Look for "Build complete" message

---

## Your URLs After Deployment

```
GitHub Repo:     https://github.com/YOUR_USERNAME/interview-pro-frontend
Live Site:       https://interview-pro.netlify.app
Netlify Dash:    https://app.netlify.com/sites/interview-pro

(Optional Custom Domain)
Your Domain:     https://interview-pro.yourdomain.com
```

---

## From Now On: Automatic Deployments

Every time you push to GitHub:

```powershell
# Make changes
code src/app/home/home.component.ts

# Commit and push
git add .
git commit -m "feat: update home page"
git push origin main

# Take 2-3 minutes...
# → Netlify auto-builds
# → Tests run
# → Site deploys
# → Changes live! 🎉
```

**No manual uploads needed!**

---

## Quick Command Reference

| Task | Command |
|------|---------|
| Push changes | `git push origin main` |
| See status | `git status` |
| View logs | `git log --oneline` |
| Check remotes | `git remote -v` |
| Switch branch | `git checkout -b feature-name` |
| Create PR | GitHub UI or `gh pr create` |

---

## Configuration Summary for Netlify UI

When Netlify asks you to configure:

| Setting | Your Value |
|---------|-----------|
| Project name | `interview-pro` |
| Branch to deploy | `main` |
| Base directory | (leave blank) |
| Build command | `npm run build` |
| Publish directory | `dist/interview-pro/browser` |
| Functions directory | (leave blank) |
| Environment Variable 1 | `BACKEND_API_URL` = `https://your-backend.com` |
| Environment Variable 2 | `NODE_ENV` = `production` |

---

## Still Have Questions?

See detailed docs:
- [GITHUB_NETLIFY_SETUP.md](./GITHUB_NETLIFY_SETUP.md) - Full configuration guide
- [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) - Troubleshooting
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Quick reference

---

**Ready? Start with Step 1!** 🚀
