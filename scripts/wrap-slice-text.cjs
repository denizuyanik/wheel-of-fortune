const fs = require("fs");
const path = require("path");

const oldTextCode = `      // Slice Text
      ctx.save();
      const midAngle = startAngle + segmentAngle / 2;
      ctx.rotate(midAngle);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = prize.textColor || "#ffffff";
      const fontSize = Math.max(11, Math.min(24, Math.floor(220 / totalSegments)));
      const fontFam = this.fontFamily || "Poppins";
      ctx.font = "bold " + fontSize + "px '" + fontFam + "', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 4;

      let label = prize.label || "Prize";
      const maxChars = Math.max(8, Math.floor(180 / fontSize));
      if (label.length > maxChars) label = label.substring(0, maxChars - 1) + "…";
      ctx.fillText(label, radius - 35, 0);
      ctx.restore();`;

const newTextCode = `      // Slice Text with Multi-line Wrapping & Inward Placement
      ctx.save();
      const midAngle = startAngle + segmentAngle / 2;
      ctx.rotate(midAngle);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = prize.textColor || "#ffffff";
      const fontSize = Math.max(11, Math.min(21, Math.floor(200 / totalSegments)));
      const fontFam = this.fontFamily || "Poppins";
      ctx.font = "bold " + fontSize + "px '" + fontFam + "', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 4;

      let label = (prize.label || "Prize").trim();
      const words = label.split(" ");
      let lines = [];
      if (words.length === 1) {
        if (label.length > 9) {
          lines = [label.substring(0, 8) + "-", label.substring(8)];
        } else {
          lines = [label];
        }
      } else {
        let currentLine = words[0];
        for (let w = 1; w < words.length; w++) {
          if ((currentLine + " " + words[w]).length <= 10) {
            currentLine += " " + words[w];
          } else {
            lines.push(currentLine);
            currentLine = words[w];
          }
        }
        lines.push(currentLine);
      }

      // Moved inward (4 chars closer to center: radius - 58 instead of radius - 35)
      const textRadius = radius - 58;
      const lineHeight = fontSize * 1.18;
      const startY = -((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, lIdx) => {
        const y = startY + lIdx * lineHeight;
        ctx.fillText(line, textRadius, y);
      });
      ctx.restore();`;

// 1. Update public/wheel-widget.js
const widgetJsPath = path.join(__dirname, "../public/wheel-widget.js");
let widgetJs = fs.readFileSync(widgetJsPath, "utf8");
widgetJs = widgetJs.replace(oldTextCode, newTextCode);
fs.writeFileSync(widgetJsPath, widgetJs);

// 2. Update public/widget-standalone.html
const standalonePath = path.join(__dirname, "../public/widget-standalone.html");
let standaloneHtml = fs.readFileSync(standalonePath, "utf8");
standaloneHtml = standaloneHtml.replace(/<script>[\s\S]*?<\/script>/, `<script>\n${widgetJs}\n</script>`);
fs.writeFileSync(standalonePath, standaloneHtml);

// 3. Update src/extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.tsx
const widgetTsxPath = path.join(__dirname, "../src/extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.tsx");
let widgetTsx = fs.readFileSync(widgetTsxPath, "utf8");
widgetTsx = widgetTsx.replace(oldTextCode, newTextCode);
fs.writeFileSync(widgetTsxPath, widgetTsx);

console.log("SUCCESS: Applied inward position and multi-line wrapping to slice text across all files!");
