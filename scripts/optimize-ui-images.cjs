const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const jobs = [
  {
    input: "assets/images/new_york.png",
    outputs: [
      { output: "assets/ui/new-york-hero-860.webp", width: 860, quality: 74 },
      { output: "assets/ui/new-york-hero-640.webp", width: 640, quality: 72 }
    ]
  },
  {
    input: "assets/images/statue.png",
    outputs: [
      { output: "assets/ui/statue-720.webp", width: 720, quality: 74 },
      { output: "assets/ui/statue-360.webp", width: 360, quality: 72 }
    ]
  },
  {
    input: "assets/images/filial-bento.png",
    outputs: [
      { output: "assets/ui/store-bento-1024.webp", width: 1024, quality: 76 },
      { output: "assets/ui/store-bento-768.webp", width: 768, quality: 72 }
    ]
  },
  {
    input: "assets/images/filial-duque.png",
    outputs: [
      { output: "assets/ui/store-duque-1024.webp", width: 1024, quality: 76 },
      { output: "assets/ui/store-duque-768.webp", width: 768, quality: 72 }
    ]
  },
  {
    input: "assets/images/matriz.png",
    outputs: [
      { output: "assets/ui/store-matriz-1024.webp", width: 1024, quality: 76 },
      { output: "assets/ui/store-matriz-768.webp", width: 768, quality: 72 }
    ]
  }
];

async function optimize() {
  for (const job of jobs) {
    const metadata = await sharp(job.input).metadata();

    for (const target of job.outputs) {
      await fs.mkdir(path.dirname(target.output), { recursive: true });
      await sharp(job.input)
        .rotate()
        .resize({
          width: Math.min(target.width, metadata.width || target.width),
          withoutEnlargement: true
        })
        .webp({
          quality: target.quality,
          effort: 5
        })
        .toFile(target.output);
    }
  }
}

optimize().catch((error) => {
  console.error(error);
  process.exit(1);
});
