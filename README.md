# � GhostPoll

**Ephemeral, anonymous polls that disappear into the void.**

GhostPoll is a privacy-first polling application designed for Indie Hackers who need quick, honest feedback without the baggage of permanent data storage. Create polls that auto-delete after 24 hours, ensuring your data vanishes without a trace.

![GhostPoll Banner](./public/assets/hero-mascot.gif)

## ✨ Features

- 🔒 **Privacy-First**: No tracking, no signup required
- ⏱️ **Ephemeral**: Polls auto-delete after 24h (or custom duration)
- 😊 **Emoji Voting**: Quick feedback with 5 emoji reactions
- 📊 **Multiple Choice**: Custom options for group decisions
- � **Bilingual**: Full support for English and French
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- 🚀 **Fast**: Built with Nuxt 3 and deployed on Cloudflare Pages
- � **Ghost Reveal**: Hide results until you're ready to reveal them

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or compatible runtime
- pnpm (recommended) or npm
- Upstash Redis account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ghostpoll.git
cd ghostpoll
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
cp wrangler.toml.example wrangler.toml
```

Edit `.env` and `wrangler.toml` with your Upstash Redis credentials:
- Get your credentials at [Upstash Console](https://console.upstash.com/)

4. **Run development server**
```bash
pnpm dev
# or
npm run dev
```

Visit `http://localhost:3000` 🎉

## 🏗️ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Upstash Redis](https://upstash.io/)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Language**: TypeScript
- **Icons**: Material Icons

## 📦 Project Structure

```
ghostpoll/
├── assets/          # Static assets (images, GIFs)
├── components/      # Vue components
├── composables/     # Vue composables (useLanguage, useApi, etc.)
├── pages/           # Application pages
│   ├── index.vue    # Homepage
│   ├── vote/        # Voting pages
│   ├── admin/       # Admin dashboard
│   └── created.vue  # Poll creation success
├── server/          # Server-side code
│   ├── api/         # API endpoints
│   └── utils/       # Server utilities
├── types/           # TypeScript type definitions
└── public/          # Public static files
```

## 🌍 Deployment

### Cloudflare Pages

1. **Build the project**
```bash
pnpm build
```

2. **Deploy with Wrangler**
```bash
npx wrangler pages deploy .output/public
```

3. **Set environment variables** in Cloudflare Dashboard:
   - `UPSTASH_REDIS_URL`
   - `UPSTASH_REDIS_TOKEN`

## 🎨 Features in Detail

### Poll Types

1. **Emoji Vote**: Quick sentiment analysis with 5 emoji reactions
2. **Multiple Choice**: Custom options for detailed feedback

### Vote Modes

- **Single Vote**: One person = one vote (recommended)
- **Allow Revote**: Participants can change their mind

### Visibility Options

- **Live Results**: Everyone sees results immediately
- **Ghost Reveal 👻**: Results hidden until you reveal them (NEW!)

### Durations

- 1 hour
- 6 hours
- 12 hours
- 24 hours (default)
- 48 hours

## 🔐 Security & Privacy

- No user tracking or analytics
- No personal data collection
- Anonymous voting with fingerprinting
- Automatic data deletion
- Redis-based ephemeral storage

## 🌐 Internationalization

GhostPoll supports:
- 🇬🇧 English
- 🇫🇷 French

Toggle between languages using the button in the top-right corner.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by the need for ephemeral, privacy-first feedback tools
- Built for the Indie Hacker community
- Mascot design: Custom GhostPoll ghost 👻

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with 👻 by an Fernandez KOUAGOU**

*Remember: All polls disappear into the void. No traces left. It's ephemeral.*
