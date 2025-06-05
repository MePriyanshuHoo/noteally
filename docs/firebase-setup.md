# Firebase Setup Instructions for Noteally

## Completed Steps ✅

1. **Firebase CLI Installation**
   ```bash
   npm install -g firebase-tools
   ```

2. **Project Creation**
   ```bash
   firebase projects:create noteally-app --display-name "Noteally"
   firebase use noteally-app
   ```

3. **Web App Creation**
   ```bash
   firebase apps:create web "Noteally Web App"
   ```

4. **Environment Configuration**
   - Created `.env.local` with Firebase configuration
   - All environment variables are properly set

5. **Firestore Rules Deployment**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Manual Steps Required

### 1. Enable Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/noteally-app/overview)
2. Navigate to **Authentication** → **Get started**
3. Go to **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password** (for basic auth)
   - **Google** (optional, for social login)

### 2. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (rules are already configured)
4. Select your preferred location (us-central1 recommended)

### 3. Configure Firestore Security Rules (Already Done)

The following rules are already deployed:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own notes
    match /notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Verification Steps

### 1. Test Firebase Connection
```bash
npm run dev
```
- Application should start without Firebase errors
- Visit http://localhost:3000 (or 3001)

### 2. Test Authentication
- Go to `/auth` route
- Try creating an account
- Verify in Firebase Console under Authentication → Users

### 3. Test Firestore
- Create a note in the application
- Verify in Firebase Console under Firestore Database

## Environment Variables Reference

Current configuration in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA9j8twXSLexXfR743e5lYSwJCEnYSu2W4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=noteally-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=noteally-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=noteally-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=714651988611
NEXT_PUBLIC_FIREBASE_APP_ID=1:714651988611:web:94d2ef71f3dd5f3c0561b6
```

## Troubleshooting

### Common Issues

1. **Invalid API Key Error**
   - Ensure `.env.local` exists with correct values
   - Restart development server after creating `.env.local`

2. **Auth Domain Error**
   - Enable Authentication in Firebase Console
   - Verify `authDomain` in environment variables

3. **Firestore Permission Denied**
   - Enable Firestore Database in console
   - Ensure security rules are deployed

### Quick Fixes

```bash
# Redeploy Firestore rules
firebase deploy --only firestore:rules

# Check current project
firebase use

# Get SDK config again
firebase apps:sdkconfig WEB 1:714651988611:web:94d2ef71f3dd5f3c0561b6
```

## Additional Configuration

### Enable Hosting (Optional)
```bash
firebase init hosting
firebase deploy --only hosting
```

### Enable Cloud Storage (Optional)
```bash
firebase deploy --only storage
```

## Security Notes

- Never commit `.env.local` to version control
- Add `.env.local` to `.gitignore` (already done)
- Use Firebase Security Rules for data protection
- Enable App Check for production

## Resources

- [Firebase Console](https://console.firebase.google.com/project/noteally-app)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Firebase Guide](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)