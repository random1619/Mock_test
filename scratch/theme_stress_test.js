/**
 * theme_stress_test.js
 * Empirical stress-test harness using JSDOM to verify the robustness
 * and correctness of the theme toggle implementation.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Representative file to run tests on
const TARGET_FILE = path.resolve(__dirname, '../Aman Sir/Advance Ancient History 360 Pro Level M (Hindi).html');

console.log(`Running theme toggle stress tests on: ${TARGET_FILE}\n`);

if (!fs.existsSync(TARGET_FILE)) {
    console.error(`Error: Target file not found at ${TARGET_FILE}`);
    process.exit(1);
}

const htmlContent = fs.readFileSync(TARGET_FILE, 'utf8');

// Helper to construct a JSDOM environment with specific localStorage setup
function createJSDOMEnvironment(setupStorageFn, enableScripts = true) {
    const virtualConsole = new JSDOM.VirtualConsole();
    virtualConsole.sendTo(console, { omitLog: true });

    // Mock localStorage before scripts run
    const storageStore = {};
    const mockLocalStorage = {
        getItem: (key) => {
            if (setupStorageFn.shouldThrow) throw new Error('SecurityError: localStorage is sandboxed');
            return storageStore[key] || null;
        },
        setItem: (key, value) => {
            if (setupStorageFn.shouldThrow) throw new Error('SecurityError: localStorage is sandboxed');
            storageStore[key] = String(value);
        },
        removeItem: (key) => {
            if (setupStorageFn.shouldThrow) throw new Error('SecurityError: localStorage is sandboxed');
            delete storageStore[key];
        },
        clear: () => {
            if (setupStorageFn.shouldThrow) throw new Error('SecurityError: localStorage is sandboxed');
            for (const key in storageStore) delete storageStore[key];
        },
        get length() {
            return Object.keys(storageStore).length;
        }
    };

    // Initialize initial values
    if (!setupStorageFn.shouldThrow && setupStorageFn.initialValues) {
        Object.entries(setupStorageFn.initialValues).forEach(([k, v]) => {
            storageStore[k] = v;
        });
    }

    const dom = new JSDOM(htmlContent, {
        runScripts: enableScripts ? 'dangerously' : 'outside-only',
        resources: 'usable',
        virtualConsole,
        beforeParse(window) {
            // Define mock localStorage on the window object
            Object.defineProperty(window, 'localStorage', {
                value: mockLocalStorage,
                configurable: true,
                enumerable: true,
                writable: true
            });
        }
    });

    return { dom, storageStore };
}

// -------------------------------------------------------------
// Test Suite
// -------------------------------------------------------------
const results = [];

function assert(condition, message) {
    if (condition) {
        results.push({ name: message, status: 'PASS' });
        console.log(`[PASS] ${message}`);
    } else {
        results.push({ name: message, status: 'FAIL' });
        console.error(`[FAIL] ${message}`);
    }
}

// TEST 1: LocalStorage corruption
function testLocalStorageCorruption() {
    console.log('--- Test 1: LocalStorage Corruption ---');
    const invalidValues = ['xyz', '[object Object]', 'undefined', 'null', ''];
    
    invalidValues.forEach(val => {
        const { dom } = createJSDOMEnvironment({
            initialValues: { 'portal-theme': val }
        }, true);
        
        const { window } = dom;
        const htmlClassList = window.document.documentElement.classList;
        const bodyClassList = window.document.body.classList;
        
        // Assert it defaults to dark (does not have light-theme class)
        assert(!htmlClassList.contains('light-theme'), `Should not add light-theme to <html> for corrupted value "${val}"`);
        assert(!bodyClassList.contains('light-theme'), `Should not add light-theme to <body> for corrupted value "${val}"`);
        
        // Check icon is moon (dark mode)
        const btn = window.document.getElementById('themeToggle');
        if (btn) {
            const icon = btn.querySelector('i');
            assert(icon && icon.className.includes('fa-moon'), `Icon should be fa-moon for corrupted value "${val}"`);
        } else {
            assert(false, `Theme toggle button #themeToggle not found for value "${val}"`);
        }
        
        dom.window.close();
    });
}

// TEST 2: Blocked/Sandboxed LocalStorage (Private mode, etc.)
function testBlockedLocalStorage() {
    console.log('\n--- Test 2: Sandboxed/Blocked LocalStorage ---');
    
    try {
        const { dom } = createJSDOMEnvironment({
            shouldThrow: true
        }, true);
        
        const { window } = dom;
        const htmlClassList = window.document.documentElement.classList;
        const bodyClassList = window.document.body.classList;
        
        // Assert it defaults to dark and page loads without unhandled crash
        assert(!htmlClassList.contains('light-theme'), 'Should default to dark (no html class) when localStorage throws');
        assert(!bodyClassList.contains('light-theme'), 'Should default to dark (no body class) when localStorage throws');
        
        const btn = window.document.getElementById('themeToggle');
        assert(btn !== null, 'Page should load `#themeToggle` button safely');
        
        // Trigger click to see if click handler catches exception
        if (btn) {
            // Trigger click
            btn.click();
            
            // Check that the class toggles successfully in-memory even if write fails
            assert(window.document.body.classList.contains('light-theme'), 'Theme should toggle to light in-memory on click');
            
            // Toggle back
            btn.click();
            assert(!window.document.body.classList.contains('light-theme'), 'Theme should toggle back to dark in-memory on click');
        }
        
        dom.window.close();
    } catch (e) {
        assert(false, `Should not throw unhandled exception when localStorage is blocked: ${e.message}`);
    }
}

// TEST 3: FOUC (Flash of Unstyled Content) Timing
function testFOUCTiming() {
    console.log('\n--- Test 3: FOUC Timing (HTML class in head) ---');
    
    // We want to verify that when theme is light, light-theme is applied to <html>
    // immediately as the script in <head> runs, before body is parsed.
    // We can simulate this by parsing only up to the </head> tag.
    const headEndIndex = htmlContent.indexOf('</head>');
    const headContentOnly = htmlContent.substring(0, headEndIndex + 7) + '<body></body></html>';
    
    const virtualConsole = new JSDOM.VirtualConsole();
    virtualConsole.sendTo(console, { omitLog: true });

    const dom = new JSDOM(headContentOnly, {
        runScripts: 'dangerously',
        beforeParse(window) {
            Object.defineProperty(window, 'localStorage', {
                value: {
                    getItem: () => 'light',
                    setItem: () => {}
                }
            });
        }
    });

    const htmlClassList = dom.window.document.documentElement.classList;
    assert(htmlClassList.contains('light-theme'), '<html> element must have light-theme class immediately in <head> phase');
    
    dom.window.close();
}

// TEST 4: Listener Conflicts & Legacy Classes
function testListenerConflicts() {
    console.log('\n--- Test 4: Event Listener Conflicts & Legacy Classes ---');
    
    const { dom, storageStore } = createJSDOMEnvironment({
        initialValues: { 'portal-theme': 'dark' }
    }, true);
    
    const { window } = dom;
    const btn = window.document.getElementById('themeToggle');
    
    if (!btn) {
        assert(false, 'Cannot test listener conflicts because #themeToggle does not exist');
        dom.window.close();
        return;
    }
    
    // Test: verify that clicking once toggles theme to light, but does not toggle .dark-mode class
    btn.click();
    assert(window.document.body.classList.contains('light-theme'), 'First click should add light-theme class to body');
    assert(window.document.documentElement.classList.contains('light-theme'), 'First click should add light-theme class to html');
    assert(!window.document.body.classList.contains('dark-mode'), 'First click should NOT toggle legacy dark-mode class on body');
    assert(storageStore['portal-theme'] === 'light', 'First click should update localStorage portal-theme to light');
    
    // Verify icon changed to sun
    let icon = btn.querySelector('i');
    assert(icon && icon.className.includes('fa-sun'), 'Icon should switch to fa-sun in light mode');

    // Double click / Rapid clicks: Click rapid 5 times
    // Let's verify that rapid clicks function synchronously and cleanly toggle the theme.
    // 2nd click -> dark
    btn.click();
    assert(!window.document.body.classList.contains('light-theme'), '2nd click: light-theme removed');
    assert(!window.document.body.classList.contains('dark-mode'), '2nd click: legacy dark-mode NOT added');
    assert(storageStore['portal-theme'] === 'dark', '2nd click: localStorage is dark');
    
    // 3rd click -> light
    btn.click();
    // 4th click -> dark
    btn.click();
    // 5th click -> light
    btn.click();
    
    assert(window.document.body.classList.contains('light-theme'), 'After 5 rapid clicks, body should be light-theme');
    assert(!window.document.body.classList.contains('dark-mode'), 'After 5 rapid clicks, body should NOT have legacy dark-mode class');
    assert(storageStore['portal-theme'] === 'light', 'After 5 rapid clicks, localStorage portal-theme should be light');

    dom.window.close();
}

// TEST 5: Visual Contrast & Math Images checks in Light Theme
function testVisualContrastAndMath() {
    console.log('\n--- Test 5: Visual Contrast & Math Images Reset ---');
    
    // Verify css overrides contains the required styles
    assert(htmlContent.includes('body.light-theme {'), 'CSS must include body.light-theme rules block');
    assert(htmlContent.includes('--bg: #f3f4f6 !important;'), 'Light theme CSS must define contrast bg --bg');
    assert(htmlContent.includes('--card: #ffffff !important;'), 'Light theme CSS must define contrast card --card');
    assert(htmlContent.includes('--text: #1f2937 !important;'), 'Light theme CSS must define contrast text --text');
    assert(htmlContent.includes('--text-light: #6b7280 !important;'), 'Light theme CSS must define contrast text-light --text-light');
    
    // Check if the math images filters are properly disabled in light-theme overrides
    assert(htmlContent.includes('filter: none !important;'), 'Light theme CSS must contain filter: none !important to reset math image inversion');
    
    const selectorMatch = /body\.light-theme\s+\.question-card\s+img[\s\S]*?filter:\s*none\s*!important/i.test(htmlContent) ||
                          /body\.light-theme\s+\.option\s+img[\s\S]*?filter:\s*none\s*!important/i.test(htmlContent);
    assert(selectorMatch, 'Math images selectors must be present in light theme overrides resetting filter to none');
}

// Execute all tests
testLocalStorageCorruption();
testBlockedLocalStorage();
testFOUCTiming();
testListenerConflicts();
testVisualContrastAndMath();

console.log('\n-------------------------------------------------------------');
const passed = results.filter(r => r.status === 'PASS').length;
console.log(`Stress Test Execution Summary: Passed ${passed}/${results.length} checks.`);

if (passed === results.length) {
    console.log('\nCONCLUSION: Theme toggle implementation is ROBUST and EMPIRICALLY CORRECT under stress test.');
    process.exit(0);
} else {
    console.error('\nCONCLUSION: Theme toggle implementation has stress test FAILURES.');
    process.exit(1);
}
