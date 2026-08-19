const fs = require("fs");
const path = require("path");

const widgetTsxPath = path.join(__dirname, "../src/extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.tsx");
let code = fs.readFileSync(widgetTsxPath, "utf8");

// 1. PrizeSegment interface textColor
code = code.replace(
  "  color: string;\n  probability: number;",
  "  color: string;\n  textColor?: string;\n  probability: number;"
);

// 2. private fontFamily property
code = code.replace(
  '  private theme = "gold";',
  '  private theme = "gold";\n  private fontFamily = "Poppins";'
);

// 3. observedAttributes
code = code.replace(
  '      "color-theme",\n      "daily-limit",',
  '      "color-theme",\n      "font-family",\n      "daily-limit",'
);

// 4. readProps
code = code.replace(
  '    this.theme = this.getAttribute("color-theme") || "gold";\n    this.dailyLimit = Number(this.getAttribute("daily-limit")) || 1;',
  '    this.theme = this.getAttribute("color-theme") || "gold";\n    this.fontFamily = this.getAttribute("font-family") || "Poppins";\n    this.dailyLimit = Number(this.getAttribute("daily-limit")) || 1;'
);

// 5. shadow HTML link
code = code.replace(
  "    this.shadow.innerHTML = `\n      <style>",
  '    this.shadow.innerHTML = `\n      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Comic+Neue:wght@700&family=Inter:wght@400;700;900&family=Montserrat:wght@700;900&family=Orbitron:wght@700;900&family=Outfit:wght@600;800&family=Playfair+Display:wght@700;900&family=Poppins:wght@400;600;700;900&family=Roboto:wght@500;700;900&display=swap">\n      <style>'
);

// 6. host font-family
code = code.replace(
  'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;',
  'font-family: "${this.fontFamily || "Poppins"}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;'
);

// 7. drawWheel slice text
const oldText = `      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 4;

      let label = prize.label || "Prize";
      if (label.length > 15) label = label.substring(0, 14) + "…";
      ctx.fillText(label, radius - 35, 0);`;

const newText = `      ctx.fillStyle = prize.textColor || "#ffffff";
      const fontSize = Math.max(11, Math.min(24, Math.floor(220 / totalSegments)));
      const fontFam = this.fontFamily || "Poppins";
      ctx.font = "bold " + fontSize + "px \x27" + fontFam + "\x27, -apple-system, BlinkMacSystemFont, \x27Segoe UI\x27, Roboto, sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 4;

      let label = prize.label || "Prize";
      const maxChars = Math.max(8, Math.floor(180 / fontSize));
      if (label.length > maxChars) label = label.substring(0, maxChars - 1) + "…";
      ctx.fillText(label, radius - 35, 0);`;

code = code.replace(oldText, newText);

fs.writeFileSync(widgetTsxPath, code);
console.log("SUCCESS: Updated wheel-of-fortune-widget.tsx!");
