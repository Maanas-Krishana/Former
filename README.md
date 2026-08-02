<div align="center">
  <img src="client/public/logo.png" alt="Former Logo" width="120" />
  <h1>Former</h1>
  <p><strong>The Intelligent, Secure, and Dynamic Form Builder</strong></p>
  
  <p>
    <a href="https://former-six.vercel.app"><strong>🌐 Live App: former-six.vercel.app</strong></a>
  </p>
</div>

Former is a modern, full-stack application that allows you to instantly generate forms using AI, securely collect responses with Google Auth and Cloudflare Turnstile, and enforce advanced data validation rules.

---

## ✨ Core Features

### 🤖 AI-Powered Form Generation & Insights
- **Instant AI Form Builder:** Describe what you need (e.g., *"A feedback survey for a local coffee shop"*), and the built-in **Groq API (Llama 3.1)** generates a complete, well-structured form.
- **AI Response Analysis:** Summarize submission trends, key insights, and actionable recommendations in one click right inside your form dashboard.

### 🌗 Comprehensive Light & Dark Mode
- Built-in theme switcher with client-side hydration protection.
- Native Light mode default with sleek Dark mode support across Landing Page, Dashboard, Form Builder, Public Form Views, and Modal Dialogs.

### 🛡️ Advanced Security & Anti-Bot Protection
- **Cloudflare Turnstile:** Invisible, frictionless bot protection integrated directly into authentication flows.
- **Google OAuth Gate:** Optionally require respondents to log in with Google before filling out a public form.
- **Duplicate Submission Prevention:** Prevents the same verified Google account from submitting a form multiple times.

### 📋 Drag-and-Drop Builder & Custom Validation
- **Rich Field Types:** Text, Email, Number, Textarea, Dropdown, Checkbox, Radio, Date, File Upload, and Star Rating fields.
- **Advanced Data Requirements:** Enforce strict data integrity using Custom Regex Patterns (e.g., `^\d{10}$` for phone numbers), Min/Max character lengths, and custom error messages.
- **Interactive Builder Header:** Raised, highlighted pill tabs for quick switching between `Build`, `Settings`, `Share`, and `Responses`.

### 📊 Real-Time Response Dashboard & Exporting
- Monitor live submission counts, form views, and conversion rates.
- Interactive response tables with direct `.csv` data exporting.

---

## 🛠 Tech Stack

**Frontend (Client)**
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS, Vanilla CSS & Shadcn UI
- **Theme Management:** `next-themes` (Light/Dark mode)
- **Interactions:** `@dnd-kit` (Drag & Drop)
- **Security:** `@marsidev/react-turnstile` & `@react-oauth/google`

**Backend (Server)**
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB via Mongoose (Supports `mongodb-memory-server` for zero-setup local dev)
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
In the `client` directory, create a `.env.local` file with your keys:
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

## 🚀 Production Deployment

- **Production App URL:** [https://former-six.vercel.app](https://former-six.vercel.app)
- **Frontend Host:** Vercel (Root directory: `client`)
- **Backend Host:** Render (Root directory: `server`)

---

## ⚡ Recent Updates (v2.1)

1. **🌗 Native Light/Dark Mode:** Seamless theme toggling with curated dark mode colors across public form views (`/f/[id]`), inputs, modals, and settings.
2. **🎯 Compact Auth Cards:** Redesigned Sign in (`/login`) and Sign up (`/signup`) cards with a precision `max-w-[390px]` layout aligning inputs perfectly with the Cloudflare Turnstile frame.
3. **📌 Highlighted & Raised Navigation Tabs:** Raised interactive pills with shadow and accent color highlights for the `Build`, `Settings`, `Share`, and `Responses` header tabs.
4. **💬 Custom App Dialogs & Toast Notifications:** Replaced native browser alerts with in-app styled modal dialogs and toast notifications.
5. **📱 Enhanced Public Form Aesthetics:** Interactive radio and checkbox cards, star rating micro-animations, and responsive field groups.

