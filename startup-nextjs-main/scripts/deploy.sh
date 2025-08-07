#!/bin/bash

# Deployment script for Firebase hosting
# This script builds the application and deploys it to Firebase

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ You are not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

# Export static files for hosting
echo "📤 Exporting static files..."
npm run export

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is now live!"
