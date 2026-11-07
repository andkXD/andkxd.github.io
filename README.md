# Personal Website

Personal portfolio + creative "Artwork" showcase by **Arya Satya Andhika Akbar** (Information Systems, Universitas Airlangga).

Plain HTML / CSS / JavaScript; no build step. Responsive: works on desktop, tablet and phone.

## Structure

Both sites use the same layout: pages at the top, everything else in `assets/`.

```
.
├── index.html                 # entry point → redirects to personal-website/
├── personal-website/          # main portfolio
│   ├── index.html             # home (moon background, intro, menu)
│   ├── pages/                 # projects list + one page per project
│   └── assets/
│       ├── css/               # style.css (base) + responsive.css (mobile, loaded last)
│       ├── js/                # sketch.js (stars) · cloudbg.js (3D moon) · trackers.js · audio.js · theme.js · intro.js
│       ├── audio/             # background music
│       └── img/               # put cloud.jpg here to replace the moon picture
└── Artwork/                   # creative showcase
    ├── index.html             # Top
    ├── gallery.html           # collage gallery (three.js hero)
    ├── info.html
    ├── works/                 # works list + one page per work
    └── assets/
        ├── css/               # style.css (base) + showcase.css (new layouts) + mobile.css (loaded last)
        └── js/                # main.js · art.js · works-data.js
```

## Run locally

Open the folder with VS Code **Live Server**, or from this folder run:

```bash
python -m http.server 5500
```

then visit <http://127.0.0.1:5500/personal-website/>. (Opening the files directly with `file://` can block the audio player and GitHub fetch.)

## Tech

- [p5.js](https://p5js.org/) — animated star background
- [three.js](https://threejs.org/) — 3D point-cloud moon (home) and WebGL glitch hero (Artwork gallery)
- [GSAP](https://gsap.com/) (+ Draggable) — GitHub repo card carousel on the Portfolio page
- GitHub REST API — live repo list (public repos only, rate-limited to 60 requests/hour per IP without a token)

All libraries load from CDNs, so an internet connection is required.

## Responsive notes

- Mobile styles live in two files loaded last: `personal-website/assets/css/responsive.css` and `Artwork/assets/css/mobile.css`. Breakpoint: 900px / 860px.
- Pages in `personal-website/` are tagged `<body data-page="home|projects|detail|life">` so mobile rules only affect the right page.
- On phones the moon is smaller/centred with fewer points, and fewer star trackers are drawn (see `MOBILE` in `cloudbg.js` and `GROUPS` in `trackers.js`).

## Notes

- Works in `Artwork/assets/js/works-data.js` are currently placeholder (lorem ipsum); set `img: 'path/to/image.jpg'` to replace the generated visuals.
- `Artwork/works/_template.html` is a blank template for new works, not a real page.
- Background music files live in `personal-website/assets/audio/`.
