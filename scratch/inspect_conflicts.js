const plan = require('./rename_plan.json');

const nameCounts = {};
for (const p of plan) {
  let name = p.proposed;
  if (!nameCounts[name]) {
    nameCounts[name] = [];
  }
  nameCounts[name].push(p);
}

const entries = Object.entries(nameCounts).filter(([name, list]) => list.length > 1);
console.log('CONFLICTS COUNT:', entries.length);
for (const [name, list] of entries.slice(0, 10)) {
  console.log(`Conflict for "${name}":`);
  list.forEach(p => {
    console.log(`  - "${p.original}" (Title: "${p.title}", Section: "${p.sectionName}")`);
  });
}
