<div align="center">
  <img src="client/public/logo.png" alt="Former Logo" width="120" />
  <h1>Former</h1>
  <p><strong>The Intelligent, Secure, and Dynamic Form Builder</strong></p>
  
  <p>
    <a href="https://former-six.vercel.app"><strong>🌐 Live App: former-six.vercel.app</strong></a>
  </p>
</div>

Former is a modern, full-stack application that allows you to instantly generate single or multi-page forms using AI, customize visual styles (Minimalist Bento vs. Modern Energetic Funky), securely collect responses with Google Auth and Cloudflare Turnstile, and analyze submissions with AI-driven insights.

---

## ✨ Core Features


### 📑 Multi-Page Forms & Step Progress Stepper
- **Page Break Field:** Split complex forms into intuitive, multi-step workflows by simply dropping a `Page Break` divider anywhere in your form canvas.
- **Dynamic Step Progress:** Interactive step indicators with completion checkmarks, customizable section titles, and active step styling.
- **Paginated Validation:** Enforces field validation per page so users complete mandatory fields before moving to subsequent steps.

### 🎨 Form Visual Style Presets & Themes
- **Normal (Classic Bento):** Clean, sophisticated, minimalist layout tailored for professional surveys, feedback, and enterprise workflows.
- **✨ Modern Energetic Funky:** High-energy visual aesthetic featuring vibrant glassmorphism, animated glow accents, gradient badges, and playful micro-interactions.
- **8 Curated Color Palettes:** Indigo, Teal, Rose, Amber, Emerald, Blue, Violet, and Slate.

### 🤖 AI-Powered Form Generation & Insights
- **Instant AI Form Synthesis:** Describe your requirements (e.g., *"A 3-step employee onboarding survey"*), and the built-in **Groq API (Llama 3.1)** automatically generates well-structured single or multi-page forms with appropriate field types and page breaks.
- **AI Response Analysis:** Summarize submission trends, key insights, rating distributions, and actionable recommendations in one click right inside your form dashboard.

### 📋 Drag-and-Drop Builder & Custom Validation
- **11 Rich Field Types:** Text, Email, Number, Dropdown, Checkbox, Radio Button, Date, Text Area, File Upload, Star Rating (1–5), and Page Break.
- **Drag-and-Drop Reordering:** Powered by `@dnd-kit` for fluid field reordering and intuitive page structuring.
- **Advanced Data Requirements:** Enforce strict data integrity with Custom Regex Patterns (e.g., `^\d{10}$` for phone numbers), Min/Max character lengths, and custom error messages.
- **Header Navigation:** Interactive tabs for switching between `Build`, `Settings`, `Share`, and `Responses`.

### 🛡️ Advanced Security & Anti-Bot Protection
- **Cloudflare Turnstile:** Frictionless, invisible bot protection integrated directly into authentication flows.
- **Mobile Client Detection:** Smart header detection (`x-client-type: mobile`) for seamless cross-platform native client integrations.
- **Google OAuth Gate:** Require respondents to authenticate with Google before submitting public forms.
- **Duplicate Submission Prevention:** Restricts verified Google accounts from submitting duplicate entries.

### 📊 Real-Time Response Dashboard & Exporting
- **Metrics Overview:** Monitor live submission counts, form views, and conversion rates in real time.
- **Data Export:** Interactive response tables with one-click direct `.csv` file exports.
- **Instant Sharing & QR Codes:** Share direct links or generate high-res QR codes for easy mobile scanning.

### 🌗 Comprehensive Light & Dark Mode
- Built-in theme switcher powered by `next-themes` with zero-flash hydration protection.
- Native Light mode default with sleek Dark mode support across Landing Page, Dashboard, Form Builder, Public Form Views, and Modal Dialogs.

---

## 🛠 Tech Stack


**Frontend (Client)**
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS & Lucide Icons
- **Theme Management:** `next-themes` (Light/Dark mode)
- **Interactions & Stepper:** `@dnd-kit` (Drag & Drop) & Custom StepProgress
- **Security:** `@marsidev/react-turnstile` & `@react-oauth/google`
- **QR Sharing:** `qrcode.react`

**Backend (Server)**
- **Runtime:** Node.js & Express.js (TypeScript)
- **Database:** MongoDB via Mongoose (Supports `mongodb-memory-server` for zero-setup local dev)
- **AI Integration:** Groq SDK (`llama-3.1-8b-instant`)
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **File Uploads:** Multer with static asset serving

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

## ⚡ Recent Updates (v2.2)


1. **📑 Multi-Page Forms & Step Navigation:** Added `Page Break` fields, horizontal & vertical step indicators, and page-by-page field validation.
2. **✨ Form Visual Style Presets:** Choose between **Normal (Classic Bento)** and **Modern Energetic Funky** modes with glassmorphic backgrounds and glowing accent cards.
3. **🤖 AI Multi-Page Form Generation:** AI system prompt updated to auto-detect multi-section workflows and generate structured multi-page forms with page breaks.
4. **🎨 Minimalist Bento UI Overhaul:** Streamlined interface across landing page, dashboard, and builder with consistent border radius, typography, and contrast tokens.
5. **📱 Mobile Client Compatibility:** Added mobile header detection to bypass web-only Turnstile checks for native client applications.
6. **🌗 Refined Light & Dark Mode:** Polished contrast across AI response summaries, table views, and modal dialogs.

