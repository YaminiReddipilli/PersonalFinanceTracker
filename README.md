# Personal Finance Tracker

A modern, full-stack personal finance management app that helps users track expenses, analyze spending, and manage receipts with advanced analytics and OCR capabilities.

## Features
- **Expense & Income Tracking:** Add, view, and categorize transactions.
- **Receipt OCR:** Upload receipts (image/PDF) and auto-extract expense data using advanced OCR.
- **Analytics Dashboard:** Visualize spending by category, time period, and savings trends.
- **Pagination:** Efficiently browse large transaction histories.
- **Authentication:** Secure login and registration.
- **Modern UI:** Clean, responsive interface with Tailwind CSS and React.

## Technology Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **OCR:** Tesseract.js, Sharp, pdf-parse

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud instance)

### 1. Clone the Repository
```
git clone <repo-url>
cd PersonalFinanceAssistant-<hash>
```

### 2. Server Setup
```
cd server
npm install
```

- Create a `.env` file in the `server` directory with the following:
  ```
  MONGODB_URI=<your-mongodb-uri>
  JWT_SECRET=<your-secret>
  PORT=5000
  ```
- Start the server:
  ```
  npm start
  ```
  The server runs on [http://localhost:5000](http://localhost:5000)

### 3. Client Setup
```
cd client
npm install
```
- Start the client:
  ```
  npm run dev
  ```
  The client runs on [http://localhost:5173](http://localhost:5173) by default.

---

## Usage
- Register and log in to your account.
- Add expenses/income manually or upload a receipt for automatic extraction.
- View analytics on the dashboard: category-wise charts, time filters, and savings insights.
- Browse transactions with robust pagination.

## Folder Structure
```
client/    # React frontend
server/    # Node.js backend
```

## Key Files
- `client/src/pages/Dashboard/Home_New.jsx` — Main dashboard with analytics and pagination
- `client/src/components/EnhancedCharts.jsx` — Advanced chart visualizations
- `server/controllers/receiptController.js` — OCR and receipt parsing logic
- `server/controllers/dashboardController.js` — Analytics and transaction APIs

## Notes
- For OCR, ensure Tesseract.js and Sharp dependencies are installed (handled by `npm install`).
- Uploaded receipts are processed and then deleted from the server for security.
- All code is clean, professional, and ready for interview demonstration.

---

## YOUTUBE APPLICATION LINK:https://youtu.be/juiXAV82Xt4


