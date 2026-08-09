# CivicLens AI — Smart City Civic Infrastructure Intelligence & Automated Governance Platform

> **Targeted Application Showcase**: Cognizant Technology Solutions — Enterprise Systems & AI/Full-Stack Engineering Role  
> **Live Demo**: `http://localhost:3002`

CivicLens AI is an enterprise-grade AI-powered civic infrastructure intelligence platform designed for modern smart cities. It streamlines public grievance reporting for citizens while equipping municipal authorities with real-time spatial duplicate merging, dynamic multi-factor priority dispatching, and predictive infrastructure degradation analytics.

---

## 🌟 Key Features & Technical Highlights

### 1. Multi-Modal AI Citizen Reporting
* **Computer Vision Defect Analysis**: Automatically identifies defect types (potholes, sanitation overflow, water pipeline leakage, streetlight outages, electrical hazards) with confidence scoring and risk assessment.
* **Multilingual Speech & NLU Engine**: Converts voice input (including local Hinglish/multilingual dialects) into structured civic complaint tickets with automatic department routing.
* **Instant Duplicate Merging**: Uses geospatial Haversine calculations to detect duplicate complaints within a 150-meter radius, merging signals and escalating community urgency.

### 2. Municipal Authority Command Center
* **AI Priority Dispatch Queue**: Dynamically ranks complaints (0–100 score) based on defect severity, proximity to high-risk zones (school zones, hospital corridors, heavy traffic arteries), and citizen report density.
* **Engineer Workload Dispatching**: Real-time engineer assignment interface matching nearby available field inspectors to SLA targets.
* **Proof-of-Work Resolution Audit**: Requires field engineers to upload post-repair photo verification before moving tickets to citizen verification status.

### 3. Predictive City Risk & Executive Analytics
* **Ward Degradation & Flood Risk Forecasting**: Machine learning predictive models predicting seasonal drainage failures and road degradation by ward.
* **Executive Performance KPIs**: Interactive charts (Recharts) tracking average resolution SLA, department workload distribution, and monthly civic trends.
* **GIS Spatial Heatmap**: Leaflet-powered GIS mapping displaying color-coded complaint markers and real-time city status.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Framer Motion, Clean Enterprise Light Theme |
| **Spatial / GIS Map** | Leaflet.js, React-Leaflet |
| **Data Analytics** | Recharts (Responsive Line, Bar, and Donut Charts) |
| **Database & ORM** | Prisma ORM, PostgreSQL Schema Ready |
| **AI Integration** | Vision Diagnostics, NLU Speech Parser, Haversine Geospatial Merging |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/yashdixit568-sys/civic-lens-ai.git
cd civic-lens-ai

# 2. Install dependencies
npm install

# 3. Start the Next.js development server
npm run dev -- -p 3002
```

Open `http://localhost:3002` in your browser to interact with the live application.

---

## 💼 Resume Bullet Points (Tailored for Cognizant)

* **Architected & Developed CivicLens AI**, a Next.js 14 & TypeScript enterprise smart city platform featuring multi-modal AI complaint ingestion, geospatial duplicate merging, and predictive infrastructure analytics.
* **Implemented an AI Priority Dispatch Engine** that ranks municipal tasks (0–100 scale) using multi-factor scoring across defect severity, school/hospital zone proximity, and citizen report density.
* **Designed Real-Time GIS Heatmaps & Analytics** using Leaflet.js and Recharts, improving municipal resource allocation efficiency and automated SLA tracking.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
