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

// Move auth HTML to correct location
const authHtmlSrc = path.join(distDir, 'src', 'auth', 'index.html');
const authHtmlDest = path.join(distDir, 'auth', 'index.html');

if (fs.existsSync(authHtmlSrc)) {
  // Ensure auth directory exists
  fs.mkdirSync(path.join(distDir, 'auth'), { recursive: true });
  
  // Read the file content
  let htmlContent = fs.readFileSync(authHtmlSrc, 'utf-8');
  
  // Fix the paths - auth page uses absolute paths from extension root
  htmlContent = htmlContent.replace(/href="\.\.\/auth\//g, 'href="./');
  htmlContent = htmlContent.replace(/src="\.\.\/auth\//g, 'src="./');
  htmlContent = htmlContent.replace(/href="\.\.\/client\//g, 'href="/client/');
  htmlContent = htmlContent.replace(/src="\.\.\/client\//g, 'src="/client/');
  htmlContent = htmlContent.replace(/href="\.\.\/sidebar\//g, 'href="/sidebar/');
  htmlContent = htmlContent.replace(/src="\.\.\/sidebar\//g, 'src="/sidebar/');
  
  // Write to destination
  fs.writeFileSync(authHtmlDest, htmlContent);
  
  console.log('✓ Moved auth HTML to correct location');
}

// Clean up empty src directory
if (fs.existsSync(path.join(distDir, 'src'))) {
  fs.rmSync(path.join(distDir, 'src'), { recursive: true, force: true });
}