import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GRID_WIDTH = 52;
const GRID_HEIGHT = 7;
const CELL_SIZE = 12;
const ANIMATION_DURATION = 30; // seconds for full cycle

// Generate SVG for zombie hacker animation
async function generateZombieHackerSVG(contributionData, theme = 'dark') {
    const width = GRID_WIDTH * (CELL_SIZE + 2) + 100;
    const height = GRID_HEIGHT * (CELL_SIZE + 2) + 150;
    
    // Theme colors
    const themes = {
        dark: {
            bg: '#0d1117',
            border: '#00ff00',
            text: '#00ff00',
            cell: '#161b22',
            cellBorder: '#30363d',
            levels: ['#0e4429', '#006d32', '#26a641', '#39d353'],
            infected: '#ff0000',
            zombie: '#00ff00'
        },
        light: {
            bg: '#ffffff',
            border: '#00aa00',
            text: '#00aa00',
            cell: '#ebedf0',
            cellBorder: '#d0d7de',
            levels: ['#9be9a8', '#40c463', '#30a14e', '#216e39'],
            infected: '#cc0000',
            zombie: '#00aa00'
        }
    };
    
    const colors = themes[theme];
    
    // Create contribution grid data with hack sequence
    const hackSequence = generateHackSequence(contributionData);
    
    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: ${colors.bg}; }
      .border { fill: none; stroke: ${colors.border}; stroke-width: 2; }
      .text { fill: ${colors.text}; font-family: 'Courier New', monospace; font-size: 12px; }
      .cell { stroke: ${colors.cellBorder}; stroke-width: 1; }
      .infected { fill: ${colors.infected}; filter: drop-shadow(0 0 3px ${colors.infected}); }
      .zombie { fill: ${colors.zombie}; font-size: 10px; }
      .matrix { fill: ${colors.text}; opacity: 0.3; font-family: monospace; font-size: 8px; }
      .glow { filter: drop-shadow(0 0 3px ${colors.border}); }
      
      @keyframes matrixRain {
        0% { transform: translateY(-20px); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(${height}px); opacity: 0; }
      }
      
      @keyframes scanLine {
        0% { transform: translateX(-100%); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateX(${width}px); opacity: 0; }
      }
      
      @keyframes hackPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
      
      @keyframes zombieMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(${hackSequence.length * (CELL_SIZE + 2)}px, 0); }
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect class="bg" width="${width}" height="${height}" rx="8"/>
  
  <!-- Border -->
  <rect class="border glow" x="5" y="5" width="${width - 10}" height="${height - 10}" rx="8"/>
  
  <!-- Title -->
  <text class="text glow" x="${width / 2}" y="30" text-anchor="middle" font-size="14" font-weight="bold">
    🧟‍♂️ ZOMBIE HACKER INFILTRATING GITHUB MATRIX 🧟‍♂️
  </text>
  
  <!-- Matrix rain effect -->`;
  
    // Add matrix rain
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const delay = Math.random() * 5;
        svg += `
  <text class="matrix" x="${x}" y="0" style="animation: matrixRain 5s linear infinite; animation-delay: ${delay}s;">
    ${Math.random() > 0.5 ? '01010110' : 'ハッキング'}
  </text>`;
    }
    
    // Add scan line
    svg += `
  <rect x="0" y="${height / 2}" width="100%" height="2" fill="${colors.border}" opacity="0.5" style="animation: scanLine 3s linear infinite;"/>
  `;
    
    // Contribution grid
    svg += `
  <g transform="translate(50, 60)">`;
    
    // Draw contribution cells
    contributionData.forEach((cell, index) => {
        const x = cell.week * (CELL_SIZE + 2);
        const y = cell.day * (CELL_SIZE + 2);
        
        let cellColor = colors.cell;
        if (cell.level > 0) {
            cellColor = colors.levels[cell.level - 1];
        }
        
        // Check if this cell gets hacked in the sequence
        const hackTime = hackSequence.findIndex(seq => seq.week === cell.week && seq.day === cell.day);
        const isHacked = hackTime !== -1;
        
        svg += `
    <rect class="cell" x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="${cellColor}" rx="2">`;
        
        if (isHacked) {
            const hackDelay = (hackTime / hackSequence.length) * ANIMATION_DURATION;
            svg += `
      <animate attributeName="fill" values="${cellColor};${colors.infected};${colors.infected}" dur="${ANIMATION_DURATION}s" begin="${hackDelay}s" fill="freeze"/>
      <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="0.5s" begin="${hackDelay}s"/>`;
        }
        
        svg += `
    </rect>`;
        
        // Add skull emoji for hacked cells
        if (isHacked) {
            const hackDelay = (hackTime / hackSequence.length) * ANIMATION_DURATION;
            svg += `
    <text x="${x + CELL_SIZE/2}" y="${y + CELL_SIZE/2 + 3}" text-anchor="middle" font-size="8" opacity="0">
      💀
      <animate attributeName="opacity" values="0;1;1" dur="${ANIMATION_DURATION}s" begin="${hackDelay + 0.5}s" fill="freeze"/>
    </text>`;
        }
    });
    
    // Zombie hacker character
    const zombiePath = generateZombiePath(hackSequence);
    svg += `
    <g class="zombie">
      <text font-size="14" text-anchor="middle">
        🧟‍♂️
        <animateMotion dur="${ANIMATION_DURATION}s" repeatCount="indefinite">
          <path d="${zombiePath}"/>
        </animateMotion>
      </text>
    </g>`;
    
    svg += `
  </g>`;
    
    // Status display
    const totalCells = contributionData.filter(c => c.level > 0).length;
    const hackedCells = hackSequence.length;
    
    svg += `
  <!-- Status display -->
  <text class="text" x="${width - 10}" y="80" text-anchor="end" font-size="10">
    SYSTEMS BREACHED: ${hackedCells}
  </text>
  <text class="text" x="${width - 10}" y="95" text-anchor="end" font-size="10">
    TOTAL SYSTEMS: ${totalCells}
  </text>
  <text class="text" x="${width - 10}" y="110" text-anchor="end" font-size="10">
    STATUS: INFILTRATING
  </text>
  
  <!-- Progress bar -->
  <rect x="${width - 150}" y="120" width="140" height="8" fill="${colors.cell}" stroke="${colors.border}" rx="4"/>
  <rect x="${width - 148}" y="122" width="${(hackedCells / totalCells) * 136}" height="4" fill="${colors.infected}" rx="2">
    <animate attributeName="width" from="0" to="${(hackedCells / totalCells) * 136}" dur="${ANIMATION_DURATION}s" fill="freeze"/>
  </rect>
  
  <!-- Footer -->
  <text class="text glow" x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="10">
    🚀 GITHUB CONTRIBUTION MATRIX COMPROMISED 🚀
  </text>
  
</svg>`;
    
    return svg;
}

function generateHackSequence(contributionData) {
    // Create a hacking sequence - zombie moves through cells with contributions
    const validCells = contributionData.filter(cell => cell.level > 0);
    
    // Sort by week, then by day for a logical progression
    validCells.sort((a, b) => {
        if (a.week !== b.week) return a.week - b.week;
        return a.day - b.day;
    });
    
    // Take a subset for animation (too many would be overwhelming)
    const maxCells = Math.min(validCells.length, 50);
    return validCells.slice(0, maxCells);
}

function generateZombiePath(hackSequence) {
    if (hackSequence.length === 0) return "M 0 0";
    
    let path = `M ${hackSequence[0].week * (CELL_SIZE + 2) + CELL_SIZE/2} ${hackSequence[0].day * (CELL_SIZE + 2) + CELL_SIZE/2}`;
    
    for (let i = 1; i < hackSequence.length; i++) {
        const x = hackSequence[i].week * (CELL_SIZE + 2) + CELL_SIZE/2;
        const y = hackSequence[i].day * (CELL_SIZE + 2) + CELL_SIZE/2;
        path += ` L ${x} ${y}`;
    }
    
    return path;
}

// Load contribution data and generate SVGs
async function generateZombieHackerAnimations() {
    try {
        console.log('🧟‍♂️ Loading contribution data...');
        
        // Load the contribution data
        const dataPath = path.join(__dirname, '..', 'public', 'data.json');
        let contributionData = [];
        
        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            contributionData = JSON.parse(rawData);
            console.log(`📊 Loaded ${contributionData.length} contribution data points`);
        } else {
            console.log('⚠️ No data.json found, generating fallback data...');
            // Generate fallback data
            for (let week = 0; week < GRID_WIDTH; week++) {
                for (let day = 0; day < GRID_HEIGHT; day++) {
                    const intensity = Math.random();
                    let level = 0;
                    if (intensity > 0.75) level = 4;
                    else if (intensity > 0.55) level = 3;
                    else if (intensity > 0.35) level = 2;
                    else if (intensity > 0.15) level = 1;
                    
                    contributionData.push({ week, day, level, id: `${week}-${day}` });
                }
            }
        }
        
        console.log('🎨 Generating animated SVGs...');
        
        // Create output directory
        const outputDir = path.join(__dirname, '..', 'dist');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Generate dark theme
        const darkSVG = await generateZombieHackerSVG(contributionData, 'dark');
        fs.writeFileSync(path.join(outputDir, 'zombie-hacker-dark.svg'), darkSVG);
        
        // Generate light theme
        const lightSVG = await generateZombieHackerSVG(contributionData, 'light');
        fs.writeFileSync(path.join(outputDir, 'zombie-hacker-light.svg'), lightSVG);
        
        // Generate default (dark)
        fs.writeFileSync(path.join(outputDir, 'zombie-hacker.svg'), darkSVG);
        
        console.log('✅ Zombie Hacker animations generated successfully!');
        console.log('📁 Files created:');
        console.log('   - dist/zombie-hacker.svg');
        console.log('   - dist/zombie-hacker-dark.svg');
        console.log('   - dist/zombie-hacker-light.svg');
        
    } catch (error) {
        console.error('💥 Error generating zombie hacker animations:', error);
        process.exit(1);
    }
}

// Run the generator
console.log(`
🧟‍♂️ ================================== 🧟‍♂️
    ZOMBIE HACKER SVG GENERATOR
      Custom GitHub Contribution Animation
🧟‍♂️ ================================== 🧟‍♂️
`);

generateZombieHackerAnimations();
