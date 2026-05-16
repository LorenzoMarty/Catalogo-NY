const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const jobs = [
  {
    input: "src/assets/images/new_york.png",
    outputs: [
      { output: "src/assets/ui/new-york-hero-720.webp", width: 720, quality: 73 },
      { output: "src/assets/ui/new-york-hero-860.webp", width: 860, quality: 74 },
      { output: "src/assets/ui/new-york-hero-640.webp", width: 640, quality: 72 }
    ]
  },
  {
    input: "src/assets/images/statue.png",
    outputs: [
      { output: "src/assets/ui/statue-520.webp", width: 520, quality: 73 },
      { output: "src/assets/ui/statue-720.webp", width: 720, quality: 74 },
      { output: "src/assets/ui/statue-360.webp", width: 360, quality: 72 }
    ]
  },
  {
    input: "src/assets/images/filial-bento.png",
    outputs: [
      { output: "src/assets/ui/store-bento-640.webp", width: 640, quality: 70 },
      { output: "src/assets/ui/store-bento-1024.webp", width: 1024, quality: 76 },
      { output: "src/assets/ui/store-bento-768.webp", width: 768, quality: 72 }
    ]
  },
  {
    input: "src/assets/images/filial-duque.png",
    outputs: [
      { output: "src/assets/ui/store-duque-640.webp", width: 640, quality: 70 },
      { output: "src/assets/ui/store-duque-1024.webp", width: 1024, quality: 76 },
      { output: "src/assets/ui/store-duque-768.webp", width: 768, quality: 72 }
    ]
  },
  {
    input: "src/assets/images/matriz.png",
    outputs: [
      { output: "src/assets/ui/store-matriz-640.webp", width: 640, quality: 70 },
      { output: "src/assets/ui/store-matriz-1024.webp", width: 1024, quality: 76 },
      { output: "src/assets/ui/store-matriz-768.webp", width: 768, quality: 72 }
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
