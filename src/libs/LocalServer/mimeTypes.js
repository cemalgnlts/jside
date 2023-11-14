const mimeTypeDB = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  webp: "image/webp",
  png: "image/png",
  apng: "image/apng",
  svg: "image/svg+xml",
  htm: "text/html",
  css: "text/css",
  html: "text/html",
  txt: "text/plain",
  js: "text/javascript",
  jsx: "text/javascript-jsx",
  mjs: "text/javascript",
  json: "application/json",
  xhtml: "application/xhtml+xml",
  wav: "audio/wav",
  mp3: "audio/mpeg",
  webm: "video/webm",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  otf: "font/otf",
  ttf: "font/ttf",
  woff: "font/woff",
  woff2: "font/woff2",
  default: "application/octet-stream",
};

function getMimeType(ext) {
  const type = mimeTypeDB[ext];

  return type ? type : mimeTypeDB.default;
}

export { getMimeType };