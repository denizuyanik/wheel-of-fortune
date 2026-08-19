const fs = require("fs");
const path = require("path");

const dashboardPath = path.join(__dirname, "../public/dashboard.html");
const sandboxPath = path.join(__dirname, "../public/test-sandbox.html");

const cleanHtml = fs.readFileSync(dashboardPath, "utf8");
fs.writeFileSync(sandboxPath, cleanHtml);

console.log("SUCCESS: Synced test-sandbox.html with pure executive dashboard (no LOCAL STUDIO)!");
