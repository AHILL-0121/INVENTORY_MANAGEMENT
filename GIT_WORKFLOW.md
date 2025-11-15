# 🔄 Git Workflow Guide

Complete guide for version control and GitHub deployment.

---

## 📋 Prerequisites

✅ Git installed ([Download](https://git-scm.com/))  
✅ GitHub account created ([Sign up](https://github.com/))  
✅ All local changes tested and working

---

## 🚀 Initial Setup (First Time)

### Step 1: Initialize Git Repository

Open PowerShell in your project root (`LOCAL` folder):

```powershell
# Initialize Git repository
git init

# Check Git status
git status
```

Expected output: All your files should be listed as untracked.

---

### Step 2: Configure Git (First Time Only)

```powershell
# Set your name (replace with your name)
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

---

### Step 3: Review Files to Commit

```powershell
# See what will be committed
git status

# Check .gitignore is working
ls -Force  # Should see .env files but they won't be committed
```

**Important:** `.gitignore` will automatically exclude:
- ❌ `backend/.env` (contains passwords)
- ❌ `frontend/.env.local` (local config)
- ❌ `node_modules/` (dependencies)
- ❌ `__pycache__/` (Python cache)
- ❌ `.next/` (build files)

---

### Step 4: Stage All Files

```powershell
# Add all files (respects .gitignore)
git add .

# Verify what's staged
git status
```

You should see:
✅ Backend files (*.py, requirements.txt, .env.example)  
✅ Frontend files (*.tsx, *.ts, package.json)  
✅ Documentation (*.md)  
✅ Configuration files  
❌ NO .env or .env.local files  
❌ NO node_modules  
❌ NO .next folder

---

### Step 5: Create First Commit

```powershell
# Commit with descriptive message
git commit -m "Initial commit: Complete inventory analytics system with ML forecasting

- FastAPI backend with JWT authentication
- Next.js frontend with TypeScript and shadcn/ui
- MySQL database integration
- ML-powered demand forecasting
- Comprehensive documentation
- Production-ready deployment guides"
```

---

## 🌐 Push to GitHub

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com/)
2. Click **"+"** → **"New repository"**
3. Fill in details:
   - **Repository name:** `inventory-analytics-system` (or your choice)
   - **Description:** "Local Inventory + Purchase Analytics System with ML Forecasting"
   - **Visibility:** Public (recommended for portfolio) or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

---

### Step 2: Link Local Repository to GitHub

Copy the commands from GitHub (should look like this):

```powershell
# Add GitHub as remote origin (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/inventory-analytics-system.git

# Verify remote was added
git remote -v
```

---

### Step 3: Push to GitHub

```powershell
# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Enter your GitHub credentials when prompted.**

---

### Step 4: Verify Upload

1. Go to your GitHub repository URL
2. You should see all your files uploaded
3. Check that sensitive files (.env) are NOT visible ✅

---

## 🏷️ Create Release Tag (Optional but Recommended)

```powershell
# Create version tag
git tag -a v1.0.0 -m "Version 1.0.0 - Initial production release"

# Push tags to GitHub
git push origin --tags
```

---

## 📝 Daily Development Workflow

### Making Changes

```powershell
# 1. Check current status
git status

# 2. Make your code changes

# 3. Stage changes
git add .

# 4. Commit with meaningful message
git commit -m "feat: Add export to CSV feature"

# 5. Push to GitHub
git push
```

---

## 🌿 Branching Strategy (Recommended)

### Create Feature Branch

```powershell
# Create and switch to new branch
git checkout -b feature/export-csv

# Make your changes...

# Commit changes
git add .
git commit -m "feat: Add CSV export functionality"

# Push branch to GitHub
git push -u origin feature/export-csv
```

### Merge to Main

```powershell
# Switch back to main
git checkout main

# Merge feature branch
git merge feature/export-csv

# Push to GitHub
git push

# Delete feature branch (optional)
git branch -d feature/export-csv
```

---

## 🔄 Conventional Commits Format

Use these prefixes for commits:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `feat:` | New feature | `feat: Add demand forecasting` |
| `fix:` | Bug fix | `fix: Resolve login authentication error` |
| `docs:` | Documentation | `docs: Update deployment guide` |
| `style:` | Code formatting | `style: Format with Prettier` |
| `refactor:` | Code restructure | `refactor: Simplify analytics logic` |
| `test:` | Add tests | `test: Add unit tests for auth` |
| `chore:` | Maintenance | `chore: Update dependencies` |

**Examples:**

```powershell
git commit -m "feat: Add email notifications for low stock"
git commit -m "fix: Resolve chart rendering issue on mobile"
git commit -m "docs: Add API endpoint documentation"
git commit -m "refactor: Optimize database queries"
```

---

## 🔍 Useful Git Commands

### Check Status

```powershell
# See current changes
git status

# See commit history
git log --oneline

# See differences
git diff
```

### Undo Changes

```powershell
# Discard changes in a file
git checkout -- filename.tsx

# Unstage files
git reset HEAD filename.tsx

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) ⚠️ DANGEROUS
git reset --hard HEAD~1
```

### Pull Latest Changes

```powershell
# Pull from GitHub
git pull origin main

# Fetch and view changes without merging
git fetch origin
git log origin/main
```

---

## 📂 What Gets Committed?

### ✅ Included Files

- Source code (`.py`, `.tsx`, `.ts`, `.jsx`, `.js`)
- Configuration (`.json`, `.toml`, `.yaml`)
- Documentation (`.md`)
- Dependencies list (`requirements.txt`, `package.json`)
- Example configs (`.env.example`)
- Git configuration (`.gitignore`)
- License (`LICENSE`)

### ❌ Excluded Files (via .gitignore)

- Environment files (`.env`, `.env.local`)
- Dependencies folders (`node_modules/`, `venv/`)
- Build outputs (`.next/`, `dist/`, `build/`)
- Cache files (`__pycache__/`, `.pytest_cache/`)
- IDE settings (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Logs (`*.log`)

---

## 🚨 Important Security Reminders

### ⚠️ NEVER Commit These Files:

- ❌ `.env` - Contains database passwords
- ❌ `.env.local` - Contains API keys
- ❌ Any file with credentials
- ❌ `node_modules/` - Can be reinstalled
- ❌ Build outputs - Can be regenerated

### ✅ If You Accidentally Committed Sensitive Data:

1. **Remove from Git history:**

```powershell
# Remove .env from Git tracking
git rm --cached backend/.env

# Commit the removal
git commit -m "chore: Remove .env from tracking"

# Push changes
git push
```

2. **Rotate secrets immediately:**
   - Change database password
   - Generate new JWT secret key
   - Update .env file locally

---

## 📊 Repository README Badges

After pushing to GitHub, update your `README.md` badges with your actual repository URL:

Replace:
```markdown
https://github.com/yourusername/inventory-system
```

With:
```markdown
https://github.com/YOUR_ACTUAL_USERNAME/YOUR_ACTUAL_REPO_NAME
```

---

## 🔗 Next Steps After GitHub Push

### 1️⃣ Enable GitHub Actions (CI/CD)

Create `.github/workflows/ci.yml` for automated testing.

### 2️⃣ Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com/)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - Framework: Next.js
   - Root directory: `frontend`
   - Environment variables: `NEXT_PUBLIC_API_URL`
5. Deploy!

### 3️⃣ Deploy Backend to AWS

Follow the comprehensive guide in **DEPLOYMENT.md**.

### 4️⃣ Add Repository Topics

On GitHub, add topics:
- `nextjs`
- `fastapi`
- `mysql`
- `inventory-management`
- `machine-learning`
- `typescript`
- `python`

---

## 🎯 Common Issues & Solutions

### Issue: "Permission denied (publickey)"

**Solution:**
```powershell
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/USERNAME/REPO.git
```

### Issue: "Repository not found"

**Solution:**
- Check repository URL is correct
- Ensure you have access to the repository
- Try re-adding remote:
```powershell
git remote remove origin
git remote add origin https://github.com/USERNAME/REPO.git
```

### Issue: Large files rejected

**Solution:**
```powershell
# Remove large files from tracking
git rm --cached path/to/large/file

# Update .gitignore to exclude them
echo "*.large" >> .gitignore

# Commit and push
git commit -m "chore: Remove large files"
git push
```

---

## 📞 Need Help?

- 📖 [Git Documentation](https://git-scm.com/doc)
- 📖 [GitHub Guides](https://guides.github.com/)
- 💬 [GitHub Community](https://github.community/)
- 🎓 [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

## ✅ Verification Checklist

Before pushing to GitHub, verify:

- [x] All code is working locally
- [x] Tests pass
- [x] Documentation is updated
- [x] .gitignore is configured
- [x] .env files are NOT committed
- [x] README.md is complete
- [x] Commit messages are descriptive
- [x] No sensitive data in commits

---

**You're ready to push to GitHub! 🚀**

Run the commands step by step and your project will be live on GitHub!
