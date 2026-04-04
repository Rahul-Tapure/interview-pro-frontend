#!/bin/bash
# Netlify Deployment Checklist

echo "🚀 Netlify Deployment Pre-Flight Checklist"
echo "==========================================="
echo ""

# Check 1: Git repository
echo "✓ Git repository initialized"
git rev-parse --git-dir > /dev/null 2>&1

# Check 2: netlify.toml exists
if [ -f "netlify.toml" ]; then
    echo "✓ netlify.toml configured"
else
    echo "✗ netlify.toml missing"
fi

# Check 3: Environment file
if [ -f "src/environments/environment.production.ts" ]; then
    echo "✓ Production environment file exists"
    if grep -q "your-actual-backend" src/environments/environment.production.ts; then
        echo "⚠ Warning: Backend URL still has placeholder - update it!"
    else
        echo "  API URL set: $(grep apiUrl src/environments/environment.production.ts)"
    fi
fi

# Check 4: Build output
if [ -d "dist/interview-pro/browser" ]; then
    size=$(du -sh dist/interview-pro/browser | cut -f1)
    echo "✓ Build output ready (size: $size)"
fi

# Check 5: Git status
changes=$(git status -s | wc -l)
if [ "$changes" -gt 0 ]; then
    echo ""
    echo "📝 Pending changes to commit: $changes file(s)"
    echo ""
    echo "Ready to deploy? Run:"
    echo "  git add ."
    echo "  git commit -m 'chore: setup Netlify deployment'"
    echo "  git push origin master"
else
    echo "✓ No pending changes"
fi

echo ""
echo "🔗 Next steps:"
echo "  1. Commit and push to GitHub"
echo "  2. Visit netlify.com and connect your repository"
echo "  3. Set BACKEND_API_URL in Netlify environment variables"
echo "  4. Update CORS on your backend"
echo "  5. Done! Auto-deployment enabled"
