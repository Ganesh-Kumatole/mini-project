const fs = require('fs');
try {
  fs.copyFileSync('/mnt/c/Users/ganes/.gemini/antigravity/brain/4a4fbde1-fcc6-4f3b-8586-515a69afe0ff/dashboard_preview_1775065343062.png', './public/dashboard-preview.png');
  console.log('Image copied successfully!');
} catch (e) {
  console.error('Copy failed:', e);
}
