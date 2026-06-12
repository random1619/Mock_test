const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const manifestPath = path.join(rootDir, 'mocks-manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('mocks-manifest.json not found!');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const filesArray = manifest.files;
const metadataMap = {};

console.log(`Processing metadata for ${filesArray.length} files...`);

let formatACount = 0;
let formatBCount = 0;
let formatCCount = 0;
let formatDCount = 0;
let formatECount = 0;
let formatFCount = 0;
let failCount = 0;

filesArray.forEach(fileRelPath => {
  const fullPath = path.join(rootDir, fileRelPath);
  const ext = path.extname(fileRelPath).toLowerCase();
  
  if (ext === '.html') {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      let q = 0;
      let time = 0;
      let marks = 0;
      let matched = false;
      
      // Heuristic 1: Look for "const test =" object (Format A)
      const testObjRegex = /(?:const|let|var)?\s*test\s*=\s*\{/;
      if (testObjRegex.test(content)) {
        const qMatch = content.match(/questions:\s*(\d+)/);
        const tMatch = content.match(/timer:\s*(\d+)/);
        const mMatch = content.match(/marks:\s*(\d+)/);
        
        let tempQ = qMatch ? parseInt(qMatch[1]) : 0;
        let tempTime = tMatch ? parseInt(tMatch[1]) : 0;
        if (tempTime >= 120) {
          tempTime = Math.round(tempTime / 60);
        }
        let tempMarks = mMatch ? parseInt(mMatch[1]) : 0;
        
        if (tempQ > 0 || tempTime > 0) {
          q = tempQ;
          time = tempTime;
          marks = tempMarks;
          formatACount++;
          matched = true;
        }
      }
      
      // Heuristic 2: If we still don't have metadata, try questions/qs/this.qs array formats
      if (!matched) {
        const hasQuestions = /(?:const|let|var)?\s*questions\s*=\s*\[/.test(content);
        const hasQs = /(?:const|let|var)?\s*qs\s*=\s*\[/.test(content);
        const hasThisQs = /this\.qs\s*=/.test(content) || /this\.questions\s*=/.test(content);
        
        if (hasQuestions || hasQs || hasThisQs) {
          // Count questions by looking for common question/correct option properties
          const correctMatches = content.match(/"correct_option_id"|correct_option_id|"correct_answer"|correct_answer/g);
          q = correctMatches ? correctMatches.length : 0;
          
          if (q === 0) {
            const qTags = content.match(/"question"|question:/g);
            q = qTags ? qTags.length : 0;
          }
          
          // Find Duration
          const durationMatch = content.match(/totalDuration\s*=\s*(\d+)/);
          const tlMatch = content.match(/tl\s*=\s*(\d+)\s*\*\s*(\d+)/);
          const tlSecMatch = content.match(/tl\s*=\s*(\d+)/);
          const timeLeftMatch = content.match(/this\.timeLeft\s*=\s*([^;]+);/) || content.match(/timeLeft\s*=\s*([^;]+);/);
          
          if (durationMatch) {
            time = parseInt(durationMatch[1]);
          } else if (tlMatch) {
            time = parseInt(tlMatch[1]);
          } else if (timeLeftMatch) {
            const expr = timeLeftMatch[1].trim();
            try {
              const val = Function(`"use strict"; return (${expr})`)();
              time = Math.round(val / 60);
            } catch(e) {
              const numMatch = expr.match(/\d+/);
              if (numMatch) {
                const numVal = parseInt(numMatch[0]);
                time = numVal >= 120 ? Math.round(numVal / 60) : numVal;
              }
            }
          } else if (tlSecMatch) {
            const val = parseInt(tlSecMatch[1]);
            time = val >= 120 ? Math.round(val / 60) : val;
          } else {
            // Check welcome-duration or timer text in UI
            const welcomeDurationMatch = content.match(/welcomeDuration["']>(\d+)/) || content.match(/id=["']welcomeDuration["'][^>]*>(\d+)/);
            if (welcomeDurationMatch) {
              time = parseInt(welcomeDurationMatch[1]);
            } else {
              const timerDivMatch = content.match(/<div[^>]*class=["']timer["'][^>]*>(\d+):(\d+)<\/div>/) || content.match(/id=["']timer["'][^>]*>(\d+):(\d+)<\/div>/);
              if (timerDivMatch) {
                time = parseInt(timerDivMatch[1]);
              }
            }
          }
          
          // Find Marks
          const marksPerQMatch = content.match(/marksPerQ\s*=\s*([\d.]+)/) || content.match(/posMarks\s*=\s*([\d.]+)/);
          if (marksPerQMatch && q) {
            marks = Math.round(q * parseFloat(marksPerQMatch[1]));
          } else {
            // default standard mark rules if missing
            marks = q * 2;
          }
          
          if (hasQuestions) {
            formatBCount++;
          } else if (hasQs) {
            formatCCount++;
          } else {
            formatDCount++;
          }
          matched = true;
        }
      }
      
      // Heuristic 3: Check for vocab-quiz format (quizData with questions array, options: [ ... ])
      if (!matched) {
        const hasQuizData = /quizData\s*=/.test(content) || /options\s*:\s*\[/.test(content);
        if (hasQuizData) {
          // Count questions by counting options: [ or correctIndex:
          const optMatches = content.match(/options\s*:\s*\[/g);
          q = optMatches ? optMatches.length : 0;
          
          if (q === 0) {
            const correctIdxMatches = content.match(/correctIndex\s*:\s*/g);
            q = correctIdxMatches ? correctIdxMatches.length : 0;
          }
          
          // Find Duration
          const totalTimeMatch = content.match(/totalTime\s*:\s*(\d+)/) || content.match(/totalTime\s*=\s*(\d+)/);
          if (totalTimeMatch) {
            const val = parseInt(totalTimeMatch[1]);
            time = val >= 120 ? Math.round(val / 60) : val;
          } else {
            time = 15; // default for vocab quizzes
          }
          
          // Find Marks
          const negMarkMatch = content.match(/negativeMark\s*:\s*([\d.]+)/) || content.match(/negativeMark\s*=\s*([\d.]+)/);
          let marksPerQ = 2.0; // default
          if (negMarkMatch) {
            const neg = parseFloat(negMarkMatch[1]);
            if (neg === 0.25) marksPerQ = 1.0; 
          }
          marks = q * marksPerQ;
          formatFCount++;
          matched = true;
        }
      }
      
      // Heuristic 4: Check for generic JSON options (Format E)
      if (!matched) {
        const optCount = (content.match(/"options"\s*:\s*\[/g) || []).length;
        if (optCount > 0) {
          q = optCount;
          time = 60; 
          marks = q * 2;
          formatECount++;
          matched = true;
        }
      }
      
      if (matched && q > 0) {
        metadataMap[fileRelPath] = { q, time, marks };
      } else {
        failCount++;
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn(`Could not parse ${fileRelPath}:`, err.message);
      }
    }
  }
});

console.log(`Parsing summary:`);
console.log(`- Format A (test object): ${formatACount}`);
console.log(`- Format B (questions array): ${formatBCount}`);
console.log(`- Format C (qs array): ${formatCCount}`);
console.log(`- Format D (class-based/this.qs): ${formatDCount}`);
console.log(`- Format E (generic JSON): ${formatECount}`);
console.log(`- Format F (vocab quizData): ${formatFCount}`);
console.log(`- Unknown Formats: ${failCount}`);
console.log(`Total metadata extracted: ${Object.keys(metadataMap).length}`);

// Write mocks-manifest.json
manifest.metadata = metadataMap;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('mocks-manifest.json updated!');

// Write mocks-manifest.js
const manifestJsContent = `window.MOCKS_MANIFEST = ${JSON.stringify(manifest, null, 2)};`;
fs.writeFileSync(path.join(rootDir, 'mocks-manifest.js'), manifestJsContent, 'utf8');
console.log('mocks-manifest.js updated!');
