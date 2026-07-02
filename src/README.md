# Admin Panel - PureHome Foods

A modern admin panel for managing inventory, orders, and customer data.

## 🚀 Features

- **Dashboard** - Overview of orders, revenue, and business metrics
- **Orders Management** - View and update order statuses
- **Products** - Add, edit, and manage product catalog
- **Customers** - View customer information and contacts
- **Replacements** - Handle replacement requests
- **Site Settings** - Configure site-wide settings
- **Reels** - Manage YouTube Shorts/Reels

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

The app requires Firebase for authentication and database. Follow these steps:

1. **Get your Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (or create a new one)
   - Go to Project Settings → General
   - Scroll down to "Your apps" and copy the Firebase configuration

2. **Update the `.env` file:**
   
   Replace the placeholder values in `.env` with your actual Firebase credentials:

   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Set up Firebase Authentication:**
   - In Firebase Console, enable Email/Password authentication
   - Go to Firestore Database → Rules and set appropriate rules
   - Create a document in `config/admins` collection with a field `uids` containing an array of admin user UIDs

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## 🎨 Design Changes

**Dark Mode Removed**: This version has the dark mode functionality completely removed. The app now uses a consistent light theme throughout.

## 📝 Important Notes

- **White Screen Issue**: If you see a white screen after opening the site, it means your Firebase configuration is not set up correctly. Please follow the setup instructions above.
- **Admin Access**: Only users whose UIDs are listed in the `config/admins` Firestore document can log in.
- **Security**: Make sure to set proper Firestore security rules in production.

## 🔐 Admin User Setup

To add an admin user:

1. Create a user account in Firebase Authentication
2. Copy the user's UID
3. In Firestore, create/update the document at `config/admins`
4. Add the UID to the `uids` array field

Example Firestore structure:
```
config/
  └── admins/
      └── uids: ["user-uid-1", "user-uid-2"]
```

## 📦 Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase** - Backend (Auth + Firestore)
- **Lucide React** - Icons

## 🐛 Troubleshooting

### White/Blank Screen
- Check if `.env` file exists with correct Firebase credentials
- Open browser console (F12) to see error messages
- Verify Firebase project is set up correctly

### Cannot Login
- Verify your user UID is in the `config/admins` document
- Check Firebase Authentication is enabled
- Ensure Email/Password sign-in method is enabled in Firebase Console

### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Make sure all dependencies are installed

## 📄 License

Private project for PureHome Foods
