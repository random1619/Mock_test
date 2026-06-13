const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';
const tempDir = path.join(rootDir, '.agents', 'explorer_m2_3', 'temp');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const samples = [
    { src: 'Aman Sir/Advance Ancient History 360 Pro Level M (Hindi).html', dest: 'aman_sample.html' },
    { src: 'English Madhyam/Previous Year Papers/4777e04 (Hindi).html', dest: 'em_sample.html' },
    { src: 'RBE/Arithmetic Booster/Mock - Part 1 (Hindi).html', dest: 'rbe_sample.html' },
    { src: 'oliveboard/Oliveboard_Mocks/Cgl1 Responsive Exam Interface - Part 1 (English).html', dest: 'olive_sample.html' },
    { src: 'Other Brands/Practice Sets/Mock - Part 1 (Hindi).html', dest: 'other_sample.html' }
];

samples.forEach(s => {
    const srcPath = path.join(rootDir, s.src);
    const destPath = path.join(tempDir, s.dest);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${s.src} to temp/${s.dest}`);
});
