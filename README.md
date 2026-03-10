# BOOKIFY

BOOKIFY is a full-stack book marketplace experience built with React + Vite + Firebase.
Users can authenticate, publish books, manage their own listings (CRUD), read multi-page previews, place orders, and maintain a profile with avatar and reading stats.

## Live Features

- Authentication: Email/password and Google sign-in
- Protected routes for authenticated users
- Book publishing with cover image upload (Cloudinary)
- Book management (Create, Read, Update, Delete) for owner listings
- Book preview reader with pagination (`Previous` / `Next`)
- Order placement and personal orders page
- User profile page:
  - Avatar upload
  - Name, email, bio
  - Books read count
  - Books created count
  - Joined date
- Responsive UI for desktop, tablet, and mobile
- Logout confirmation modal

## Tech Stack

- Frontend: React 19, React Router 7, Tailwind CSS 4
- Build Tool: Vite 7
- Backend Services: Firebase Authentication, Firestore
- Media Storage: Cloudinary

## Project Structure

```text
BOOKIFY/
  public/
  src/
    assets/
    components/
      Footer.jsx
      Navbar.jsx
      Orders.jsx
    context/
      Firebase.jsx
    pages/
      About.jsx
      Detail.jsx
      Home.jsx
      List.jsx
      LoginPage.jsx
      Profile.jsx
      Reader.jsx
      Register.jsx
    App.jsx
    App.css
    index.css
    main.jsx
  eslint.config.js
  index.html
  package.json
  vite.config.js
  README.md
```

## Getting Started

### 1) Clone

```bash
git clone https://github.com/AngadRahangdale1/BOOKIFY.git
cd BOOKIFY
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Create a `.env` file in project root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

Note: Current code may include fallback values for Firebase/Cloudinary. For production and hackathon submission, use env values only.

### 4) Run locally

```bash
npm run dev
```

### 5) Build for production

```bash
npm run build
npm run preview
```

## How Multi-Page Preview Works

When creating or editing a book, split pages using `---` on a separate line:

```text
Page 1 content
---
Page 2 content
---
Page 3 content
```

Reader page supports previous/next navigation and robust parsing for both Unix and Windows line endings.

## Deployment (Vercel)

1. Push this project to GitHub.
2. Import repository in Vercel.
3. Add all `VITE_*` environment variables in Vercel project settings.
4. Deploy.

Build command: `npm run build`
Output directory: `dist`

## Security Notes

- Configure Firestore security rules to ensure only owners can edit/delete their books.
- Restrict profile updates to authenticated owner documents.
- Do not commit sensitive keys or private presets.

## Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## Author

- GitHub: [@AngadRahangdale1](https://github.com/AngadRahangdale1)

## License

This project is for educational and hackathon use. Add a license file (`LICENSE`) if you want open-source distribution terms.
