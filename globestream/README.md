Looking at this, the edit is replacing the README.md file content. The original has a `## 🚀 Quick Start` section at the end that's mostly empty, while the suggested edit replaces it with comprehensive deployment, development, architecture, tech stack, and license sections.

Let me apply the suggested edit to the README.md:

<pp>
# 🌐 GlobeStream

**Browse the world. Stream anything. English subs on everything.**

GlobeStream is an open-source web application that lets users switch regions and browse the internet as if they were physically in another country. It combines a real proxy/VPN infrastructure with a media discovery platform and **always-on English subtitles** for every video.

---

## ✨ Features

### 🛡️ Real Proxy/VPN Tunneling

- **Hysteria2 Protocol** — UDP/QUIC-based, censorship-resistant, blazing fast
- **HTTPS Proxy** — Standard encrypted proxy fallback
- **SOCKS5** — Universal proxy protocol support
- 35+ countries across 7 regions

### 🌍 Region Switching

- One-click country switching with live latency & speed indicators
- 7 region groups, searchable country list, recent-countries bar

### 🔍 Proxy Browser

- Built-in tabbed browser with URL bar & security banner
- All traffic routed through the selected country's exit node

### 🎬 Media Library

- Discover movies & series from Korea, Japan, India, Europe, Latin America, Africa & more
- Filter by type, region, rating, year — search across everything

### 📝 English Subtitles on Every Video

- **Always-on by default** — every single video ships with timed English subtitle cues
- Genre-aware dialogue — Romance, Thriller, Crime, Sci-Fi, Action, Comedy, Drama, Fantasy, Mystery, History, Animation
- **Subtitle panel** — toggle on/off, choose font size (Small / Medium / Large)
- **Settings page** — global toggle & font size preference persisted across sessions
- **Deterministic generation** — same video always produces the same subtitle track
- **VTT export** — subtitle engine can export standard WebVTT files

### ⚡ Speed Test

- Animated speed test with download/upload/latency/jitter

### 🎨 Premium UI/UX

- Dark & Light themes, glassmorphism, Framer Motion animations
- Responsive collapsible sidebar, toast notifications

---

## 🚀 Deploy to Vercel (One Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fglobestream)

> Replace `your-username` in the badge URL with your actual GitHub username after pushing.

### Or Deploy Manually

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Vercel auto-detects Vite — **no config needed**, just click Deploy
5. Done. Your app is live.

**That's it.** The `vercel.json` included in this repo handles:

- SPA fallback routing (all paths → `index.html`)
- Immutable cache headers on hashed assets
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)

### Environment Variables (Optional)

If you want to connect a real proxy backend, set this in Vercel → Settings → Environment Variables:

| Variable             | Description            | Default      |
| -------------------- | ---------------------- | ------------ |
| `VITE_PROXY_API_URL` | Your proxy backend URL | `/api/proxy` |

---

## 💻 Local Development
