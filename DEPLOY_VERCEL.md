# 🚀 Deploy ISOWS-INDIA App to Vercel (FREE)

## Quick Deployment Steps

### 1. **Push to GitHub** (if not already done)
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. **Deploy to Vercel**

#### Option A: Via Vercel Website (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect it's a monorepo
6. Configure:
   - **Frontend**: `frontend` folder
   - **Backend**: `backend` folder
7. Add environment variables (see below)
8. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: isows-india-app
# - Directory: ./
# - Override settings? No
```

### 3. **Environment Variables**
Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```
# Firebase (Required)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. **Custom Domain** (Optional)
- Go to Project → Settings → Domains
- Add your custom domain (e.g., `isows-india.com`)
- Update DNS records as instructed

## 🎯 What You Get

### **Free Tier Includes:**
- ✅ **Unlimited** static hosting
- ✅ **100GB** bandwidth/month
- ✅ **Serverless functions** (backend API)
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Custom domains**
- ✅ **GitHub integration** (auto-deploy on push)

### **Your App Will Be Available At:**
- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api/`

## 🔧 Configuration Files

The following files are already configured:
- `vercel.json` - Vercel configuration
- `package.json` - Root package configuration
- Frontend and backend are properly set up

## 📱 Features That Work in Production

✅ **User Authentication** (Firebase)  
✅ **Work Submission** (Text & File upload)  
✅ **Plagiarism Detection**  
✅ **License Generation** (PDF)  
✅ **Profile Management** (ID Card generation)  
✅ **Payment Integration** (Razorpay)  
✅ **Email Notifications**  
✅ **Mobile Responsive**  

## 🚨 Important Notes

1. **Database**: Currently using local JSON files. For production, consider:
   - Vercel Postgres (free tier)
   - PlanetScale (free tier)
   - MongoDB Atlas (free tier)

2. **File Storage**: Currently local. For production, consider:
   - Vercel Blob Storage
   - AWS S3
   - Cloudinary

3. **Environment Variables**: Make sure to add all required variables in Vercel dashboard

## 🎉 After Deployment

Your app will be live and accessible worldwide! Users can:
- Sign up with Google
- Submit their creative works
- Get instant plagiarism detection
- Generate professional licenses
- Download ID cards
- Make payments (if configured)

## 📞 Support

If you need help with deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [GitHub Issues](https://github.com/your-repo/issues)
