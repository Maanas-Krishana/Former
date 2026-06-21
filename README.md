# Former - Dynamic Form Builder 📝

Former is a full-stack, dynamic form builder application that allows users to design, configure, publish, and share web forms, as well as collect and analyze responses in real-time.

## ✨ Features

- **Drag-and-Drop Form Builder:** Interactively build forms by adding, reordering, and removing fields (Text, Email, Number, Textarea, Dropdown, Checkbox, Radio, Date).
- **Live Preview & Public Form Page:** Instantly preview your form within the dashboard, and share a standalone, public `f/[id]` link for respondents to fill out.
- **Dynamic Field Configuration:** Toggle requirement rules and easily configure multi-choice options dynamically.
- **Responses Dashboard:** A dedicated dashboard to view the total number of submissions and a live data table of collected responses.
- **Zero-Setup Backend:** Powered by `mongodb-memory-server` allowing you to spin up the full stack backend without needing any cloud database credentials out-of-the-box.

## 🛠 Tech Stack

**Frontend:**
- [Next.js (App Router)](https://nextjs.org/)
- React & TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [dnd-kit](https://dndkit.com/) (Drag and Drop)
- Lucide Icons

**Backend:**
- Node.js & [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/) (MongoDB ODM)
- `mongodb-memory-server` (In-memory persistent local DB)

## 🚀 Getting Started

To run this application locally, you will need to start both the `client` (frontend) and `server` (backend).

### 1. Start the Backend Server

Navigate to the `server` directory, install dependencies, and start the development server:

```bash
cd server
npm install
npm run dev
```
*The backend will automatically start an in-memory MongoDB instance and run on `http://localhost:5001`.*

### 2. Start the Frontend Client

Open a new terminal window, navigate to the `client` directory, install dependencies, and start the Next.js app:

```bash
cd client
npm install
npm run dev
```
*The frontend will be accessible at `http://localhost:3001`.*

## 💡 How to Use

1. Open `http://localhost:3001` in your browser.
2. In the **Build** tab, click fields in the left sidebar to add them. Drag them to reorder.
3. In the **Settings** tab, mark any required fields and set your form title.
4. Click the **Publish** button to save the form to the database.
5. In the **Share** tab, copy the generated link and visit it to submit test responses!
6. View the captured data in the **Responses** tab.
