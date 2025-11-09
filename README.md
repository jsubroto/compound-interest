# 💸 Power of Compound Interest

A simple interactive demo showing how small, consistent contributions grow over time thanks to compound interest.

🔗 **Live Demo:** [https://jsubroto.github.io/compound-interest](https://jsubroto.github.io/compound-interest)

---

## ✨ Features
- Adjust **principal**, **monthly contribution**, **interest rate**, and **years**
- Choose **compounding frequency** (annual → daily)
- Instant **growth chart** and **year-by-year breakdown**
- Built with **TailwindCSS** (via CDN) — no frameworks, no build tools
- Works **offline** and **deploys automatically** with GitHub Pages

---

## ⚙️ Setup
1. Clone this repo  
   ```bash
   git clone https://github.com/YOUR_USERNAME/compound-interest.git
   cd compound-interest
   ```
2. Open directly in a browser:
   ```bash
   open docs/index.html
   ```
   or on Windows:
   ```bash
   start docs/index.html
   ```

That’s it — no dependencies, no build step.

---

## 🧠 How It Works
- Effective monthly rate:
  ```
  rₘ = (1 + r / n)^(n / 12) − 1
  ```
- Monthly balance update:
  ```
  B₍ₘ₊₁₎ = (Bₘ + PMT) × (1 + rₘ)
  ```

---

## 🚀 Deploy (GitHub Pages)
1. Place `index.html` and `app.js` inside `/docs`
2. Go to **Settings → Pages**
3. Set **Branch:** `main` and **Folder:** `/docs`
4. Visit  
   `https://jsubroto.github.io/compound-interest`

---

## 🪙 License
This project is licensed under the [MIT License](LICENSE).
