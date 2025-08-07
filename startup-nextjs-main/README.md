# Startup - Next.js Business Platform

A comprehensive Next.js application with Firebase integration, featuring property verification, user management, and advanced admin capabilities. Built for modern business needs with authentication, real-time database, and file storage.

## 🚀 Live Demo

[View Live Application](https://your-app-url.com) <!-- Update with your actual URL -->

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality

- 🔐 **Firebase Authentication** - Secure user registration and login
- 📊 **Real-time Database** - Firestore integration for data management
- 📁 **File Storage** - Firebase Storage for document and image uploads
- 🏢 **Property Verification** - Advanced property verification system
- 👥 **User Management** - Comprehensive user administration
- 📧 **Email Notifications** - Automated email system with Nodemailer
- 📄 **PDF Processing** - Document processing with PDF.js and Tesseract.js
- 🖼️ **Image Processing** - Google Cloud Vision API integration

### Technical Features

- ⚡ **Next.js 15** - Latest React framework with App Router
- 🎨 **Tailwind CSS v4** - Modern utility-first CSS framework
- 📱 **Responsive Design** - Mobile-first responsive layout
- 🌙 **Dark/Light Mode** - Theme switching capability
- 🔍 **TypeScript** - Full type safety and better developer experience
- 🚀 **Performance Optimized** - Fast loading and optimized builds

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 15
- **Styling:** Tailwind CSS v4
- **UI Components:** Headless UI, Heroicons
- **Rich Text:** Tiptap Editor
- **State Management:** React Hooks
- **Type Safety:** TypeScript

### Backend

- **Runtime:** Node.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage
- **Email:** Nodemailer
- **Image Processing:** Google Cloud Vision API
- **PDF Processing:** PDF.js, Tesseract.js

### DevOps & Tools

- **Version Control:** Git
- **CI/CD:** GitHub Actions
- **Hosting:** Firebase Hosting (recommended)
- **Package Manager:** npm

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- Firebase account
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Firebase configuration values.

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (Server-side)
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./server/serviceAccountKey.json
```

## 🔥 Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)

2. **Enable Authentication**

   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication

3. **Set up Firestore Database**

   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules as needed

4. **Configure Firebase Storage**

   - Go to Storage
   - Set up storage bucket
   - Configure security rules

5. **Generate Service Account Key**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Save as `server/serviceAccountKey.json`

## 🚀 Deployment

### Firebase Hosting

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Deploy using script**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

### Vercel Deployment

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker Deployment

1. **Build Docker image**

   ```bash
   docker build -t your-app-name .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### 🙌 Detailed comparison between the Free and Pro versions of Startup

| Feature                                                           | Free   | Pro    |
| ----------------------------------------------------------------- | ------ | ------ | ------ |
| Next.js Landing Page                                              | ✅ Yes | ✅ Yes |
| All The Integrations - Auth, DB, Payments, Blog and many more ... | ❌ No  | ✅ Yes |
| Homepage Variations                                               | 1      | 2      |
| Additional SaaS Pages and Components                              | ❌ No  | ✅ Yes |
| Functional Blog with Sanity                                       | ❌ No  | ✅ Yes | ✅ Yes |
| Use with Commercial Projects                                      | ✅ Yes | ✅ Yes |
| Lifetime Free Updates                                             | ✅ Yes | ✅ Yes |
| Email Support                                                     | ❌ No  | ✅ Yes |
| Community Support                                                 | ✅ Yes | ✅ Yes |

### [🔥 Get Startup Pro](https://nextjstemplates.com/templates/saas-starter-startup)

[![Startup Pro](https://raw.githubusercontent.com/NextJSTemplates/startup-nextjs/main/startup-pro.webp)](https://nextjstemplates.com/templates/saas-starter-startup)

Startup Pro - Expertly crafted for fully-functional, high-performing SaaS startup websites. Comes with with Authentication, Database, Blog, and all the essential integrations necessary for SaaS business sites.

### [🚀 View Free Demo](https://startup.nextjstemplates.com/)

### [🚀 View Pro Demo](https://startup-pro.nextjstemplates.com/)

### [📦 Download](https://nextjstemplates.com/templates/startup)

### [🔥 Get Pro](https://nextjstemplates.com/templates/saas-starter-startup)

### [🔌 Documentation](https://nextjstemplates.com/docs)

### ⚡ Deploy Now

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNextJSTemplates%2Fstartup-nextjs)

[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/NextJSTemplates/startup-nextjs)

### 📄 License

Startup is 100% free and open-source, feel free to use with your personal and commercial projects.

### 💜 Support

If you like the template, please star this repository to inspire the team to create more stuff like this and reach more users like you!

### ✨ Explore and Download - Free [Next.js Templates](https://nextjstemplates.com)

### Update Log

**10 April 2025**

- Fix peer deps issue with Next.js 15
- Upgrade to tailwind v4
- Refactored blog cards for handling edge cases(text ellipsis on bio, keeping author details at the bottom etc.)
- Re-wrote blog details page with icons separation, fallback author image and better markup.
- Fixed duplicate key errors on homepage.
- Separated icons on theme-switcher button, and refactored scroll-to-top button.

**29 Jan 2025**

- Upgraded to Next.js 15
