const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';
const outputDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\.agents\\explorer_init_2';

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (['node_modules', '.git', 'scratch', 'android', 'www', '.agents'].includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (file.endsWith('.html') && !['index.html', 'index.bak.html', 'index.old.html'].includes(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = walkDir(rootDir);
console.log(`Found ${htmlFiles.length} HTML files.`);

const fileData = [];

for (const filepath of htmlFiles) {
  const content = fs.readFileSync(filepath, 'utf8');
  const relPath = path.relative(rootDir, filepath).replace(/\\/g, '/');
  
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'NO_TITLE';
  
  // Script pattern detections
  const hasCBTExamApp = content.includes('class CBTExamApp');
  const hasTestObj = content.includes('const test =') || content.includes('let test =') || content.includes('var test =') || content.includes('const test=');
  const hasQuestionsArr = content.includes('const questions =') || content.includes('let questions =') || content.includes('const questions=');
  const hasQsArr = content.includes('const qs =') || content.includes('let qs =') || content.includes('const qs=');
  
  // Font imports
  const hasSpaceGrotesk = content.includes('Space Grotesk');
  const hasPlusJakarta = content.includes('Plus Jakarta Sans');
  const hasInter = content.includes('Inter');
  
  // Math libraries
  const hasMathJax = content.includes('mathjax') || content.includes('MathJax.js');
  const hasKaTeX = content.includes('katex.min.js') || content.includes('katex.min.css');
  const hasMathTag = content.includes('<math') || content.includes('xmlns="http://www.w3.org/1998/Math/MathML"');
  
  // Navigator classes
  const hasNavigatorSidebar = content.includes('navigator-sidebar');
  const hasMobileNavigator = content.includes('mobile-navigator');
  const hasNavigatorGrid = content.includes('navigator-grid');
  const hasQBox = content.includes('q-box') || content.includes('class="q-box"') || content.includes("class='q-box'");
  const hasNavQuestion = content.includes('nav-question') || content.includes('class="nav-question"') || content.includes("class='nav-question'");
  
  // Bottom navigation
  const hasNavigationBar = content.includes('navigation-bar');
  const hasFooter = content.includes('footer') || content.includes('footer-bar');
  const hasActionButtons = content.includes('btn-next') || content.includes('btn-prev') || content.includes('nextQuestion') || content.includes('prevQuestion');
  
  // Stylesheet details
  // Check what overrides are present
  const hasUnifiedOverride = content.includes('Unified Premium Dark Mode Overrides');
  const hasOliveboardOverride = content.includes('Oliveboard Professional Style Overrides') || content.includes('Oliveboard Premium Style Overrides');
  const hasModernOverride = content.includes('Modern Premium Style Overrides');
  const hasPunditsMobileFix = content.includes('PUNDITS-MOBILE-FIX-v2');

  fileData.push({
    path: relPath,
    title,
    hasCBTExamApp,
    hasTestObj,
    hasQuestionsArr,
    hasQsArr,
    hasSpaceGrotesk,
    hasPlusJakarta,
    hasInter,
    hasMathJax,
    hasKaTeX,
    hasMathTag,
    hasNavigatorSidebar,
    hasMobileNavigator,
    hasNavigatorGrid,
    hasQBox,
    hasNavQuestion,
    hasNavigationBar,
    hasFooter,
    hasActionButtons,
    hasUnifiedOverride,
    hasOliveboardOverride,
    hasModernOverride,
    hasPunditsMobileFix
  });
}

fs.writeFileSync(path.join(outputDir, 'extracted_features.json'), JSON.stringify(fileData, null, 2), 'utf8');
console.log('Features extracted successfully.');
