const fs = require('fs');
const path = require('path');
const tailwindcss = require('tailwindcss');
const postcss = require('postcss');

const inputPath = path.join(__dirname, 'public/css/tailwind.css');
const outputPath = path.join(__dirname, 'public/css/output.css');

fs.readFile(inputPath, (err, css) => {
  if (err) throw err;
  postcss([tailwindcss('./tailwind.config.js')])
    .process(css, { from: inputPath, to: outputPath })
    .then(result => {
      fs.writeFile(outputPath, result.css, () => true);
      console.log('✅ Tailwind CSS built successfully!');
    });
});
