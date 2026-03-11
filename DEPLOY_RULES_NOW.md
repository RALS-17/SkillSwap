# 🚨 IMPORTANT: Deploy Firestore Rules NOW

## The "Missing or insufficient permissions" error means your Firestore rules haven't been deployed yet!

### Quick Fix (2 minutes):

1. **Open Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `skillswap-408e5`
3. **Go to**: Firestore Database → Rules tab (in the left menu)
4. **Copy everything** from the `firestore.rules` file in your project
5. **Paste** into the rules editor on Firebase Console
6. **Click "Publish"** button
7. **Wait 30 seconds** for rules to propagate
8. **Refresh your app** and try clicking Message button again

### Your Rules File Location:
📁 `SkillSwap/firestore.rules`

### Copy These Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users Collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Swap Requests Collection
    match /swapRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Chats Collection - THIS FIXES THE MESSAGE ERROR
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // Skills Collection
    match /skills/{skillId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### ✅ After Deploying Rules:
- Messages button will work ✓
- Chat creation will work ✓
- Sending messages will work ✓
- No more permission errors ✓

### 📺 Visual Guide:
1. Firebase Console: https://console.firebase.google.com
2. Left sidebar → Click "Firestore Database"
3. Top tabs → Click "Rules"
4. Replace everything with rules above
5. Click "Publish" button (blue button top right)
6. Done! ✨

**Note**: The rules are already in your project folder, you just need to publish them to Firebase!
