<div align="center">

# 🫧 Lil' Blob Pack — Source Code

The website behind [blobpack.oliverprojects.tech](https://blobpack.oliverprojects.tech)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-34d399?style=flat-square)](LICENSE)

</div>

---

## Stack

- **Next.js 16** (App Router, Server Actions)
- **TypeScript**
- **Tailwind CSS**
- **NextAuth v5** — GitHub OAuth admin login
- **JSON file storage** — no database needed
- **PM2 + Nginx** on a VPS

---

## Features

- Public hub showing all blob packs with FBX/GLB downloads
- Admin panel (GitHub OAuth protected) to upload/edit/delete blobs
- Dynamic pack management — create and delete packs from the UI
- Blob editing — update name, bio, render, model files
- Auto-deploy via GitHub Actions on push to `main`

---

## Self-hosting

```bash
git clone https://github.com/Csiklaoliver/lilblobpack.git
cd lilblobpack
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

### Environment Variables

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://yourdomain.com
ADMIN_GITHUB_USERNAME=your_github_username
```

### GitHub OAuth App

Go to [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App:
- **Callback URL:** `https://yourdomain.com/api/auth/callback/github`

---

## Project Structure

```
app/
  page.tsx                  # Public hub
  admin/page.tsx            # Admin panel (auth protected)
  api/
    upload/route.ts         # Upload new blob
    blobs/[id]/route.ts     # Update blob
    blobs/route.ts          # List / delete blobs
    packs/route.ts          # List / create packs
    packs/[slug]/route.ts   # Delete pack
components/
  HubClient.tsx             # Public frontend
  AdminClient.tsx           # Admin UI
  BlobCard.tsx              # Individual blob card
data/
  blobs.json                # Blob records
  packs.json                # Pack definitions
lib/
  store.ts                  # File-based data layer
  auth.ts                   # NextAuth config
public/uploads/             # Uploaded renders + models
```

---

## License

MIT — see [LICENSE](LICENSE)

Made by [Oliver](https://oliverprojects.tech) · [@csiklaoliver](https://github.com/csiklaoliver)
