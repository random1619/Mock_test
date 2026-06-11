const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\Mocks Wallah\\Topic-Concept Tests';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const stats = {
  total: files.length,
  hasTestObj: 0,
  hasQuestionsArr: 0,
  emptyQuestions: 0,
  titles: {},
  examTitles: {},
  welcomeH1s: {}
};

const details = [];

for (const file of files) {
  const fullPath = path.join(dir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Extract title
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'NO TITLE';
  
  // Extract exam-title class content
  const examTitleMatch = content.match(/class="exam-title"[^>]*>([^<]+)</i);
  const examTitle = examTitleMatch ? examTitleMatch[1].trim() : 'NO EXAM TITLE';
  
  // Extract welcome h1
  const welcomeH1Match = content.match(/<div class="welcome-header">[\s\S]*?<h1>([\s\S]*?)<\/h1>/i);
  let welcomeH1 = 'NO WELCOME H1';
  if (welcomeH1Match) {
    welcomeH1 = welcomeH1Match[1].replace(/<[^>]+>/g, '').trim();
  }
  
  // Check JS variables
  const hasTest = content.includes('const test =');
  const hasQuestions = content.includes('const questions =');
  
  let qCount = 0;
  let sectionName = '';
  
  if (hasTest) {
    stats.hasTestObj++;
    // Try to extract questions count from the test object
    const qCountMatch = content.match(/questions:\s*(\d+)/);
    if (qCountMatch) {
      qCount = parseInt(qCountMatch[1]);
    }
    
    // Try to extract section name
    const secNameMatch = content.match(/"name":\s*"([^"]+)"/);
    if (secNameMatch) {
      sectionName = secNameMatch[1];
    }
  }
  
  if (hasQuestions) {
    stats.hasQuestionsArr++;
    // Let's see if questions array is empty
    if (content.includes('const questions = [];')) {
      stats.emptyQuestions++;
    } else {
      // Find length of questions array or count objects
      // (simplistic count of objects or array length)
      const qArrMatch = content.match(/const questions = \[\s*([\s\S]*?)\s*\];/);
      if (qArrMatch && qArrMatch[1]) {
        // count occurrences of correct_option_id or similar
        const matches = qArrMatch[1].match(/correct_option_id/g);
        qCount = matches ? matches.length : 0;
      }
    }
  }
  
  details.push({
    file,
    title,
    examTitle,
    welcomeH1,
    hasTest,
    hasQuestions,
    qCount,
    sectionName
  });
}

console.log('STATS:', JSON.stringify(stats, null, 2));

// Log the first 20 details
console.log('FIRST 20 DETAILS:');
console.log(JSON.stringify(details.slice(0, 20), null, 2));

// Log some cryptic hash ones
console.log('CRYPTIC HASH DETAILS:');
const cryptic = details.filter(d => /^[0-9a-f]{8}\.html$/i.test(d.file));
console.log(JSON.stringify(cryptic.slice(0, 20), null, 2));
console.log('Total cryptic hash files:', cryptic.length);
