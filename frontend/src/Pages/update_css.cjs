const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'Settings.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Backgrounds
css = css.replace(/background:\s*radial-gradient[^;]+;/g, 'background: transparent; /* SPACE THEME */');
css = css.replace(/background:\s*#ffffff;/gi, 'background: rgba(15, 23, 42, 0.4);');
css = css.replace(/background:\s*white;/gi, 'background: rgba(15, 23, 42, 0.4);');
css = css.replace(/background-color:\s*#ffffff;/gi, 'background-color: rgba(15, 23, 42, 0.4);');
css = css.replace(/background-color:\s*white;/gi, 'background-color: rgba(15, 23, 42, 0.4);');
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\);/g, 'background: rgba(15, 23, 42, 0.6);');
css = css.replace(/background-color:\s*#f9fafb;/gi, 'background-color: rgba(255, 255, 255, 0.05);');
css = css.replace(/background-color:\s*#f3f4f6;/gi, 'background-color: rgba(255, 255, 255, 0.05);');
css = css.replace(/background-color:\s*#e5e7eb;/gi, 'background-color: rgba(255, 255, 255, 0.1);');

// Shadows & borders
css = css.replace(/box-shadow:\s*[^;]+;/g, 'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);');
css = css.replace(/border:\s*1px\s+solid\s+#[a-zA-Z0-9]+;/g, 'border: 1px solid rgba(255, 255, 255, 0.1);');
css = css.replace(/border-color:\s*#[a-zA-Z0-9]+;/g, 'border-color: rgba(255, 255, 255, 0.2);');
css = css.replace(/border-bottom:\s*[\dpx]+\s+solid\s+#[a-zA-Z0-9]+;/g, 'border-bottom: 1px solid rgba(255, 255, 255, 0.1);');
css = css.replace(/border:\s*1px\s+solid\s+rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\);/g, 'border: 1px solid rgba(255, 255, 255, 0.1);');
css = css.replace(/border:\s*1px\s+solid\s+rgba\([^;]+\);/g, 'border: 1px solid rgba(255, 255, 255, 0.1);');

// Text colors
css = css.replace(/color:\s*#1c253c;/gi, 'color: #f8fafc;');
css = css.replace(/color:\s*#1c2566;/gi, 'color: #f8fafc;');
css = css.replace(/color:\s*#0c1329;/gi, 'color: #f8fafc;');
css = css.replace(/color:\s*#111827;/gi, 'color: #f8fafc;');
css = css.replace(/color:\s*#312e81;/gi, 'color: #f8fafc;');
css = css.replace(/color:\s*#1e1b4b;/gi, 'color: #f8fafc;');
css = css.replace(/color:\s*#1f2937;/gi, 'color: #f8fafc;');
css = css.replace(/color:\s*#212f4f;/gi, 'color: #f8fafc;');
css = css.replace(/color:\s*#374151;/gi, 'color: #cbd5e1;');
css = css.replace(/color:\s*#4b5563;/gi, 'color: #cbd5e1;');
css = css.replace(/color:\s*#4f566d;/gi, 'color: #cbd5e1;');
css = css.replace(/color:\s*#5f6b91;/gi, 'color: #94a3b8;');
css = css.replace(/color:\s*#6b7280;/gi, 'color: #94a3b8;');
css = css.replace(/color:\s*#9ca3af;/gi, 'color: #64748b;');

fs.writeFileSync(cssPath, css);
console.log('Successfully updated Team.css to dark theme variables');
