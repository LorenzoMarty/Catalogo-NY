const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const sourceEntries = require("../data/product-image-sources.json");

const OUTPUT_DIR = path.resolve(__dirname, "../src/assets/products");
const MANIFEST_JSON_PATH = path.resolve(__dirname, "../data/catalog-image-manifest.json");
const CONCURRENCY = 4;
const MAX_WIDTH = 1200;
const THUMB_WIDTH = 480;
const WEBP_QUALITY = 74;
const THUMB_QUALITY = 62;
const PLACEHOLDER_WIDTH = 32;
const VERSION = "v1";

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "product";
}

function hash(value) {
  return crypto.createHash("sha1").update(String(value)).digest("hex");
}

async function readJsonIfExists(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

function createLimiter(limit) {
  let active = 0;
  const queue = [];

  function run(task, resolve, reject) {
    active += 1;

    Promise.resolve()
      .then(task)
      .then(resolve, reject)
      .finally(function () {
        active -= 1;
        if (queue.length > 0) {
          const next = queue.shift();
          run(next.task, next.resolve, next.reject);
        }
      });
  }

  return function limitTask(task) {
    return new Promise(function (resolve, reject) {
      if (active < limit) {
        run(task, resolve, reject);
        return;
      }

      queue.push({ task, resolve, reject });
    });
  };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "catalogo-ny-image-sync/1.0",
        "accept": "image/avif,image/webp,image/*,*/*;q=0.8"
      },
      redirect: "follow",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error("download failed with status " + response.status);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType && !contentType.startsWith("image/")) {
      throw new Error("unexpected content-type " + contentType);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timer);
  }
}

function relativeAssetPath(fileName) {
  return "assets/products/" + fileName;
}

function normalizeManifestEntry(entry) {
  if (!entry) {
    return entry;
  }

  return {
    ...entry,
    src: entry.src ? entry.src.replace(/^public\/products\//, "assets/products/") : entry.src,
    thumb: entry.thumb ? entry.thumb.replace(/^public\/products\//, "assets/products/") : entry.thumb,
    srcset: entry.srcset ? entry.srcset.replace(/public\/products\//g, "assets/products/") : entry.srcset
  };
}

function createFallbackSvg(entry) {
  const brand = String(entry.brand || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const name = String(entry.name || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500" role="img" aria-label="${name}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10141b" />
          <stop offset="52%" stop-color="#1a2230" />
          <stop offset="100%" stop-color="#0c1016" />
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="42%" r="52%">
          <stop offset="0%" stop-color="rgba(145, 212, 255, 0.24)" />
          <stop offset="100%" stop-color="rgba(145, 212, 255, 0)" />
        </radialGradient>
      </defs>
      <rect width="1200" height="1500" fill="url(#bg)" />
      <rect x="72" y="72" width="1056" height="1356" rx="56" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
      <ellipse cx="600" cy="660" rx="360" ry="240" fill="url(#halo)" />
      <rect x="360" y="360" width="480" height="640" rx="180" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
      <rect x="438" y="268" width="324" height="164" rx="120" fill="rgba(255,255,255,0.05)" />
      <rect x="468" y="1080" width="264" height="28" rx="14" fill="rgba(255,255,255,0.12)" />
      <text x="600" y="1192" text-anchor="middle" fill="rgba(255,255,255,0.72)" font-size="42" font-family="Inter, Arial, sans-serif" letter-spacing="10">${brand.toUpperCase()}</text>
      <text x="600" y="1260" text-anchor="middle" fill="#f6f7fb" font-size="64" font-family="Georgia, Times New Roman, serif">${name}</text>
      <text x="600" y="1332" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="28" font-family="Inter, Arial, sans-serif" letter-spacing="6">IMAGE UNAVAILABLE - LOCAL FALLBACK</text>
    </svg>
  `.trim();
}

async function writeDerivativeAssets(entry, buffer, fileNames, sourceHash, flags) {
  const largePath = path.join(OUTPUT_DIR, fileNames.largeName);
  const thumbPath = path.join(OUTPUT_DIR, fileNames.thumbName);
  const pipeline = sharp(buffer, { failOn: "warning" }).rotate();
  const metadata = await pipeline.metadata();
  const largeInfo = await pipeline
    .clone()
    .resize({
      width: MAX_WIDTH,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({
      quality: WEBP_QUALITY,
      effort: 6
    })
    .toFile(largePath);

  let thumb = null;
  if (largeInfo.width > THUMB_WIDTH) {
    const thumbInfo = await pipeline
      .clone()
      .resize({
        width: THUMB_WIDTH,
        fit: "inside",
        withoutEnlargement: true
      })
      .webp({
        quality: THUMB_QUALITY,
        effort: 6
      })
      .toFile(thumbPath);

    thumb = {
      src: relativeAssetPath(fileNames.thumbName),
      width: thumbInfo.width,
      height: thumbInfo.height
    };
  } else if (await fileExists(thumbPath)) {
    await fs.unlink(thumbPath);
  }

  const blurBuffer = await pipeline
    .clone()
    .resize({
      width: PLACEHOLDER_WIDTH,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({
      quality: 42,
      effort: 6
    })
    .toBuffer();

  return {
    id: entry.id,
    brand: entry.brand,
    name: entry.name,
    sourceHash: sourceHash,
    src: relativeAssetPath(fileNames.largeName),
    width: largeInfo.width,
    height: largeInfo.height,
    thumb: thumb ? thumb.src : null,
    thumbWidth: thumb ? thumb.width : largeInfo.width,
    thumbHeight: thumb ? thumb.height : largeInfo.height,
    placeholder: "data:image/webp;base64," + blurBuffer.toString("base64"),
    srcset: thumb
      ? thumb.src + " " + thumb.width + "w, " + relativeAssetPath(fileNames.largeName) + " " + largeInfo.width + "w"
      : relativeAssetPath(fileNames.largeName) + " " + largeInfo.width + "w",
    sizes: "(max-width: 767px) 74vw, (max-width: 1039px) 31vw, 22vw",
    lightboxSizes: "(max-width: 767px) 92vw, (max-width: 1280px) 56vw, 720px",
    aspectRatio: largeInfo.width + " / " + largeInfo.height,
    originalWidth: metadata.width || largeInfo.width,
    originalHeight: metadata.height || largeInfo.height,
    fallback: Boolean(flags && flags.fallback)
  };
}

async function processEntry(entry, previousManifest) {
  const safeSlug = slugify(entry.name);
  const basename = entry.id + "-" + safeSlug;
  const sourceHash = hash([entry.imageUrl, VERSION, MAX_WIDTH, THUMB_WIDTH, WEBP_QUALITY, THUMB_QUALITY].join("|"));
  const fileNames = {
    largeName: basename + ".webp",
    thumbName: basename + "-thumb.webp"
  };
  const largePath = path.join(OUTPUT_DIR, fileNames.largeName);
  const thumbPath = path.join(OUTPUT_DIR, fileNames.thumbName);
  const previous = previousManifest[entry.id];

  if (
    previous &&
    previous.sourceHash === sourceHash &&
    await fileExists(largePath) &&
    (!previous.thumb || await fileExists(thumbPath))
  ) {
    return {
      entryId: entry.id,
      status: "cached",
      manifestEntry: normalizeManifestEntry(previous)
    };
  }

  try {
    const buffer = await fetchWithTimeout(entry.imageUrl, 20000);
    const manifestEntry = await writeDerivativeAssets(entry, buffer, fileNames, sourceHash, { fallback: false });
    return {
      entryId: entry.id,
      status: previous ? "updated" : "created",
      manifestEntry: manifestEntry
    };
  } catch (error) {
    if (previous && await fileExists(largePath)) {
      return {
        entryId: entry.id,
        status: "stale-cache",
        manifestEntry: normalizeManifestEntry(previous),
        error: error.message
      };
    }

    try {
      const fallbackBuffer = Buffer.from(createFallbackSvg(entry));
      const manifestEntry = await writeDerivativeAssets(entry, fallbackBuffer, fileNames, sourceHash, { fallback: true });
      return {
        entryId: entry.id,
        status: "fallback",
        manifestEntry: manifestEntry,
        error: error.message
      };
    } catch (fallbackError) {
      return {
        entryId: entry.id,
        status: "failed",
        manifestEntry: null,
        error: error.message + " / fallback: " + fallbackError.message
      };
    }
  }
}

async function main() {
  await ensureDir(OUTPUT_DIR);

  const previousManifest = await readJsonIfExists(MANIFEST_JSON_PATH, {});
  const limit = createLimiter(CONCURRENCY);
  const results = await Promise.all(sourceEntries.map(function (entry) {
    return limit(function () {
      return processEntry(entry, previousManifest);
    });
  }));

  const nextManifest = {};
  const failures = [];

  results.forEach(function (result) {
    if (result.manifestEntry) {
      nextManifest[result.entryId] = result.manifestEntry;
    }

    if (result.status === "failed") {
      failures.push(result);
    }
  });

  await fs.writeFile(MANIFEST_JSON_PATH, JSON.stringify(nextManifest, null, 2) + "\n", "utf8");

  const summary = results.reduce(function (accumulator, result) {
    accumulator[result.status] = (accumulator[result.status] || 0) + 1;
    return accumulator;
  }, {});

  console.log("product image sync summary");
  Object.keys(summary).sort().forEach(function (key) {
    console.log(" - " + key + ": " + summary[key]);
  });

  if (failures.length > 0) {
    console.error("failed downloads");
    failures.forEach(function (failure) {
      console.error(" - " + failure.entryId + ": " + failure.error);
    });
    process.exitCode = 1;
  }
}

main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
