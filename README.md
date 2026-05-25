UPYOG Property Tax Analytics Dashboard

A premium AI-powered Property Tax Analytics Dashboard built for the UPYOG multi-tenant platform.
The application provides interactive analytics, property search and filtering, tax collection insights, and an AI Copilot for conversational data exploration across 1,000 property records from 10 Indian cities.

✨ Features
Modern dark glassmorphism UI
Interactive analytics and KPI cards
Dynamic charts and visual insights
Property registry with advanced search & filters
AI Copilot powered by Google Gemini
Responsive desktop-first experience
Smooth animations and micro-interactions

🖥️ Tech Stack
React + Vite
Tailwind CSS
Recharts
Google Gemini API
Framer Motion


🚀 Getting Started
1. Clone the Repository
git clone https://github.com/Haranarayanakarthik/Property-Dashboard.git
cd Property-Dashboard

2. Install Dependencies
npm install

3. Configure Environment Variables
Create a .env file in the root directory:
VITE_GEMINI_API_KEY=your_api_key

Get your API key from
Google AI Studio

▶️ Run the Project
npm run dev
Open:
http://localhost:5173

📦 Production Build
npm run build


## 📂 Project Architecture

```
Propertysecond/
├── .env.example              # Environment variables template
├── .gitignore                # Tells Git what files to ignore (.env included)
├── index.html                # Main index entry (Google fonts & SEO tags)
├── tailwind.config.js        # Tailwind styles & theme configurations
├── postcss.config.js         # PostCSS config
├── vite.config.js            # Vite bundler options
├── src/
│   ├── main.jsx              # App entry point
│   ├── App.jsx               # Dashboard grid builder
│   ├── index.css             # Main stylesheet & animation meshes
│   ├── assets/               # Vite template images
│   ├── data/
│   │   └── properties.json   # 1,000 property records (data layer)
│   ├── utils/
│   │   ├── dataProcessor.js  # Math aggregators & AI summary generation
│   │   └── geminiService.js  # Generative AI SDK client-side service
│   └── components/
│       ├── KpiCard.jsx       # KPI panel card
│       ├── AnalyticsCharts.jsx # Recharts visualization panels
│       ├── PropertyTable.jsx # Explorer data table
│       └── AiChatbot.jsx     # AI assistant chat interface
```


🤖 AI Copilot

The dashboard includes an integrated AI Copilot powered by Google Gemini that can:

Summarize tax analytics
Compare city performance
Answer dataset-related questions
Generate intelligent insights from property records


📸 Dashboard Highlights
Glassmorphic analytics panels
Animated KPI metrics
Interactive charts
AI-powered chat interface
Elegant dark UI with modern gradients
