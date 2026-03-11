# Firebase Firestore Security Rules

## How to Deploy These Rules

### Option 1: Firebase Console (Manual)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **skillswap-408e5**
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

### Option 2: Firebase CLI (Recommended)
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Rules Overview

### Users Collection (`/users/{userId}`)
- ✅ **Read**: Anyone can view user profiles (for browsing)
- ✅ **Write**: Only the user can update their own profile

### Swap Requests Collection (`/swapRequests/{requestId}`)
- ✅ **Read**: Only sender and receiver can view the request
- ✅ **Create**: Any authenticated user can create requests
- ✅ **Update**: Only sender and receiver can accept/decline
- ✅ **Delete**: Only sender and receiver can delete

### Chats Collection (`/chats/{chatId}`)
- ✅ **Read**: Only participants in the chat
- ✅ **Create**: User must be in the participants list
- ✅ **Update**: Only participants can update chat metadata

### Messages Subcollection (`/chats/{chatId}/messages/{messageId}`)
- ✅ **Read**: Only chat participants
- ✅ **Create**: Only chat participants, and senderId must match auth user
- ✅ **Update/Delete**: Only the message sender

## Security Features

1. **Authentication Required**: All write operations require authentication
2. **Participant Verification**: Chat and message access limited to participants
3. **Sender Validation**: Messages can only be created by the authenticated user
4. **Resource Isolation**: Users can only access their own data and conversations
5. **Read-Only Public Data**: User profiles are public for browsing/searching

## Testing Rules

You can test these rules in the Firebase Console:
1. Go to **Firestore Database** → **Rules** tab
2. Click **Rules Playground**
3. Test different scenarios:
   - Authenticated user reading their chat
   - Unauthenticated user trying to read chats (should fail)
   - User trying to send message in someone else's chat (should fail)

## Common Issues

### Issue: "Missing or insufficient permissions"
- **Cause**: User not authenticated or not a chat participant
- **Fix**: Ensure user is logged in and part of the conversation

### Issue: Messages not loading
- **Cause**: Chat document doesn't have participants array
- **Fix**: Check chat document structure includes `participants: [userId1, userId2]`

## Rule Changes from Original

Added new rules for:
- ✅ Chats collection with participant verification
- ✅ Messages subcollection with sender validation
- ✅ Improved swapRequests rules with proper field checks
- ✅ Default deny-all for unknown collections
