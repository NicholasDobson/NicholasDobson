import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const username = process.env.GITHUB_USERNAME;

async function getContributions() {
  try {
    console.log('🧟‍♂️ Zombie Hacker initiating GitHub infiltration...');
    console.log(`👤 Target username: ${username || 'NicholasDobson'}`);
    
    // Get all years of contribution data
    const allContributions = await getAllYearsContributions(username || 'NicholasDobson');
    
    if (!allContributions || allContributions.length === 0) {
      console.log('⚠️  No contributions found, generating zombie data...');
      generateZombieContributionData();
      return;
    }

    // Transform the data to match our zombie grid format
    const transformedData = transformAllContributionData(allContributions);
    
    const outputPath = path.join(__dirname, '..', 'public', 'data.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));
    
    console.log('✅ GitHub matrix successfully infiltrated!');
    console.log(`💀 ${transformedData.length} contribution cells ready for zombie infection`);
    console.log(`� Years of data: ${Math.ceil(transformedData.length / 365)} years`);
    console.log(`�📁 Data written to: ${outputPath}`);
    
  } catch (error) {
    console.error('💥 Infiltration failed:', error.message);
    console.log('🧟‍♂️ Falling back to zombie-generated data...');
    generateZombieContributionData();
  }
}

async function getAllYearsContributions(username) {
  const currentYear = new Date().getFullYear();
  const startYear = 2023; // GitHub was founded in 2008
  const allContributions = [];
  
  console.log(`📅 Scanning ${currentYear - startYear + 1} years of contribution history...`);
  
  for (let year = startYear; year <= currentYear; year++) {
    try {
      console.log(`   🔍 Infiltrating year ${year}...`);
      const url = `https://github-contributions-api.jogruber.de/v4/${username}?y=${year}`;
      const res = await fetch(url);
      
      if (res.ok) {
        const json = await res.json();
        if (json.contributions && json.contributions.length > 0) {
          allContributions.push(...json.contributions);
          console.log(`   ✅ ${json.contributions.length} contributions found in ${year}`);
        }
      }
      
      // Rate limiting - be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`   ⚠️ Failed to get data for ${year}: ${error.message}`);
    }
  }
  
  return allContributions.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function transformAllContributionData(contributions) {
  // Create a more realistic GitHub-style grid using actual data
  const zombieData = [];
  
  // Get the most recent 52 weeks of data for the main display
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - (52 * 7 * 24 * 60 * 60 * 1000));
  
  // Filter to get the last 52 weeks
  const recentContributions = contributions.filter(c => {
    const date = new Date(c.date);
    return date >= oneYearAgo && date <= now;
  });
  
  console.log(`📊 Using ${recentContributions.length} contributions from the last 52 weeks`);
  
  // Create grid starting from one year ago
  for (let week = 0; week < 52; week++) {
    for (let day = 0; day < 7; day++) {
      const targetDate = new Date(oneYearAgo.getTime() + (week * 7 + day) * 24 * 60 * 60 * 1000);
      const dateString = targetDate.toISOString().split('T')[0];
      
      // Find contribution for this date
      const contribution = recentContributions.find(c => c.date === dateString);
      const count = contribution ? contribution.count : 0;
      
      // Convert count to level (0-4)
      let level = 0;
      if (count > 0) {
        if (count >= 10) level = 4;
        else if (count >= 5) level = 3;
        else if (count >= 2) level = 2;
        else level = 1;
      }
      
      zombieData.push({
        week: week,
        day: day,
        level: level,
        id: `${week}-${day}`,
        date: dateString,
        count: count,
        infected: false
      });
    }
  }
  
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
