const fs = require("fs");
const path = require("path");

const widgetPath = path.join(__dirname, "../public/wheel-widget.js");
let code = fs.readFileSync(widgetPath, "utf8");

// 1. observedAttributes
code = code.replace(
  'return ["lang", "color-theme", "daily-limit",',
  'return ["lang", "color-theme", "font-family", "daily-limit",'
);

// 2. readProps
code = code.replace(
  'this.dailyLimit = Number(this.getAttribute("daily-limit")) || 1;',
  'this.dailyLimit = Number(this.getAttribute("daily-limit")) || 1;\n    this.fontFamily = this.getAttribute("font-family") || "Poppins";'
);

// 3. render style font
code = code.replace(
  'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;',
  'font-family: var(--wof-font, "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);'
);

// 4. font link in shadow dom
code = code.replace(
  'this.shadow.innerHTML = `\n      <style>',
  'this.shadow.innerHTML = `\n      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Comic+Neue:wght@700&family=Inter:wght@400;700;900&family=Montserrat:wght@700;900&family=Orbitron:wght@700;900&family=Outfit:wght@600;800&family=Playfair+Display:wght@700;900&family=Poppins:wght@400;600;700;900&family=Roboto:wght@500;700;900&display=swap">\n      <style>'
);

// 5. drawWheel text sizing & color
const oldDrawText = `      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 4;

      let label = prize.label || "Prize";
      if (label.length > 15) label = label.substring(0, 14) + "…";
      ctx.fillText(label, radius - 35, 0);`;

const newDrawText = `      ctx.fillStyle = prize.textColor || "#ffffff";
      const fontSize = Math.max(11, Math.min(24, Math.floor(220 / totalSegments)));
      const fontFam = this.fontFamily || "Poppins";
      ctx.font = "bold " + fontSize + "px \x27" + fontFam + "\x27, -apple-system, BlinkMacSystemFont, \x27Segoe UI\x27, Roboto, sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 4;

      let label = prize.label || "Prize";
      const maxChars = Math.max(8, Math.floor(180 / fontSize));
      if (label.length > maxChars) label = label.substring(0, maxChars - 1) + "…";
      ctx.fillText(label, radius - 35, 0);`;

code = code.replace(oldDrawText, newDrawText);

fs.writeFileSync(widgetPath, code);

// Also update standalone HTML
const standalonePath = path.join(__dirname, "../public/widget-standalone.html");
let standaloneHtml = fs.readFileSync(standalonePath, "utf8");
// replace script in standalone
const matchScript = code;
standaloneHtml = standaloneHtml.replace(/<script>[\s\S]*?<\/script>/, `<script>\n${code}\n</script>`);
fs.writeFileSync(standalonePath, standaloneHtml);

console.log("SUCCESS: Updated public/wheel-widget.js & public/widget-standalone.html!");
