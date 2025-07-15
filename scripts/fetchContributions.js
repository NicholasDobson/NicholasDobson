import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const username = process.env.GITHUB_USERNAME || 'NicholasDobson';
const githubToken = process.env.GITHUB_TOKEN;

/**
 * Get GitHub user contributions using the same GraphQL API as Platane/snk
 * This is the exact method they use to get accurate contribution data
 */
async function getGithubUserContribution(userName, options) {
  const query = /* GraphQL */ `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                contributionLevel
                weekday
                date
              }
            }
          }
        }
      }
    }
  `;
  
  const variables = { login: userName };

  const res = await fetch("https://api.github.com/graphql", {
    headers: {
      Authorization: `bearer ${options.githubToken}`,
      "Content-Type": "application/json",
      "User-Agent": "zombie-hacker-contributions",
    },
    method: "POST",
    body: JSON.stringify({ variables, query }),
  });

  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));

  const { data, errors } = await res.json();

  if (errors?.[0]) throw new Error(errors[0].message);

  return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
    ({ contributionDays }, x) =>
      contributionDays.map((d) => ({
        x,
        y: d.weekday,
        date: d.date,
        count: d.contributionCount,
        level:
          (d.contributionLevel === "FOURTH_QUARTILE" && 4) ||
          (d.contributionLevel === "THIRD_QUARTILE" && 3) ||
          (d.contributionLevel === "SECOND_QUARTILE" && 2) ||
          (d.contributionLevel === "FIRST_QUARTILE" && 1) ||
          0,
      })),
  );
}

async function getContributions() {
  try {
    console.log('🧟‍♂️ Zombie Hacker initiating GitHub infiltration...');
    console.log(`👤 Target username: ${username}`);
    
    if (!githubToken) {
      console.log('⚠️  No GitHub token found, using realistic demo data...');
      console.log('💡 In GitHub Actions, the token will be provided automatically');
      generateRealisticContributionData();
      return;
    }

    console.log('🔍 Using GitHub GraphQL API (same as Platane/snk)...');
    
    // Get GitHub contributions using the same method as Platane/snk
    const cells = await getGithubUserContribution(username, { githubToken });
    
    if (!cells || cells.length === 0) {
      console.log('⚠️  No contributions found, using realistic demo data...');
      generateRealisticContributionData();
      return;
    }

    // Transform the data to match our zombie grid format (same as GitHub's layout)
    const transformedData = transformContributionData(cells);
    
    const outputPath = path.join(__dirname, '..', 'public', 'data.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));
    
    console.log('✅ GitHub matrix successfully infiltrated!');
    console.log(`💀 ${transformedData.length} contribution cells ready for zombie infection`);
    console.log(`📊 Total contributions: ${cells.reduce((sum, cell) => sum + cell.count, 0)}`);
    console.log(`📊 Active contribution days: ${cells.filter(cell => cell.count > 0).length}`);
    console.log(`📁 Data written to: ${outputPath}`);
    
  } catch (error) {
    console.error('💥 Infiltration failed:', error.message);
    console.log('🧟‍♂️ Falling back to realistic demo data...');
    generateRealisticContributionData();
  }
}

function transformContributionData(cells) {
  // Transform GitHub GraphQL response to our zombie grid format
  // GitHub uses x=week, y=weekday (0=Sunday to 6=Saturday)
  const zombieData = [];
  
  cells.forEach((cell) => {
    zombieData.push({
      week: cell.x,
      day: cell.y,
      level: cell.level,
      id: `${cell.x}-${cell.y}`,
      date: cell.date,
      count: cell.count,
      infected: false
    });
  });
  
  // Sort by week then day for consistent layout
  zombieData.sort((a, b) => {
    if (a.week !== b.week) return a.week - b.week;
    return a.day - b.day;
  });
  
  return zombieData;
}

function generateRealisticContributionData() {
  console.log('🧟‍♂️ Generating realistic contribution matrix for demo...');
  
  const zombieData = [];
  const GRID_WIDTH = 52;
  const GRID_HEIGHT = 7;
  
  // Create a more realistic pattern based on typical developer activity
  for (let week = 0; week < GRID_WIDTH; week++) {
    for (let day = 0; day < GRID_HEIGHT; day++) {
      let level = 0;
      
      // More activity on weekdays (Mon-Fri = days 1-5)
      const isWeekday = day >= 1 && day <= 5;
      const isWeekend = day === 0 || day === 6;
      
      // Create periods of high/low activity
      const activityPeriod = Math.sin((week / 52) * Math.PI * 4) * 0.5 + 0.5;
      const randomness = Math.random();
      
      if (isWeekday) {
        // Higher activity on weekdays
        if (activityPeriod > 0.7 && randomness > 0.2) level = 4;
        else if (activityPeriod > 0.5 && randomness > 0.3) level = 3;
        else if (activityPeriod > 0.3 && randomness > 0.4) level = 2;
        else if (randomness > 0.6) level = 1;
      } else if (isWeekend) {
        // Lower activity on weekends
        if (activityPeriod > 0.8 && randomness > 0.7) level = 2;
        else if (randomness > 0.8) level = 1;
      }
      
      // Add some vacation periods (no activity for a few weeks)
      if ((week >= 20 && week <= 22) || (week >= 45 && week <= 47)) {
        level = Math.random() > 0.9 ? 1 : 0;
      }
      
      zombieData.push({
        week,
        day,
        level,
        id: `${week}-${day}`,
        date: new Date(Date.now() - (GRID_WIDTH - week) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: level * Math.floor(Math.random() * 5 + 1),
        infected: false
      });
    }
  }
  
  const outputPath = path.join(__dirname, '..', 'public', 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(zombieData, null, 2));
  
  const totalContributions = zombieData.reduce((sum, cell) => sum + cell.count, 0);
  const activeDays = zombieData.filter(cell => cell.level > 0).length;
  
  console.log('✅ Realistic demo contribution matrix generated!');
  console.log(`💀 ${zombieData.length} cells ready for infection`);
  console.log(`📊 Total contributions: ${totalContributions}`);
  console.log(`📊 Active days: ${activeDays}`);
  console.log(`📁 Data written to: ${outputPath}`);
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
      Using Platane/snk GraphQL Method
🧟‍♂️ ================================== 🧟‍♂️
`);

getContributions().catch((error) => {
  console.error('💥 Fatal error in zombie system:', error);
  process.exit(1);
});
