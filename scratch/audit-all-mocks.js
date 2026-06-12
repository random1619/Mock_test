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
  
  // 1. Check JS Variables (test, questions or qs array)
  const hasTest = content.includes('const test =') || content.includes('let test =') || content.includes('var test =') || content.includes('const test=') || content.includes('let test=');
  const hasQuestions = content.includes('const questions =') || content.includes('let questions =') || content.includes('var questions =') || content.includes('const questions=') || content.includes('let questions=');
  const hasQs = content.includes('const qs =') || content.includes('let qs =') || content.includes('var qs =') || content.includes('const qs=') || content.includes('let qs=');
  
  if (!hasTest && !hasQuestions && !hasQs) {
    fileIssues.push('Missing mock JSON metadata (test, questions or qs array not found)');
    stats.missingJSVariables++;
  }
  
  // 2. Check Absolute Paths (e.g. file:/// or local Windows drive paths, ignoring CSS/quotes escapes)
  const absMatch = content.match(/(file:\/\/\/|[a-zA-Z]:\\[Uu]sers\\[a-zA-Z0-9_.-]+\\)/i);
  if (absMatch) {
    fileIssues.push('Contains hardcoded absolute local file path references: ' + absMatch[0]);
    stats.absolutePaths++;
  }
  
  // 3. Telegram Link Spam / Ads (ignore code definitions/CSS comment references)
  const cleanText = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
    
  if (cleanText.includes('t.me/') || cleanText.includes('telegram.me/') || cleanText.includes('telegram.dog/')) {
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
  
  // 5. Dark Mode Contrast clashes (excluding border-color properties)
  const contrastMatch = content.match(/(?<!border-)(?<!border-top-)(?<!border-right-)(?<!border-bottom-)(?<!border-left-)\bcolor\s*:\s*(#000|#111|black|#222)/gi);
  if (contrastMatch) {
    fileIssues.push('Potential contrast issue: hardcoded dark/black text styling clashing with dark mode: ' + contrastMatch[0]);
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
