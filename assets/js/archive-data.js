/* VISUAL ARCHIVE: edit this file to add photos and videos.
   1. Put the files in  assets/archive/<album>/   (jpg, png, webp, mp4, webm)
   2. List them below. A plain string works; an object lets you add a caption.
        'assets/archive/jepang/01.webp'
        { src: 'assets/archive/jepang/02.mp4', caption: 'Shibuya at night', poster: 'assets/archive/jepang/02.jpg' }
      Optional  w / h  (pixel size) stop the page from jumping while images load.
   Keep photos ~200 KB (webp) and videos ~5-10 MB (720p mp4, H.264). Paths always start at the site root. */
window.ARCHIVE = [
  { id: 'jepang',   name: 'Jepang',   items: [] },
  { id: 'korea',    name: 'Korea',    items: [] },
  { id: 'malaysia', name: 'Malaysia', items: [] }
];
