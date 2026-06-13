const fs = require('fs');
const path = require('path');

// Target Directories Classification
const BASE_DIR = __dirname;

function scanFiles(dir, fileList = { CBTExam: [], DailyQuiz: [], MocksWallah: [], TopicConcept: [] }) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (
        file !== 'node_modules' && 
        file !== '.git' && 
        file !== '.agents' && 
        file !== 'www' && 
        file !== 'android' && 
        file !== 'scratch'
      ) {
        scanFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html') && file !== 'index.html' && file !== 'index.bak.html') {
      const normalizedPath = filePath.replace(/\\/g, '/');
      if (normalizedPath.includes('/Topic-Concept Tests/')) {
        fileList.TopicConcept.push(filePath);
      } else if (normalizedPath.includes('/Daily Quizzes & Editorial Tests/')) {
        fileList.DailyQuiz.push(filePath);
      } else if (normalizedPath.includes('/Mocks Wallah/')) {
        fileList.MocksWallah.push(filePath);
      } else {
        const isCBT = ['Aman Sir', 'oliveboard', 'Other Brands', 'Pundits', 'RBE', 'Testbook', 'The Solvers', 'English Madhyam'].some(brand => normalizedPath.includes(`/${brand}/`));
        if (isCBT) {
          fileList.CBTExam.push(filePath);
        }
      }
    }
  }
  return fileList;
}

// Global files collection
console.log('Scanning workspace for mock exam HTML files...');
const filesByStyle = scanFiles(BASE_DIR);
console.log(`Scan completed. Found:
- CBTExam: ${filesByStyle.CBTExam.length} files
- Daily Quiz: ${filesByStyle.DailyQuiz.length} files
- Mocks Wallah: ${filesByStyle.MocksWallah.length} files
- Topic-Concept Tests: ${filesByStyle.TopicConcept.length} files
`);

// Load all file contents into memory to speed up checks
const cachedContents = {};
function getFileContent(filePath) {
  if (!cachedContents[filePath]) {
    cachedContents[filePath] = fs.readFileSync(filePath, 'utf8');
  }
  return cachedContents[filePath];
}

// Definition of 60 test cases
const testCases = [
  // ==================== TIER 1: Core Functionality (25 Cases) ====================
  // --- Requirement 1: Theme Toggle ---
  {
    id: "T1.1.1",
    name: "Theme Toggle Element Existence (#themeToggle)",
    tier: 1,
    requirement: "R1",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      return content.includes('id="themeToggle"') || content.includes("id='themeToggle'") || content.includes('id=themeToggle');
    }
  },
  {
    id: "T1.1.2",
    name: "Body class 'light-theme' Toggle Logic",
    tier: 1,
    requirement: "R1",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      return /\.toggle\(\s*['"]light-theme['"]\s*\)/.test(content) || 
             /classList\.toggle\(\s*['"]light-theme['"]\s*\)/.test(content);
    }
  },
  {
    id: "T1.1.3",
    name: "Theme State Write to localStorage ('portal-theme')",
    tier: 1,
    requirement: "R1",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      return /localStorage\.setItem\(\s*['"]portal-theme['"]\s*,/.test(content);
    }
  },
  {
    id: "T1.1.4",
    name: "Theme State Read and Init from localStorage",
    tier: 1,
    requirement: "R1",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      return /localStorage\.getItem\(\s*['"]portal-theme['"]\s*\)/.test(content) && 
             /classList\.add\(\s*['"]light-theme['"]\s*\)/.test(content);
    }
  },
  {
    id: "T1.1.5",
    name: "Theme Toggle Icon Class Update (fa-sun/fa-moon)",
    tier: 1,
    requirement: "R1",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      return (/fa-sun/.test(content) || /fa-moon/.test(content)) && 
             (/classList\.(add|remove|replace|toggle|contains)/.test(content) || /className\s*=/.test(content));
    }
  },

  // --- Requirement 2: Option Labels & Formulas ---
  {
    id: "T1.2.1",
    name: "Option Elements Presence and Class Styling",
    tier: 1,
    requirement: "R2",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      if (style === 'CBTExam' || style === 'DailyQuiz') {
        return content.includes('class="option"') || content.includes("class='option'") || content.includes('.option');
      }
      if (style === 'MocksWallah') {
        return content.includes('class="option-label"') || content.includes("class='option-label'") || content.includes('.option-label');
      }
      if (style === 'TopicConcept') {
        return content.includes('class="opt"') || content.includes("class='opt'") || content.includes('.opt');
      }
      return false;
    }
  },
  {
    id: "T1.2.2",
    name: "MathML/MathJax Mathematical Formula Rendering Structure",
    tier: 1,
    requirement: "R2",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /mjx-container|math|\.mathjax|\.katex|<math/.test(content);
    }
  },
  {
    id: "T1.2.3",
    name: "High-Contrast Dark Mode Option Text Styles",
    tier: 1,
    requirement: "R2",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /--text:\s*#f3f4f6|--text:\s*#e5e7eb|color:\s*#e5e7eb|color:\s*#f3f4f6/.test(content) ||
             /option[\s\S]*?color:\s*[^;]*?(#f3f4f6|#e5e7eb|#ffffff|white)/i.test(content);
    }
  },
  {
    id: "T1.2.4",
    name: "Light Mode Contrast Variable Toggling",
    tier: 1,
    requirement: "R2",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.light-theme/.test(content) && 
             (/color:\s*#2d3436|--text:\s*#2d3436|color:\s*#212529|color:\s*black/.test(content));
    }
  },
  {
    id: "T1.2.5",
    name: "Monochrome Math Image Inversion Filter in Dark Mode",
    tier: 1,
    requirement: "R2",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /filter:\s*[^;]*?invert/.test(content);
    }
  },

  // --- Requirement 3: Question Navigator ---
  {
    id: "T1.3.1",
    name: "Navigator Block Items Generation Loop",
    tier: 1,
    requirement: "R3",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.nav-question|\.q-box|\.q-num/.test(content) && /for\s*\(/.test(content);
    }
  },
  {
    id: "T1.3.2",
    name: "Active/Current Question Navigator Highlight Class",
    tier: 1,
    requirement: "R3",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.current|\.active/.test(content) && /classList\.add\(\s*['"](current|active)['"]\s*\)/.test(content);
    }
  },
  {
    id: "T1.3.3",
    name: "Answered Navigator State and CSS background-color",
    tier: 1,
    requirement: "R3",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /classList\.add\(\s*['"](answered|correct|cor)['"]\s*\)/.test(content) && 
             (/\.(answered|correct|cor)[\s\S]*?background/.test(content) || /--success/.test(content));
    }
  },
  {
    id: "T1.3.4",
    name: "Review/Flagged Navigator State Styling",
    tier: 1,
    requirement: "R3",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /classList\.add\(\s*['"](review|marked|marked-for-review)['"]\s*\)/.test(content) &&
             (/\.(review|marked)[\s\S]*?background/.test(content) || /--warning|--warn/.test(content));
    }
  },
  {
    id: "T1.3.5",
    name: "Navigator Block Click Event Navigation Handlers",
    tier: 1,
    requirement: "R3",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /showQuestion|loadQuestion|goToQuestion|selectQuestion/.test(content);
    }
  },

  // --- Requirement 4: Bottom Navigation & Layouts ---
  {
    id: "T1.4.1",
    name: "Prev/Next Bottom Navigation Buttons Visibility",
    tier: 1,
    requirement: "R4",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.btn-prev|\.btn-next|\.nb\.prv|\.nb\.nxt/.test(content) || 
             /class=["']btn-prev["']/.test(content) || /class=["']nb prv["']/.test(content);
    }
  },
  {
    id: "T1.4.2",
    name: "Navigation Step Action Logic on Click",
    tier: 1,
    requirement: "R4",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /nextQuestion|prevQuestion|showQuestion\(.*?\+.*?1\)/.test(content) ||
             /currentIndex\+\+|currentIndex\-\-/.test(content) ||
             /currentQuestion\+\+|currentQuestion\-\-/.test(content) ||
             /activeQuestion\+\+|activeQuestion\-\-/.test(content);
    }
  },
  {
    id: "T1.4.3",
    name: "Navigator Sidebar Desktop fixed/sticky position styling",
    tier: 1,
    requirement: "R4",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah"],
    check: (content, style) => {
      return /\.navigator-sidebar|\.sidebar|\.nav-panel|#question-boxes/.test(content) &&
             /position:\s*(fixed|sticky|absolute)/.test(content);
    }
  },
  {
    id: "T1.4.4",
    name: "Horizontal Bottom Navigation Bar centering without overlapping",
    tier: 1,
    requirement: "R4",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.navigation-bar|\.footer-bar|\.action-bar|\.nav/.test(content) &&
             /justify-content:\s*space-between|margin:\s*0\s+auto|left:\s*0;\s*right:\s*0/i.test(content);
    }
  },
  {
    id: "T1.4.5",
    name: "Disabling Previous Button on Question Index 0",
    tier: 1,
    requirement: "R4",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /disabled\s*=\s*(currentIndex\s*===\s*0|currentQuestion\s*===\s*0|activeQuestion\s*===\s*0)/.test(content) ||
             /classList\.add\(\s*['"]disabled['"]\s*\)/.test(content) ||
             /\.disabled\s*=/.test(content);
    }
  },

  // --- Requirement 5: Results Modal ---
  {
    id: "T1.5.1",
    name: "Results Modal Element markup existence",
    tier: 1,
    requirement: "R5",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.modal|\.result-modal|#resultModal|#modal/.test(content);
    }
  },
  {
    id: "T1.5.2",
    name: "Results Modal initial visibility state hidden",
    tier: 1,
    requirement: "R5",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.modal\s*\{[\s\S]*?display:\s*none|\.result-modal\s*\{[\s\S]*?display:\s*none|#modal\s*\{[\s\S]*?display:\s*none|#resultModal\s*\{[\s\S]*?display:\s*none|\.modal\s*\{[\s\S]*?visibility:\s*hidden|\.result-modal\s*\{[\s\S]*?visibility:\s*hidden|visibility:\s*hidden/.test(content);
    }
  },
  {
    id: "T1.5.3",
    name: "Results Modal Opening Trigger on Test Submit",
    tier: 1,
    requirement: "R5",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /classList\.add\(\s*['"](show|active|open)['"]\s*\)/.test(content) || 
             /\.style\.display\s*=\s*['"](block|flex)['"]/.test(content);
    }
  },
  {
    id: "T1.5.4",
    name: "Modal score and correct/incorrect stats text elements mapping",
    tier: 1,
    requirement: "R5",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /solved|correct|incorrect|marks|score/.test(content);
    }
  },
  {
    id: "T1.5.5",
    name: "Results Modal Closing Button and Action triggers",
    tier: 1,
    requirement: "R5",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /classList\.remove\(\s*['"](show|active|open)['"]\s*\)/.test(content) ||
             /\.style\.display\s*=\s*['"]none['"]/.test(content) ||
             /closeModal|hideModal/.test(content);
    }
  },

  // ==================== TIER 2: Boundary & Edge Cases (25 Cases) ====================
  // --- Requirement 1: Theme Toggle ---
  {
    id: "T2.1.1",
    name: "Theme Defaults to Dark on LocalStorage Corruption/Invalid Value",
    tier: 2,
    requirement: "R1",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      return /savedTheme\s*===\s*['"]light['"]/.test(content) || 
             /getItem\(['"]portal-theme['"]\)\s*===\s*['"]light['"]/.test(content);
    }
  },
  {
    id: "T2.1.2",
    name: "Theme Toggle Event Listener stability on successive triggers",
    tier: 2,
    requirement: "R1",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      return /addEventListener\(\s*['"]click['"]/.test(content) || /\.onclick\s*=/.test(content);
    }
  },
  {
    id: "T2.1.3",
    name: "Theme Handler Try-Catch Blocks for Blocked LocalStorage API",
    tier: 2,
    requirement: "R1",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      return /try\s*\{[\s\S]*?localStorage[\s\S]*?\}\s*catch/.test(content);
    }
  },
  {
    id: "T2.1.4",
    name: "Theme Selection Persistence and retrieval on Reload",
    tier: 2,
    requirement: "R1",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      const hasRead = /localStorage\.getItem\(\s*['"]portal-theme['"]\s*\)/.test(content);
      const hasWrite = /localStorage\.setItem\(\s*['"]portal-theme['"]\s*,/.test(content);
      return hasRead && hasWrite;
    }
  },
  {
    id: "T2.1.5",
    name: "Light Theme class applied in Head tag (Anti-FOUC timing)",
    tier: 2,
    requirement: "R1",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      const headMatch = content.match(/<head>([\s\S]*?)<\/head>/i);
      if (!headMatch) return false;
      return /localStorage\.getItem\(\s*['"]portal-theme['"]\s*\)/.test(headMatch[1]);
    }
  },

  // --- Requirement 2: Option Labels & Formulas ---
  {
    id: "T2.2.1",
    name: "Option label wrap rules (not using white-space: nowrap)",
    tier: 2,
    requirement: "R2",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      const optionStyle = content.match(/\.option\s*\{([\s\S]*?)\}/) || 
                          content.match(/\.option-label\s*\{([\s\S]*?)\}/) || 
                          content.match(/\.opt\s*\{([\s\S]*?)\}/);
      if (!optionStyle) return true;
      return !optionStyle[1].includes('white-space: nowrap') || optionStyle[1].includes('white-space: normal') || optionStyle[1].includes('flex-wrap');
    }
  },
  {
    id: "T2.2.2",
    name: "MathJax and MathML formula rendering inside layout tables",
    tier: 2,
    requirement: "R2",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return !/<table>[\s\S]*?<math>/.test(content) || /overflow-x:\s*auto|overflow:\s*auto/.test(content);
    }
  },
  {
    id: "T2.2.3",
    name: "Colored Diagrams and Question illustrations filter exception in Light Mode",
    tier: 2,
    requirement: "R2",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.light-theme[\s\S]*?filter:\s*none/.test(content) || 
             /\.light-theme[\s\S]*?filter:\s*invert\(0\)/.test(content) ||
             /body:not\(\.light-theme\)[\s\S]*?filter:\s*invert/.test(content);
    }
  },
  {
    id: "T2.2.4",
    name: "Contrast rules compatibility for selected/active option class",
    tier: 2,
    requirement: "R2",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.option\.selected|\.option\.sel|\.opt\.sel/.test(content);
    }
  },
  {
    id: "T2.2.5",
    name: "Option legibility for disabled/checked solution mode states",
    tier: 2,
    requirement: "R2",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.option\.correct|\.option\.wrong|\.opt\.cor|\.opt\.inc/.test(content);
    }
  },

  // --- Requirement 3: Question Navigator ---
  {
    id: "T2.3.1",
    name: "Grid wrapping layout rules for large question counts (100+)",
    tier: 2,
    requirement: "R3",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /flex-wrap:\s*wrap|display:\s*grid|overflow-y:\s*auto/.test(content);
    }
  },
  {
    id: "T2.3.2",
    name: "Safety bounds verification for single question exams",
    tier: 2,
    requirement: "R3",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /questions\.length/.test(content) && !/questions\[0\]\./.test(content);
    }
  },
  {
    id: "T2.3.3",
    name: "Navigator state class toggle logic sequencing (Clear -> Answer -> Review)",
    tier: 2,
    requirement: "R3",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /classList\.remove/.test(content);
    }
  },
  {
    id: "T2.3.4",
    name: "Contrast rules validation for Answered and Review states background color",
    tier: 2,
    requirement: "R3",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.nav-question\.answered|\.nav-question\.review|\.q-box\.cor|\.q-box\.marked/.test(content) ||
             (/background:\s*var\(--success\)[\s\S]*?color:\s*#?fff/i.test(content)) ||
             (/background:\s*var\(--warning\)[\s\S]*?color:\s*#?fff/i.test(content));
    }
  },
  {
    id: "T2.3.5",
    name: "Keyboard Navigation updates Highlight on Navigator Grid items",
    tier: 2,
    requirement: "R3",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /keydown|keyup/.test(content) && /ArrowLeft|ArrowRight|keyCode/.test(content);
    }
  },

  // --- Requirement 4: Bottom Navigation & Layouts ---
  {
    id: "T2.4.1",
    name: "Media Query viewport scaling responsive CSS at 320px",
    tier: 2,
    requirement: "R4",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /@media/.test(content) && /max-width/.test(content);
    }
  },
  {
    id: "T2.4.2",
    name: "Mobile layout buttons wrap rules (e.g. 100% width wrap for review button)",
    tier: 2,
    requirement: "R4",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah"],
    check: (content, style) => {
      return /flex-wrap:\s*wrap/.test(content) && /\.btn-review/.test(content);
    }
  },
  {
    id: "T2.4.3",
    name: "Submit action toggling or Next replacement on final question",
    tier: 2,
    requirement: "R4",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /submit|Submit/.test(content) && 
             (/currentIndex\s*===\s*questions\.length\s*-\s*1/.test(content) || /currentQuestion\s*===\s*totalQuestions\s*-\s*1/.test(content) || /activeQuestion\s*===\s*totalQuestions\s*-\s*1/.test(content));
    }
  },
  {
    id: "T2.4.4",
    name: "Responsive Sidebar drawer sliding/toggle state controls on mobile",
    tier: 2,
    requirement: "R4",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah"],
    check: (content, style) => {
      return /toggleSidebar|toggleDrawer|openDrawer|closeDrawer|classList\.toggle\(\s*['"](open|active|show-sidebar)['"]\s*\)/.test(content);
    }
  },
  {
    id: "T2.4.5",
    name: "Bottom Navigation Bar pin-to-bottom layout styling",
    tier: 2,
    requirement: "R4",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.navigation-bar|\.footer-bar|\.action-bar|\.nav/.test(content) &&
             /position:\s*fixed;\s*bottom:\s*0/i.test(content);
    }
  },

  // --- Requirement 5: Results Modal ---
  {
    id: "T2.5.1",
    name: "Negative Score formatting style overrides inside modal markup",
    tier: 2,
    requirement: "R5",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /negative|minus|\.negative/.test(content);
    }
  },
  {
    id: "T2.5.2",
    name: "Modal Dismissal key listener on Escape keyboard key",
    tier: 2,
    requirement: "R5",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /Escape|27/.test(content);
    }
  },
  {
    id: "T2.5.3",
    name: "Backdrop/translucent overlay click Modal Dismissal logic",
    tier: 2,
    requirement: "R5",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /event\.target\s*===\s*modal|target\s*===\s*modalElement|e\.target\s*===\s*modal/.test(content);
    }
  },
  {
    id: "T2.5.4",
    name: "Blank exam submission scores calculation default overrides (Division by Zero check)",
    tier: 2,
    requirement: "R5",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /is(NaN|Null)|isNaN|questions\.length\s*>\s*0|\?\s*0\s*:\s*100/.test(content) ||
             /score\s*>\s*0\s*\?\s*/.test(content);
    }
  },
  {
    id: "T2.5.5",
    name: "Modal Close button minimum touch target sizing (>= 44x44px)",
    tier: 2,
    requirement: "R5",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.close\s*\{[\s\S]*?(width|height|padding)/.test(content) || 
             /\.btn-close\s*\{[\s\S]*?(width|height|padding)/.test(content);
    }
  },

  // ==================== TIER 3: Cross-Feature Interactions (5 Cases) ====================
  {
    id: "T3.1",
    name: "Results Modal dynamic theme variable syncing on toggle action",
    tier: 3,
    requirement: "Cross-Feature",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.modal[\s\S]*?var\(--/.test(content) || /\.result-modal[\s\S]*?var\(--/.test(content);
    }
  },
  {
    id: "T3.2",
    name: "Dual language toggling style isolation (English/Hindi option label visibility and contrast)",
    tier: 3,
    requirement: "Cross-Feature",
    targetStyles: ["MocksWallah"],
    check: (content, style) => {
      return /\.en|\.hi/.test(content);
    }
  },
  {
    id: "T3.3",
    name: "Navigator grid items background color variable syncing on theme toggle",
    tier: 3,
    requirement: "Cross-Feature",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /\.nav-question[\s\S]*?var\(--/.test(content);
    }
  },
  {
    id: "T3.4",
    name: "Mobile navigator drawer slide z-index overlays bottom navigation bar z-index",
    tier: 3,
    requirement: "Cross-Feature",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah"],
    check: (content, style) => {
      return /\.mobile-navigator[\s\S]*?z-index/.test(content) || /\.navigator-sidebar[\s\S]*?z-index/.test(content);
    }
  },
  {
    id: "T3.5",
    name: "Releasing browser beforeunload block handler on final Submit action",
    tier: 3,
    requirement: "Cross-Feature",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /window\.onbeforeunload\s*=\s*null/.test(content) || /onbeforeunload\s*=\s*null/.test(content);
    }
  },

  // ==================== TIER 4: Real-World Scenarios (5 Cases) ====================
  {
    id: "T4.1",
    name: "Standard exam session workflow event control registrations",
    tier: 4,
    requirement: "Workflow",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah"],
    check: (content, style) => {
      return /startBtn|startExam|initExam|submitTest|closeModal/.test(content);
    }
  },
  {
    id: "T4.2",
    name: "Persistence workflow: localStorage reading + click handler toggling and writing",
    tier: 4,
    requirement: "Workflow",
    targetStyles: ["CBTExam", "DailyQuiz"],
    check: (content, style) => {
      return /localStorage\.getItem\(\s*['"]portal-theme['"]\s*\)/.test(content) &&
             /localStorage\.setItem\(\s*['"]portal-theme['"]\s*,/.test(content);
    }
  },
  {
    id: "T4.3",
    name: "Topic-Concept quick session: explanations visibility and locked solutions",
    tier: 4,
    requirement: "Workflow",
    targetStyles: ["TopicConcept"],
    check: (content, style) => {
      return /\.sol|\.solution-box/.test(content) && /pointer-events:\s*none/.test(content);
    }
  },
  {
    id: "T4.4",
    name: "Mobile workflow: responsive media queries + drawer hamburger button toggle actions",
    tier: 4,
    requirement: "Workflow",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah"],
    check: (content, style) => {
      return /@media/.test(content) && /max-width/.test(content) && /drawer|hamburger|menu-btn/.test(content);
    }
  },
  {
    id: "T4.5",
    name: "Adversarial contrast audit: important declaration overrides on colors and filters",
    tier: 4,
    requirement: "Workflow",
    targetStyles: ["CBTExam", "DailyQuiz", "MocksWallah", "TopicConcept"],
    check: (content, style) => {
      return /color:[^;]*?!important/.test(content) && /fill:[^;]*?!important/.test(content);
    }
  }
];

// Run test cases against scanned files
console.log('Running test suite...');
const results = [];

testCases.forEach((tc) => {
  let passedCount = 0;
  let totalChecked = 0;
  const failures = [];

  tc.targetStyles.forEach((styleKey) => {
    const filePaths = filesByStyle[styleKey];
    filePaths.forEach((filePath) => {
      totalChecked++;
      try {
        const content = getFileContent(filePath);
        const pass = tc.check(content, styleKey);
        if (pass) {
          passedCount++;
        } else {
          failures.push({
            file: path.relative(BASE_DIR, filePath),
            style: styleKey
          });
        }
      } catch (err) {
        failures.push({
          file: path.relative(BASE_DIR, filePath),
          style: styleKey,
          error: err.message
        });
      }
    });
  });

  const passed = passedCount === totalChecked && totalChecked > 0;
  results.push({
    id: tc.id,
    name: tc.name,
    tier: tc.tier,
    requirement: tc.requirement,
    passed,
    passedCount,
    totalChecked,
    failedCount: totalChecked - passedCount,
    failures: failures.slice(0, 5) // log first 5 failures for debugging
  });
});

// Calculate statistics
const totalTests = results.length;
const passedTests = results.filter(r => r.passed).length;
const failedTests = totalTests - passedTests;
const passRate = ((passedTests / totalTests) * 100).toFixed(1);

// Format output
let report = `================================================================================
MOCK EXAM PORTAL E2E TESTING REPORT
================================================================================
Timestamp: ${new Date().toISOString()}
Total Files Classified:
- CBTExam: ${filesByStyle.CBTExam.length}
- DailyQuiz: ${filesByStyle.DailyQuiz.length}
- MocksWallah: ${filesByStyle.MocksWallah.length}
- TopicConcept: ${filesByStyle.TopicConcept.length}

TEST SUITE SUMMARY:
- Total Test Cases: ${totalTests}
- Passed: ${passedTests}
- Failed: ${failedTests}
- Pass Rate: ${passRate}%

================================================================================
DETAILED TEST CASE RESULTS
================================================================================
`;

results.forEach((r) => {
  report += `[${r.passed ? 'PASS' : 'FAIL'}] ${r.id} (Tier ${r.tier} - ${r.requirement}): ${r.name}
    Checked: ${r.totalChecked} files (${r.passedCount} passed, ${r.failedCount} failed)
`;
  if (!r.passed && r.failures.length > 0) {
    report += `    Sample Failures:\n`;
    r.failures.forEach((f) => {
      report += `      - ${f.file} (${f.style})${f.error ? ' Error: ' + f.error : ''}\n`;
    });
  }
  report += `--------------------------------------------------------------------------------\n`;
});

console.log(report);

// Write to initial_run_results.txt
const resultsDir = path.join(BASE_DIR, '.agents', 'e2e_testing_orch');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}
const resultsPath = path.join(resultsDir, 'initial_run_results.txt');
fs.writeFileSync(resultsPath, report, 'utf8');
console.log(`Results saved to: ${resultsPath}`);
