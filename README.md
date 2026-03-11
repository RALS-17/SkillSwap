<div align="center">

<h1>⚡ SkillSwap</h1>
<p><strong>Trade Skills. Not Money.</strong></p>

<p>A community-powered skill exchange platform where knowledge is the currency.<br/>Teach what you know. Learn what you love. Zero cost — always.</p>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

**SkillSwap** is a full-stack community platform that lets people trade skills without exchanging money. Think time-banking: *"I'll teach you React — you teach me Spanish."* Users post what they can teach and what they want to learn, then browse for compatible swap partners, send requests, coordinate sessions, and leave reviews.

Built entirely on **React + Firebase**, SkillSwap runs serverlessly with real-time data, Google Authentication, and a beautifully dark, glassmorphic UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Google Auth** | One-click sign-in via Firebase Authentication |
| 🧙 **3-Step Onboarding** | Guided profile wizard with interactive skill-tag input |
| 🗂️ **Skill Directory** | Browse all swap partners with search and category filtering |
| 🤝 **Swap Requests** | Propose a skill exchange with a time preference and message |
| 💬 **Messages Dashboard** | Manage incoming/outgoing requests; accept or decline |
| 👤 **Rich Profiles** | View teaching skills, learning interests, ratings, and reviews |
| ⭐ **Reputation System** | Earn ratings through completed skill sessions |
| 📱 **Fully Responsive** | Mobile-first layout with a collapsible navigation drawer |

---

## 🛠️ Tech Stack

```
Frontend        React 18 (Vite)
Styling         Vanilla CSS — dark glassmorphism design system
Routing         React Router v6
Backend         Firebase (Auth, Firestore, Storage)
Icons           Lucide React
Fonts           Inter + Syne (Google Fonts)
Hosting         Firebase Hosting (optional)
```

---

## 📁 Project Structure

```
SkillSwap/
├── public/
└── src/
    ├── components/
    │   ├── auth/
    │   │   ├── Login.jsx           # Google sign-in screen
    │   │   └── ProfileSetup.jsx    # 3-step onboarding wizard
    │   ├── layout/
    │   │   └── Navbar.jsx          # Sticky glassmorphic navbar
    │   └── matching/
    │       └── SwapRequest.jsx     # Propose a skill swap form
    ├── context/
    │   └── AuthContext.jsx         # Firebase auth state + provider
    ├── firebase/
    │   └── config.js               # 🔑 Firebase config (fill in your keys)
    ├── hooks/
    │   ├── useAuth.js              # Auth context consumer
    │   ├── useChat.js              # Real-time Firestore chat subscriptions
    │   ├── useFirestore.js         # Generic CRUD helper hook
    │   └── useSkills.js            # Skill search & swap request logic
    ├── pages/
    │   ├── Home.jsx                # Landing page with hero + features
    │   ├── Browse.jsx              # Skill directory with search/filter
    │   ├── Profile.jsx             # Public & own profile view
    │   ├── Messages.jsx            # Swap request inbox
    │   └── SwapDetails.jsx         # Individual swap session view
    ├── App.jsx                     # Router setup + protected routes
    ├── App.css                     # Component-level styles
    └── index.css                   # Global design system & tokens
```

---

## 🗄️ Firestore Data Model

```js
// users/{userId}
{
  uid, email, displayName, photoURL,
  bio, location,
  skillsToTeach: [{ skillId, name, level }],
  skillsToLearn: [{ skillId, name, level }],
  rating,         // float, default 5.0
  createdAt
}

// swapRequests/{requestId}
{
  fromUserId, toUserId,
  skillOffered, skillRequested,
  message,
  status,         // 'pending' | 'accepted' | 'declined' | 'completed'
  createdAt
}

// messages/{chatId}
{
  participants: [userId1, userId2],
  lastMessage, updatedAt,
  // subcollection: chatMessages/{msgId}
  //   { senderId, text, timestamp, read }
}

// reviews/{reviewId}
{
  fromUserId, toUserId,
  swapRequestId,
  rating, comment,
  createdAt
}
```

---

## 🔒 Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users — public read, owner write only
    match /users/{userId} {
      allow read:  if true;
      allow write: if request.auth.uid == userId;
    }

    // Swap Requests — only participants may read/update
    match /swapRequests/{requestId} {
      allow read:   if request.auth.uid == resource.data.fromUserId
                    || request.auth.uid == resource.data.toUserId;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.fromUserId
                    || request.auth.uid == resource.data.toUserId;
    }

    // Messages — only chat participants
    match /messages/{chatId} {
      allow read, write: if request.auth.uid in resource.data.participants;
    }

    // Reviews — public read, authenticated create
    match /reviews/{reviewId} {
      allow read:   if true;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Firebase](https://firebase.google.com/) project with **Firestore** and **Google Auth** enabled

### 1 · Clone the repository

```bash
git clone https://github.com/RALS-17/SkillSwap.git
cd SkillSwap
```

### 2 · Install dependencies

```bash
npm install
```

### 3 · Add your Firebase config

Open `src/firebase/config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_AUTH_DOMAIN",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

> You can find these values in your Firebase Console → Project Settings → Your Apps → Web app config.

### 4 · Configure Firebase

In your Firebase Console:
1. **Authentication** → Sign-in method → Enable **Google**
2. **Firestore Database** → Create database (start in test mode, then apply the security rules above)

### 5 · Run locally

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build optimised production bundle |
| `npm run preview` | Preview the production build locally |

---

## 🌐 Deploying to Firebase Hosting

```bash
# Install Firebase CLI globally (once)
npm install -g firebase-tools

# Login
firebase login

# Initialise (select Hosting, set public dir to "dist")
firebase init hosting

# Build + deploy
npm run build
firebase deploy
```

---

## 🗺️ Roadmap

- [ ] Real-time chat (Firestore subcollection fully wired)
- [ ] Skill Coins economy (earn for teaching, spend for learning)
- [ ] Availability calendar picker
- [ ] Push / browser notifications for swap requests
- [ ] Algolia-powered full-text skill search
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'feat: add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <p>Built with ❤️ using React + Firebase</p>
  <p><strong>SkillSwap</strong> — Trade Skills. Not Money.</p>
</div>
