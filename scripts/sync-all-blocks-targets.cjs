const fs = require("fs");
const path = require("path");

const widgetJsPath = path.join(__dirname, "../public/wheel-widget.js");
const widgetJsCode = fs.readFileSync(widgetJsPath, "utf8");

// Target locations for Wix Blocks and Velo Custom Elements
const targets = [
  path.join(__dirname, "../wix-default-custom-element.js"),
  path.join(__dirname, "../src/public/wix-default-custom-element.js"),
  path.join(__dirname, "../src/public/custom-elements/wix-default-custom-element.js"),
  path.join(__dirname, "../src/public/wheel-widget.js"),
];

targets.forEach((target) => {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(target, widgetJsCode);
  console.log("Created:", target);
});

console.log("ALL Wix Blocks custom element files synced with latest engine!");
