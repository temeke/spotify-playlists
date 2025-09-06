# 🎵 Spotify Playlist Generator

Luo älykkäitä Spotify-soittolistoja omista kappaleistasi dynaamisilla suodattimilla.

## ✨ Ominaisuudet

- **🔐 Spotify OAuth2 integraatio** - Turvallinen kirjautuminen
- **📊 Audio Features analyysi** - Tempo, energia, genre, jne.
- **🎛️ Dynaamiset suodattimet** - Luo suodattimia datasi pohjalta
- **💾 Offline-toiminnallisuus** - IndexedDB tallentaa datan paikallisesti
- **🎨 Moderni UI** - Tailwind CSS ja responsive design
- **⚡ Nopea** - React + Vite kehitysympäristö

## 🚀 Pika-aloitus

### 1. Spotify App Setup

1. Mene osoitteeseen [developer.spotify.com](https://developer.spotify.com)
2. Luo uusi App
3. Lisää Redirect URI: `http://localhost:5173/callback`
4. Kopioi Client ID

### 2. Asenna ja käynnistä

```bash
npm install
npm run dev
```

### 3. Käytä sovellusta

1. Syötä Spotify Client ID
2. Kirjaudu Spotifyyn
3. Synkronoi datasi (soittolistat, kappaleet, audio features)
4. Valitse suodattimet
5. Luo uusi soittolista!

## 🏗️ Teknologia Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Database:** IndexedDB (Dexie.js)
- **API:** Spotify Web API
- **Deployment:** Vercel / Netlify (staattinen)

## 📂 Projektin rakenne

```
src/
├── components/          # React komponentit
│   ├── filters/        # Suodatinkomponentit
│   ├── AuthSetup.tsx   # Spotify autentikointi
│   ├── DataSync.tsx    # Datan synkronointi
│   └── MainApp.tsx     # Pääsovellus
├── hooks/              # Custom React hooks
├── services/           # API ja tietokanta palvelut
├── stores/             # Zustand state management
├── types/              # TypeScript määritykset
└── utils/              # Apufunktiot
```

## 🎛️ Käytettävissä olevat suodattimet

### Audio Features
- **Tempo (BPM)** - Kappaleen tahti
- **Energia** - Intensiteetti ja voima
- **Tanssittavuus** - Kuinka hyvin sopii tanssimiseen
- **Positiivisuus** - Musiikillinen positiivisuus
- **Akustisuus** - Akustisten instrumenttien määrä
- **Instrumentaalisuus** - Lauluosuuden puute

### Muut
- **Genret** - Artistien genret
- **Suosio** - Spotify suosio-pisteet
- **Sävellaji** - Musiikillinen sävellaji (C, D, E...)
- **Moodi** - Duuri/molli

## 🚀 Deployment

### Vercel (suositus)
```bash
npm run build
# Upload dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Drag & drop dist/ folder to Netlify
```

**Muista:** Aseta Spotify App Redirect URI vastaamaan production URL:ia!

## 🔧 Ympäristömuuttujat

Ei tarvita! Kaikki toimii selaimessa.

## 📊 Datan hallinta

- Kaikki data tallennetaan **IndexedDB:hen** (selaimeen)
- Ei palvelinta tarvita
- Data pysyy yksityisenä
- Automaattinen cache management

## 🐛 Tuki

Jos kohtaat ongelmia:
1. Tarkista Spotify App konfiguraatio
2. Varmista että Redirect URI:t täsmäävät
3. Tyhjennä selaimen cache tarvittaessa

## 📝 Lisenssi

MIT - Vapaasti käytettävissä

## 🙏 Kiitokset

- Spotify Web API
- React + Vite yhteisö
- Tailwind CSS
- Dexie.js IndexedDB wrapper
