# 🚀 DevInsight — GitHub Developer Analyzer

DevInsight is an AI-powered GitHub developer analysis platform that evaluates a developer’s profile, activity, and technology stack to generate:

* 📊 Developer score
* 🧠 AI hiring insights
* 📈 Activity analytics
* 🧩 Skill distribution visualization

Built as a full-stack project combining **Next.js**, **FastAPI**, **GitHub API**, and **JamAI**.

---

# ✨ Features

## 🔍 GitHub Profile Analysis

* Fetch public GitHub user data
* Repository count analysis
* Follower & activity overview
* Account age calculation
* Profile metadata extraction

---

## 🧮 Developer Scoring System

Custom scoring model based on:

* 📂 Repository activity
* 🌐 Language diversity
* 🕒 Experience (account age)
* 📊 Consistency (repos per year)

Outputs:

* Overall score (0-100)
* Developer level classification
* Score breakdown visualization

---

## 📊 Data Visualizations

### 🥧 Language Distribution Pie Chart

* Shows most used programming languages
* Weighted by repository usage
* Theme-integrated colors

### 📡 Developer Radar Chart

Displays:

* Activity level
* Skill diversity
* Experience maturity
* Consistency trend

Helps recruiters quickly assess developer profile shape.

### 📅 Activity Timeline

Shows developer growth over time:

* Repository creation trends
* Activity patterns
* Development timeline insight

---

## 🤖 AI Developer Insights

Integrated with **JamAI** table-based inference.

Generates structured insights:

* Developer archetype
* Experience assessment
* Technical focus
* Activity pattern
* Strength signals
* Risk signals
* Hiring recommendation
* Ideal role suggestion
* Growth advice

AI outputs are generated from a structured profile summary built from GitHub data.

---

## 🔌 API Architecture

### Next.js API Routes

* `/api/github` → fetches GitHub profile & repos
* `/api/ai` → sends developer summary to backend AI service

### FastAPI Backend

* `/analyze` → pushes profile summary to JamAI table
* Returns structured AI insights

---

## 🧱 Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* TailwindCSS
* shadcn/ui
* Recharts
* Framer Motion

### Backend

* FastAPI
* JamAI SDK
* GitHub REST API

---

# 🧠 Future Improvements (Planned)

* Contribution heatmap analysis
* Commit frequency scoring
* Repo quality metrics (stars, forks, issues)
* AI career trajectory prediction
* Resume export from GitHub profile
* Public shareable developer report link

---

# 📌 Project Purpose

This project was built to:

* Improve full-stack engineering skills
* Explore real AI product architecture
* Demonstrate developer profiling systems
* Serve as a portfolio-level SaaS prototype

---

# 👨‍💻 Author

Built by **Hafiz**
Software Engineering Student
Universiti Tun Hussein Onn Malaysia

Exploring AI-powered developer analytics & modern full-stack architecture.

---

# ⭐ If you like this project

Give it a ⭐ on GitHub and feel free to fork and experiment!
