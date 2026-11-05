# Personal Website

Personal portfolio + creative "Artwork" showcase by **Arya Satya Andhika Akbar** (Information Systems, Universitas Airlangga).

Plain HTML / CSS / JavaScript; no build step.

## Structure

```
.
├── personal-website/     # main portfolio (intro, projects, info, music player)
│   ├── index.html
│   ├── pages/            # project pages (portfolio, life study, ...)
│   └── assets/           # css, js (p5 background, audio player), audio
└── Artwork/              # creative showcase
    ├── index.html        # Top
    ├── gallery.html      # collage gallery (three.js hero)
    ├── works/            # works list + detail pages
    └── info.html
```

## Run locally

Open the folder with VS Code **Live Server**, or from this folder run:

```bash
python -m http.server 5500
```

then visit <http://127.0.0.1:5500/personal-website/>. (Opening the files directly with `file://` can block the audio player and GitHub fetch.)

## Tech

- [p5.js](https://p5js.org/) — animated background
- [GSAP](https://gsap.com/) (+ Draggable) — GitHub repo card carousel on the Portfolio page
- [three.js](https://threejs.org/) — WebGL glitch hero on the Artwork gallery
- GitHub REST API — live repo list (public repos only, rate-limited to 60 requests/hour per IP without a token)

All libraries load from CDNs, so an internet connection is required.

## Notes

- Works in `Artwork/js/works-data.js` are currently placeholder (lorem ipsum); set `img: 'path/to/image.jpg'` to replace the generated visuals.
- Background music files live in `personal-website/assets/audio/`.
