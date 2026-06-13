const fs = require('fs');
const path = require('path');

const jsonPath = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\.agents\\explorer_init_2\\extracted_features.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`Loaded metadata for ${data.length} files.`);

// Let's inspect unique paths and patterns to establish heuristics for the 4 styles:
// CBTExam, Daily Quiz, Mocks Wallah, Topic-Concept Tests

const stylesCount = {
  CBTExam: 0,
  DailyQuiz: 0,
  MocksWallah: 0,
  TopicConceptTests: 0,
  Unclassified: 0
};

const styleAssignments = [];

for (const item of data) {
  const p = item.path.toLowerCase();
  const n = path.basename(item.path).toLowerCase();
  
  let style = 'Unclassified';
  
  // Heuristic rules for classification:
  // 1. Topic-Concept Tests:
  //    - Any file located in a directory named "Topic-Concept Tests" or "Sectional Tests/Maths & Reasoning" where names are like Concept Test
  //    - Any filename containing "concept test"
  if (p.includes('topic-concept tests') || n.includes('concept test') || p.includes('sectional tests/maths & reasoning')) {
    style = 'Topic-Concept Tests';
    stylesCount.TopicConceptTests++;
  }
  // 2. Daily Quiz:
  //    - Any file in "daily quizzes" folder or with filename starting/containing "daily quiz"
  else if (p.includes('daily quiz') || n.includes('daily quiz')) {
    style = 'Daily Quiz';
    stylesCount.DailyQuiz++;
  }
  // 3. Mocks Wallah:
  //    - Files specifically in the "Mocks Wallah" folder (excluding those classified as Topic-Concept Tests)
  //    - Or having "mocks wallah" or "mocks-wallah" in the name
  else if (p.startsWith('mocks wallah/') || n.includes('mocks wallah')) {
    style = 'Mocks Wallah';
    stylesCount.MocksWallah++;
  }
  // 4. CBTExam:
  //    - The rest of the mock files: Aman Sir, English Madhyam (General Mocks/CGL Mocks), oliveboard, RBE, The Solvers, Other Brands, Pundits.
  //    - These files use standard CBT (Computer Based Test) exam interface engines (e.g., CBTExamApp or similar full length mock engines).
  else {
    style = 'CBTExam';
    stylesCount.CBTExam++;
  }
  
  styleAssignments.push({
    path: item.path,
    title: item.title,
    style: style
  });
}

console.log('\n--- CLASSIFICATION COUNTS ---');
console.log(stylesCount);

// Let's analyze features of each style
const styleFeatures = {};
for (const style of ['CBTExam', 'Daily Quiz', 'Mocks Wallah', 'Topic-Concept Tests']) {
  styleFeatures[style] = {
    total: 0,
    hasCBTExamApp: 0,
    hasTestObj: 0,
    hasQuestionsArr: 0,
    hasQsArr: 0,
    hasSpaceGrotesk: 0,
    hasPlusJakarta: 0,
    hasInter: 0,
    hasMathJax: 0,
    hasKaTeX: 0,
    hasMathTag: 0,
    hasNavigatorSidebar: 0,
    hasMobileNavigator: 0,
    hasNavigatorGrid: 0,
    hasQBox: 0,
    hasNavQuestion: 0,
    hasNavigationBar: 0,
    hasFooter: 0,
    hasActionButtons: 0
  };
}

for (let i = 0; i < data.length; i++) {
  const item = data[i];
  const sa = styleAssignments[i];
  if (sa.style === 'Unclassified') continue;
  
  const sf = styleFeatures[sa.style];
  sf.total++;
  if (item.hasCBTExamApp) sf.hasCBTExamApp++;
  if (item.hasTestObj) sf.hasTestObj++;
  if (item.hasQuestionsArr) sf.hasQuestionsArr++;
  if (item.hasQsArr) sf.hasQsArr++;
  if (item.hasSpaceGrotesk) sf.hasSpaceGrotesk++;
  if (item.hasPlusJakarta) sf.hasPlusJakarta++;
  if (item.hasInter) sf.hasInter++;
  if (item.hasMathJax) sf.hasMathJax++;
  if (item.hasKaTeX) sf.hasKaTeX++;
  if (item.hasMathTag) sf.hasMathTag++;
  if (item.hasNavigatorSidebar) sf.hasNavigatorSidebar++;
  if (item.hasMobileNavigator) sf.hasMobileNavigator++;
  if (item.hasNavigatorGrid) sf.hasNavigatorGrid++;
  if (item.hasQBox) sf.hasQBox++;
  if (item.hasNavQuestion) sf.hasNavQuestion++;
  if (item.hasNavigationBar) sf.hasNavigationBar++;
  if (item.hasFooter) sf.hasFooter++;
  if (item.hasActionButtons) sf.hasActionButtons++;
}

console.log('\n--- STYLE FEATURES ---');
console.log(JSON.stringify(styleFeatures, null, 2));

// Let's write the classification summary to a text file for report generation
const outputReport = {
  stylesCount,
  styleFeatures,
  samples: {}
};

for (const style of ['CBTExam', 'Daily Quiz', 'Mocks Wallah', 'Topic-Concept Tests']) {
  outputReport.samples[style] = styleAssignments
    .filter(sa => sa.style === style)
    .slice(0, 10)
    .map(sa => sa.path);
}

fs.writeFileSync('C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\.agents\\explorer_init_2\\classification_summary.json', JSON.stringify(outputReport, null, 2), 'utf8');
console.log('Summary written to classification_summary.json');
