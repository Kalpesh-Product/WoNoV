const fs = require("fs");
const path = require("path");

function walk(dir, indent = "") {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === "node_modules") continue;
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    console.log(indent + "|-- " + file);
    if (stats.isDirectory()) {
      walk(fullPath, indent + "   ");
    }
  }
}

walk(".");
