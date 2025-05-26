import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

// Move sidebar HTML to correct location
const sidebarHtmlSrc = path.join(distDir, 'src', 'sidebar', 'index.html');
const sidebarHtmlDest = path.join(distDir, 'sidebar', 'index.html');

if (fs.existsSync(sidebarHtmlSrc)) {
  // Ensure sidebar directory exists
  fs.mkdirSync(path.join(distDir, 'sidebar'), { recursive: true });
  
  // Move the file
  fs.renameSync(sidebarHtmlSrc, sidebarHtmlDest);
  
  console.log('✓ Moved sidebar HTML to correct location');
}

// Move popup HTML to correct location
const popupHtmlSrc = path.join(distDir, 'src', 'popup', 'index.html');
const popupHtmlDest = path.join(distDir, 'popup', 'index.html');

if (fs.existsSync(popupHtmlSrc)) {
  // Ensure popup directory exists
  fs.mkdirSync(path.join(distDir, 'popup'), { recursive: true });
  
  // Read the file content
  let htmlContent = fs.readFileSync(popupHtmlSrc, 'utf-8');
  
  // Fix the paths
  htmlContent = htmlContent.replace(/href="\.\.\/\.\.\//g, 'href="../');
  htmlContent = htmlContent.replace(/src="\.\.\/\.\.\//g, 'src="../');
  
  // Write to destination
  fs.writeFileSync(popupHtmlDest, htmlContent);
  
  console.log('✓ Moved popup HTML to correct location');
}

// Clean up empty src directory
if (fs.existsSync(path.join(distDir, 'src'))) {
  fs.rmSync(path.join(distDir, 'src'), { recursive: true, force: true });
}