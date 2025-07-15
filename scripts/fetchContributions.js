import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const username = process.env.GITHUB_USERNAME;

async function getContributions() {
  try {
    console.log('🧟‍♂️ Zombie Hacker initiating GitHub infiltration...');
    console.log(`👤 Target username: ${username}`);
    
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const json = await res.json();
    
    if (!json.contributions) {
      console.log('⚠️  No contributions found, generating zombie data...');
      generateZombieContributionData();
      return;
    }

    // Transform the data to match our zombie grid format
    const transformedData = transformContributionData(json.contributions);
    
    const outputPath = path.join(__dirname, '..', 'public', 'data.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));
    
    console.log('✅ GitHub matrix successfully infiltrated!');
    console.log(`💀 ${transformedData.length} contribution cells ready for zombie infection`);
    console.log(`📁 Data written to: ${outputPath}`);
    
  } catch (error) {
    console.error('💥 Infiltration failed:', error.message);
    console.log('🧟‍♂️ Falling back to zombie-generated data...');
    generateZombieContributionData();
  }
}

function transformContributionData(contributions) {
  // Transform GitHub contributions to our zombie grid format
  const zombieData = [];
  let week = 0;
  let day = 0;
  
  contributions.forEach((contribution, index) => {
    const level = Math.min(4, Math.max(0, contribution.count > 0 ? 
      contribution.count >= 4 ? 4 :
      contribution.count >= 3 ? 3 :
      contribution.count >= 2 ? 2 : 1 : 0));
    
    zombieData.push({
      week: week,
      day: day,
      level: level,
      id: `${week}-${day}`,
      date: contribution.date,
      count: contribution.count,
      infected: false
    });
    
    day++;
    if (day >= 7) {
      day = 0;
      week++;
    }
  });
  
  return zombieData;
}

function generateZombieContributionData() {
  console.log('🧟‍♂️ Generating zombie contribution matrix...');
  
  const zombieData = [];
  const GRID_WIDTH = 52;
  const GRID_HEIGHT = 7;
  
  for (let week = 0; week < GRID_WIDTH; week++) {
    for (let day = 0; day < GRID_HEIGHT; day++) {
      const intensity = Math.random();
      let level = 0;
      
      // Generate more realistic contribution patterns
      if (intensity > 0.8) level = 4;        // Very active
      else if (intensity > 0.6) level = 3;   // Active
      else if (intensity > 0.4) level = 2;   // Moderate
      else if (intensity > 0.2) level = 1;   // Light
      // else level = 0 (no contributions)
      
      zombieData.push({
        week,
        day,
        level,
        id: `${week}-${day}`,
        date: new Date(Date.now() - (GRID_WIDTH - week) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: level,
        infected: false
      });
    }
  }
  
  const outputPath = path.join(__dirname, '..', 'public', 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(zombieData, null, 2));
  
  console.log('✅ Zombie contribution matrix generated successfully!');
  console.log(`💀 ${zombieData.length} cells ready for infection`);
  console.log(`📁 Data written to: ${outputPath}`);
}

// Add some zombie flair to the console output
console.log(`
🧟‍♂️ ================================== 🧟‍♂️
    ZOMBIE HACKER CONTRIBUTION MATRIX
        GitHub Infiltration System
🧟‍♂️ ================================== 🧟‍♂️
`);

getContributions().catch((error) => {
  console.error('💥 Fatal error in zombie system:', error);
  process.exit(1);
});
