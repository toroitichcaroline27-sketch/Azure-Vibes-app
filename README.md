# AzureVibe — AZ-900 Microsoft Azure Fundamentals Exam Prep

> **Gamified Exam Preparation Platform & AI Study Coach for the #1MillionDevs Movement**

[![AZ-900 Aligned](https://img.shields.io/badge/Microsoft%20Learn-AZ--900%20Aligned-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/)
[![Gemini Powered](https://img.shields.io/badge/AI%20Coach-Google%20Gen%20AI-0284c7?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Tailwind%20CSS-10B981?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)

---

## 📖 Overview

**AzureVibe** is an unofficial, gamified full-stack Microsoft Azure AZ-900 Fundamentals preparation platform built to help developers in the **#1MillionDevs Movement** pass their certification on the first try. It transforms abstract cloud architecture into memorable, beginner-friendly mental models with relatable real-world analogies (e.g., ride-hailing taxi fleets for elasticity, apartment rentals for IaaS/PaaS/SaaS, and municipal building codes for Azure Policy vs RBAC).

---

## ⚡ Core Features

1. **📊 Exam Readiness Tracker Dashboard:**
   - Projected Exam Readiness Score percentage calibrated to the official **700 / 1000** passing threshold.
   - Comprehensive breakdown across the 3 official AZ-900 domains:
     - **Domain 1:** Describe Cloud Concepts (25–30%)
     - **Domain 2:** Describe Azure Architecture & Services (35–40%)
     - **Domain 3:** Describe Azure Management & Governance (30–35%)
   - Automated **Weak-Area Identification** with 1-click targeted practice drills.
   - Gamified XP, daily streaks (🔥), and milestone achievement badges.

2. **🎯 Smart Quiz Builder with Detailed Explanations:**
   - **Immediate Visual Feedback:** Highlights the correct answer in green and selected wrong answers in red upon selection.
   - **Why It's Right / Why Each Distractor is Wrong:** Explains not only why the right option is correct, but precisely why each distractor is wrong to eliminate common misconceptions.
   - **Relatable Real-World Analogies:** Practical metaphors (e.g. M-Pesa mobile money scaling, Uber fleet elasticity) to cement abstract cloud concepts.
   - **Mock Exam Simulation:** 45-minute timed exam mode with randomized question sets.
   - **AI Practice Generator:** Generate fresh practice questions on any specific subtopic using Gemini.

3. **🗂️ Flashcard & Spaced Revision Coach:**
   - Interactive 3D flip cards covering core Azure terms and architectural services.
   - Confidence ratings: **"Got It"** vs. **"Needs Practice"** to prioritize spaced repetition.
   - **⚠️ Common Exam Trap** alerts on every card.

4. **🤖 AI Study Buddy & Concept Explainer:**
   - Dedicated cloud tutor powered by **Gemini 3.8 Flash** via `@google/genai`.
   - Explains tricky distinctions (e.g., Fault Domains vs. Update Domains vs. Availability Zones) in simple terms.
   - Preset one-click prompt chips for highest-yield exam concepts.

5. **🎙️ Audio Transcriber, Searchable Database & Word Export (.doc):**
   - Record live microphone audio notes or upload lecture recordings (.mp3, .wav, .m4a, .webm).
   - Transcribes audio using **Gemini 3.5 Transcribe** (`gemini-3.5-transcribe`).
   - Automatically extracts executive summaries, key Azure terms, and high-yield exam tips using **Gemini 3.8 Flash**.
   - **Searchable Database Format:** Full-text instant search across all transcribed notes and concepts.
   - **Word Export:** 1-click **Export to Word (.doc)** for individual transcripts or the complete compendium.

6. **📅 Personal Study Planner:**
   - Input your target exam date and daily available study hours.
   - Auto-generates a structured day-by-day study schedule with interactive task checklists (+10 XP per task).

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend / Database:** Node.js, Express, File-based JSON Database store with real-time score analytics
- **AI Models (@google/genai):**
  - `gemini-3.8-flash` for AI Study Coach, concept analogies, and structured study notes
  - `gemini-3.5-transcribe` for audio lecture transcription
- **Dev & Build Tooling:** Vite, TSX, ESBuild

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)
- A Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/))

### 2. Installation
```bash
# Clone or download the repository
git clone <your-repo-url>
cd <repo-folder>

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```bash
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

### 4. Running the Application
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
The application will be accessible at `http://localhost:3000`.

---

## 📤 Pushing to Your Existing GitHub Repository

To add this project to your existing GitHub repository, run the following commands in your terminal:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add your existing remote GitHub repository
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# If you already have a remote configured, verify with:
# git remote -v

# 3. Stage and commit all files
git add .
git commit -m "Add AzureVibe AZ-900 exam preparation platform"

# 4. Push to your repository (main or your target branch)
git branch -M main
git push -u origin main

# Note: If your existing repository already has commits (e.g. an initial README or license),
# pull with rebase or allow unrelated histories before pushing:
# git pull origin main --rebase --allow-unrelated-histories
# git push origin main
```

---

## 📜 Disclaimer

*Disclaimer: Unofficial AZ-900 study tool based on public Microsoft Learn objectives. Microsoft, Azure, and Microsoft Learn are registered trademarks of Microsoft Corporation. This application is an educational community initiative supporting the #1MillionDevs Movement.*
