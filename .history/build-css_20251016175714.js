const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");

const inputPath = path.join(__dirname, "public/css/tailwind.css");
const outputPath = path.join(__dirname, "public/css/output.css");

fs.readFile(inputPath, (err, css) => {
  if (err) throw err;
  postcss([tailwindcss(path.join(__dirname, "tailwind.config.js"))])
    .process(css, { from: inputPath, to: outputPath })
    .then(result => {
      fs.writeFileSync(outputPath, result.css);
      console.log("✅ Tailwind CSS built successfully!");
    });
});
