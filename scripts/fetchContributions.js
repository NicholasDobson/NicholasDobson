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
  console.log('🧟‍♂️ Generating GitHub-accurate contribution matrix for demo...');
  
  // Match your actual GitHub pattern from the screenshot
  const zombieData = [];
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  // Generate 53 weeks to match GitHub's layout exactly
  const WEEKS = 53;
  const DAYS_PER_WEEK = 7;
  
  for (let week = 0; week < WEEKS; week++) {
    for (let day = 0; day < DAYS_PER_WEEK; day++) {
      // Calculate the actual date for this cell
      const cellDate = new Date(oneYearAgo);
      cellDate.setDate(oneYearAgo.getDate() + (week * 7) + day);
      
      let level = 0;
      let count = 0;
      
      // Based on your GitHub profile, you have good activity in recent months
      const weekProgress = week / WEEKS;
      const dayOfWeek = day; // 0=Sunday, 1=Monday, etc.
      
      // Higher activity in recent months (matches your profile)
      if (weekProgress > 0.7) {
        // Recent months - high activity
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdays
          const random = Math.random();
          if (random > 0.1) {
            if (random > 0.8) level = 4, count = Math.floor(Math.random() * 10) + 15;
            else if (random > 0.6) level = 3, count = Math.floor(Math.random() * 8) + 8;
            else if (random > 0.4) level = 2, count = Math.floor(Math.random() * 5) + 3;
            else level = 1, count = Math.floor(Math.random() * 3) + 1;
          }
        } else if (Math.random() > 0.6) { // Some weekend activity
          level = Math.random() > 0.5 ? 2 : 1;
          count = level * Math.floor(Math.random() * 3) + 1;
        }
      } else if (weekProgress > 0.4) {
        // Middle months - moderate activity
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && Math.random() > 0.3) {
          const random = Math.random();
          if (random > 0.7) level = 3, count = Math.floor(Math.random() * 6) + 5;
          else if (random > 0.5) level = 2, count = Math.floor(Math.random() * 4) + 2;
          else level = 1, count = 1;
        }
      } else {
        // Earlier months - lighter activity
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && Math.random() > 0.6) {
          level = Math.random() > 0.7 ? 2 : 1;
          count = level;
        }
      }
      
      zombieData.push({
        week,
        day,
        level,
        id: `${week}-${day}`,
        date: cellDate.toISOString().split('T')[0],
        count,
        infected: false,
        x: week,
        y: day
      });
    }
  }
  
  const outputPath = path.join(__dirname, '..', 'public', 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(zombieData, null, 2));
  
  const totalContributions = zombieData.reduce((sum, cell) => sum + cell.count, 0);
  const activeDays = zombieData.filter(cell => cell.level > 0).length;
  
  console.log('✅ GitHub-accurate contribution matrix generated!');
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
