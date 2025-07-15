const fs = require('fs');

const htmlTemplate = fs.readFileSync('./zombie_template.html', 'utf8');
const gridData = fs.readFileSync('./dist/contributions.json', 'utf8');

const finalHtml = htmlTemplate.replace('/* {{CONTRIBUTION_DATA}} */', `const contributionData = ${gridData};`);

fs.writeFileSync('./dist/index.html', finalHtml);
