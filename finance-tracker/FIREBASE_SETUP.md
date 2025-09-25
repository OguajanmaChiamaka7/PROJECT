# Firebase Setup Instructions

## 🔥 Firestore Security Rules

Copy and paste these rules into your Firebase Console (Firestore Database → Rules):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**IMPORTANT**: The above rules are permissive for development. For production, use the more secure rules below:

## 🔒 Production Firestore Rules (Recommended)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only access their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Transactions - users can only access their own transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    // Goals - users can only access their own goals
    match /goals/{goalId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    // User badges - users can only access their own badges
    match /userBadges/{badgeId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    // Daily tasks - users can only access their own tasks
    match /dailyTasks/{taskId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    // Notifications - users can only access their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📋 Setup Steps:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `finance-tracker-83841`
3. **Navigate to Firestore Database**
4. **Click on "Rules" tab**
5. **Replace the existing rules** with the development rules above
6. **Click "Publish"**

## 🧪 Testing the Setup:

After updating the rules, the dashboard should load properly without permission errors.

## 🔧 Additional Firebase Configuration:

### Enable Authentication Methods:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Add your domain to **Authorized domains** if needed

### Firestore Database Setup:
1. Go to **Firestore Database**
2. Make sure it's in **production mode** (not test mode)
3. Choose your preferred **region**

## 🚨 Important Notes:

- The development rules above are permissive and allow any authenticated user to read/write any document
- Use the production rules for better security
- Always test your rules before deploying to production
- Monitor your Firebase usage to avoid unexpected charges

## 📊 Expected Collections:

The app will create these collections automatically:
- `users` - User profiles and settings
- `transactions` - Financial transactions
- `goals` - Savings goals
- `userBadges` - Gamification badges
- `dailyTasks` - Daily tasks
- `notifications` - User notifications