const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'scratch') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (file.endsWith('.html') && file !== 'index.html' && file !== 'index.bak.html' && file !== 'index.old.html') {
      results.push(fullPath);
    }
  }
  return results;
}

const rootDir = path.join(__dirname, '..');
console.log('Scanning directories under:', rootDir);
const files = walkDir(rootDir);
console.log(`Found ${files.length} mock HTML files to audit.`);

const stats = {
  total: files.length,
  missingJSVariables: 0,
  absolutePaths: 0,
  telegramSpam: 0,
  hasMathsNoKaTeX: 0,
  potentialDarkModeContrastIssues: 0
};

const issuesList = [];

files.forEach(filepath => {
  const content = fs.readFileSync(filepath, 'utf8');
  const filename = path.basename(filepath);
  const relativePath = path.relative(rootDir, filepath).replace(/\\/g, '/');
  
  const fileIssues = [];
  
  // 1. Check JS Variables
  const hasTest = content.includes('const test =') || content.includes('let test =') || content.includes('var test =');
  const hasQuestions = content.includes('const questions =') || content.includes('let questions =') || content.includes('var questions =');
  if (!hasTest && !hasQuestions) {
    fileIssues.push('Missing mock JSON metadata (test or questions array not found)');
    stats.missingJSVariables++;
  }
  
  // 2. Check Absolute Paths (e.g. file:/// or local Windows drive paths)
  if (content.match(/(file:\/\/\/|[a-zA-Z]:\\)/i)) {
    fileIssues.push('Contains hardcoded absolute local file path references');
    stats.absolutePaths++;
  }
  
  // 3. Telegram Link Spam / Ads
  if (content.includes('t.me/') || content.includes('telegram.me/') || content.includes('devgagan')) {
    fileIssues.push('Contains external promotional ads or Telegram links');
    stats.telegramSpam++;
  }
  
  // 4. Maths formulas without KaTeX
  const hasMathText = content.match(/(\\\(|\\\[|\$\$|\$.*?\$|\\text\{|\\frac\{|\\sqrt\{)/);
  const hasKaTeXScript = content.includes('katex.min.js') || content.includes('MathJax.js') || content.includes('mathjax');
  if (hasMathText && !hasKaTeXScript) {
    fileIssues.push('Contains math symbols/formulas but KaTeX/MathJax library is missing');
    stats.hasMathsNoKaTeX++;
  }
  
  // 5. Dark Mode Contrastclashes (hardcoded style="color: #000" or similar)
  if (content.match(/style\s*=\s*"[^"]*color\s*:\s*(#000|#111|black|#222)/i)) {
    fileIssues.push('Potential contrast issue: hardcoded dark/black text styling clashing with dark mode');
    stats.potentialDarkModeContrastIssues++;
  }
  
  if (fileIssues.length > 0) {
    issuesList.push({
      file: filename,
      path: relativePath,
      issues: fileIssues
    });
  }
});

console.log('\n=========================================');
console.log('          MOCK FILES AUDIT RESULTS        ');
console.log('=========================================');
console.log(`Total Mocks Audited: ${stats.total}`);
console.log(`Mocks with Missing JS vars: ${stats.missingJSVariables}`);
console.log(`Mocks with Absolute local paths: ${stats.absolutePaths}`);
console.log(`Mocks with Telegram Spam/Ads: ${stats.telegramSpam}`);
console.log(`Mocks with Math formulas but no KaTeX: ${stats.hasMathsNoKaTeX}`);
console.log(`Mocks with Dark Mode contrast issues: ${stats.potentialDarkModeContrastIssues}`);
console.log('=========================================\n');

// Write audit report
const reportPath = path.join(__dirname, 'audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify({ stats, issues: issuesList }, null, 2), 'utf8');
console.log(`Audit report written to ${reportPath}`);
