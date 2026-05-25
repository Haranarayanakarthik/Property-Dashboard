# UPYOG Property Tax Analytics Dashboard

A premium, interactive, and high-fidelity Property Tax Analytics Dashboard built for the **UPYOG** multi-tenant platform. The application provides data aggregates, comparisons, search/filter registries, and a conversational AI Copilot (assistant) for 1,000 property tax records across 10 Indian cities.

---

## 🚀 Live Demo & Visual Highlights

- **Harmonious Dark Theme**: Sleek background gradients, glow effects, and modern fonts (`Plus Jakarta Sans` and `Outfit`).
- **Glassmorphic Panels**: Blurred transparent containers that provide a modern desktop feel.
- **Dynamic Micro-animations**: Micro scale-up effects on buttons/cards, animated typing loaders, and celebration confetti on data milestones.

---


## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Clone & Navigate
```bash
git clone <repository-url>
cd Propertysecond
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Gemini AI API Key
We support two methods for testing:

#### Method A: Env Configuration (Recommended)
1. Copy `.env.example` to a new file named `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...
   ```

#### Method B: Interactive UI Entry
If you do not configure a `.env` file, the UPYOG AI Copilot will display an elegant dialog overlay asking for your API Key. Simply paste it there, and the dashboard will save it to local storage.

> 💡 **Get a free API key** in seconds at [Google AI Studio](https://aistudio.google.com/).

### 4. Start the Application
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
To bundle the project for production distribution:
```bash
npm run build
```

---

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
