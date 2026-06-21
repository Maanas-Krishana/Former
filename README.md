<div align="center">
  <img src="client/public/logo.png" alt="Former Logo" width="120" />
  <h1>Former</h1>
  <p><strong>The Intelligent, Secure, and Dynamic Form Builder</strong></p>
</div>

Former is a modern, full-stack application that allows you to instantly generate forms using AI, securely collect responses with Google Auth and Cloudflare Turnstile, and enforce advanced data validation rules.

---

## ✨ Core Features

### 🤖 AI-Powered Form Generation
Skip the manual work. Describe what you need (e.g., *"A feedback survey for a local coffee shop"*), and the built-in **Groq API (Llama 3.1)** will instantly generate a complete, well-structured form with all the necessary fields and options.

### 🛡️ Advanced Form Security & Anti-Bot Protection
- **Cloudflare Turnstile:** Invisible, frictionless bot protection integrated directly into the authentication flows.
- **Google OAuth Gate:** Optionally require respondents to log in with Google before filling out a public form.
- **Duplicate Prevention:** The system actively prevents the same verified Google account from submitting a form multiple times.

### 📋 Drag-and-Drop Builder & Custom Validation
- **Rich Field Types:** Support for Text, Email, Number, Textarea, Dropdown, Checkbox, Radio, and Date fields.
- **Advanced Field Requirements:** Enforce strict data integrity using Custom Regex Patterns (e.g., `^\d{10}$` for phone numbers), Min/Max character lengths, and custom error messages.
- **Interactive UI:** Smooth drag-and-drop reordering powered by `dnd-kit`.

### 📊 Real-Time Response Dashboard
Monitor submissions live. View submission counts, respondent identities (if Google Auth was required), and exportable data tables for every form you publish.

---

## 🛠 Tech Stack

**Frontend (Client)**
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS & Shadcn UI
- **Interactions:** dnd-kit (Drag & Drop)
- **Security:** `@marsidev/react-turnstile` (Cloudflare) & `@react-oauth/google`

**Backend (Server)**
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB via Mongoose
- **AI Integration:** Groq SDK (`llama-3.1-8b-instant`)
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs

---

## 🚀 Getting Started

Former uses a **Zero-Setup Backend** via `mongodb-memory-server`. You don't need to configure a cloud database to run this locally!

### 1. Start the Backend Server
Navigate to the `server` directory, install dependencies, and start the development server:

```bash
cd server
npm install
npm run dev
```
*The backend will automatically start an in-memory MongoDB instance and run on `http://localhost:5001`.*

### 2. Configure Local Environment Variables
In the `client` directory, create a `.env.local` file with your security keys:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
NEXT_PUBLIC_API_URL=http://127.0.0.1:5001/api
```

In the `server` directory, create a `.env` file:
```env
JWT_SECRET=super_secret_key
GROQ_API_KEY=your_groq_api_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
MONGODB_URI=your_mongodb_uri # Optional: For persistent cloud storage
```

### 3. Start the Frontend Client
Open a new terminal window, navigate to the `client` directory, install dependencies, and start the Next.js app:

```bash
cd client
npm install
npm run dev
```
*The frontend will be accessible at `http://localhost:3001`.*

---

## 🚀 Deployment Guide

### Backend (Render)
1. Create a new Web Service on Render pointing to the `server` directory.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Add your `GROQ_API_KEY`, `TURNSTILE_SECRET_KEY`, `JWT_SECRET`, and optionally `MONGODB_URI` to the environment variables.

### Frontend (Vercel)
1. Import the project to Vercel and set the Root Directory to `client`.
2. Add your environment variables: `NEXT_PUBLIC_API_URL` (pointing to your Render URL), `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
3. **Important Post-Deployment Steps:**
   - Update your **Google Cloud Console** Authorized Origins and Redirect URIs with your new `.vercel.app` domain.
   - Add your new `.vercel.app` domain to your **Cloudflare Turnstile** dashboard.
