/* VISUAL ARCHIVE (Portfolio page, section 05): edit this file to add photos and videos.
   1. Put the files in  assets/archive/<album>/   (jpg, png, webp, mp4, webm)
   2. List them in the right album below. A plain string works; an object lets you add a caption.
        'assets/archive/jepang/01.webp'
        { src: 'assets/archive/jepang/02.mp4', caption: 'Shibuya at night', poster: 'assets/archive/jepang/02.jpg' }
      Optional  w / h  (pixel size) stop the page from jumping while images load.
   Keep photos ~200 KB (webp) and videos ~5-10 MB (720p mp4, H.264). Paths always start at the site root.
   "All" shows every album plus the photos in ARCHIVE_UNSORTED (not yet put into an album). */
window.ARCHIVE = [
  { id: 'jepang', name: 'Jepang', items: [
    { src: 'assets/archive/jepang/01.webp', w: 1700, h: 767 },
    { src: 'assets/archive/jepang/02.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/03.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/04.webp', w: 1700, h: 765 },
    { src: 'assets/archive/jepang/05.webp', w: 1700, h: 765 },
    { src: 'assets/archive/jepang/06.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/07.webp', w: 1700, h: 765 },
    { src: 'assets/archive/jepang/08.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/09.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/10.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/11.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/12.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/13.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/14.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/15.webp', w: 1700, h: 765 },
    { src: 'assets/archive/jepang/16.webp', w: 810, h: 1800 },
    { src: 'assets/archive/jepang/17.webp', w: 1700, h: 765 },
    { src: 'assets/archive/jepang/18.webp', w: 1700, h: 765 },
    { src: 'assets/archive/jepang/19.webp', w: 1700, h: 765 },
    { src: 'assets/archive/jepang/20.webp', w: 1700, h: 1292 },
    { src: 'assets/archive/jepang/21.webp', w: 1700, h: 765 },
    { src: 'assets/img/portfolio/arc-04.webp', w: 1248, h: 562, caption: 'Shibuya' }
  ] },
  { id: 'korea',    name: 'Korea',    items: [] },
  { id: 'malaysia', name: 'Malaysia', items: [] }
];
window.ARCHIVE_UNSORTED = [
  {
    src: "assets/img/portfolio/arc-01.webp",
    w: 600,
    h: 800
  },
  {
    src: "assets/img/portfolio/arc-02.webp",
    w: 1120,
    h: 504
  },
  {
    src: "assets/img/portfolio/arc-03.webp",
    w: 552,
    h: 980,
    caption: "Petronas Towers"
  },
  {
    src: "assets/img/portfolio/arc-07.webp",
    w: 562,
    h: 1248
  },
  {
    src: "assets/img/portfolio/arc-08.webp",
    w: 960,
    h: 540,
    caption: "Korean palace"
  },
  {
    src: "assets/img/portfolio/arc-05.webp",
    w: 960,
    h: 540
  },
  {
    src: "assets/img/portfolio/arc-06.webp",
    w: 960,
    h: 432
  },
  {
    src: "assets/img/portfolio/arc-09.webp",
    w: 640,
    h: 480
  }
];
