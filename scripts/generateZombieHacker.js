import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GRID_WIDTH = 52;
const GRID_HEIGHT = 7;
const CELL_SIZE = 11;
const CELL_GAP = 3;
const ANIMATION_DURATION = 20; // seconds for full cycle

// Generate SVG for zombie hacker animation
async function generateZombieHackerSVG(contributionData, theme = 'dark') {
    const gridWidth = GRID_WIDTH * (CELL_SIZE + CELL_GAP) - CELL_GAP;
    const gridHeight = GRID_HEIGHT * (CELL_SIZE + CELL_GAP) - CELL_GAP;
    const padding = 40;
    const width = gridWidth + (padding * 2);
    const height = gridHeight + 120;
    
    // Theme colors
    const themes = {
        dark: {
            bg: '#0d1117',
            cardBg: '#161b22',
            border: '#30363d',
            accent: '#58a6ff',
            text: '#f0f6fc',
            textSecondary: '#7d8590',
            cell: '#161b22',
            levels: ['#0e4429', '#006d32', '#26a641', '#39d353'],
            infected: '#f85149',
            zombie: '#ffa657',
            matrix: '#7c3aed'
        },
        light: {
            bg: '#ffffff',
            cardBg: '#f6f8fa',
            border: '#d0d7de',
            accent: '#0969da',
            text: '#24292f',
            textSecondary: '#656d76',
            cell: '#ebedf0',
            levels: ['#9be9a8', '#40c463', '#30a14e', '#216e39'],
            infected: '#d1242f',
            zombie: '#fb8500',
            matrix: '#8b5cf6'
        }
    };
    
    const colors = themes[theme];
    
    // Create contribution grid data with hack sequence
    const hackSequence = generateHackSequence(contributionData);
    
    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: ${colors.bg}; }
      .card-bg { fill: ${colors.cardBg}; }
      .border { fill: none; stroke: ${colors.border}; stroke-width: 1; }
      .accent-border { stroke: ${colors.accent}; stroke-width: 2; }
      .text { fill: ${colors.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .text-secondary { fill: ${colors.textSecondary}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .mono { font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; }
      .cell { stroke: ${colors.border}; stroke-width: 0.5; }
      .infected { fill: ${colors.infected} !important; filter: drop-shadow(0 0 4px ${colors.infected}66); }
      .zombie { fill: ${colors.zombie}; font-size: 12px; }
      .matrix { fill: ${colors.matrix}; opacity: 0.6; font-family: monospace; font-size: 6px; }
      .glow { filter: drop-shadow(0 0 8px ${colors.accent}66); }
      
      @keyframes matrixRain {
        0% { transform: translateY(-30px); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.8; }
        100% { transform: translateY(${height + 30}px); opacity: 0; }
      }
      
      @keyframes scanLine {
        0% { transform: translateX(-100%); opacity: 0; }
        50% { opacity: 0.8; }
        100% { transform: translateX(${width + 100}px); opacity: 0; }
      }
      
      @keyframes zombieMove {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(${gridWidth}px, 0) scale(1); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    </style>
    
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.cardBg};stop-opacity:1" />
    </linearGradient>
    
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)" rx="6"/>
  
  <!-- Main container -->
  <rect class="card-bg border" x="10" y="10" width="${width - 20}" height="${height - 20}" rx="6"/>
  
  <!-- Header -->
  <text class="text" x="${width / 2}" y="35" text-anchor="middle" font-size="16" font-weight="600">
    🧟‍♂️ Zombie Hacker Infiltration Status
  </text>`;
  
    // Add subtle matrix rain effect
    for (let i = 0; i < 8; i++) {
        const x = 20 + (i * (width - 40) / 7);
        const delay = Math.random() * 4;
        const chars = ['0', '1', '█', '▓', '▒', '░', '♦', '♠'];
        svg += `
  <text class="matrix" x="${x}" y="0" style="animation: matrixRain 6s linear infinite; animation-delay: ${delay}s;">
    ${chars[Math.floor(Math.random() * chars.length)]}
  </text>`;
    }
    
    // Add scan line
    svg += `
  <rect x="0" y="${height / 2}" width="100%" height="1" fill="${colors.accent}" opacity="0.3" style="animation: scanLine 4s linear infinite;"/>
  `;
    
    // Contribution grid
    svg += `
  <g transform="translate(${padding}, 60)">`;
    
    // Month labels
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 12; i++) {
        const x = (i * gridWidth / 12) + 10;
        svg += `
    <text class="text-secondary" x="${x}" y="-5" font-size="9" text-anchor="start">${months[i]}</text>`;
    }
    
    // Day labels
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
        if (i % 2 === 1) { // Only show every other day to avoid crowding
            const y = i * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 + 3;
            svg += `
    <text class="text-secondary" x="-15" y="${y}" font-size="8" text-anchor="end">${days[i].slice(0, 1)}</text>`;
        }
    }
    
    // Draw contribution cells
    contributionData.forEach((cell, index) => {
        const x = cell.week * (CELL_SIZE + CELL_GAP);
        const y = cell.day * (CELL_SIZE + CELL_GAP);
        
        let cellColor = colors.cell;
        if (cell.level > 0 && cell.level <= colors.levels.length) {
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
      <animate attributeName="fill" values="${cellColor};${colors.infected};${colors.infected}" dur="0.5s" begin="${hackDelay}s" fill="freeze"/>
      <animateTransform attributeName="transform" type="scale" values="1;1.4;1.1" dur="0.5s" begin="${hackDelay}s" fill="freeze"/>`;
        }
        
        svg += `
    </rect>`;
        
        // Add skull emoji for hacked cells
        if (isHacked) {
            const hackDelay = (hackTime / hackSequence.length) * ANIMATION_DURATION;
            svg += `
    <text x="${x + CELL_SIZE/2}" y="${y + CELL_SIZE/2 + 2}" text-anchor="middle" font-size="7" opacity="0">
      💀
      <animate attributeName="opacity" values="0;1;1" dur="0.3s" begin="${hackDelay + 0.2}s" fill="freeze"/>
      <animateTransform attributeName="transform" type="scale" values="0;1.2;1" dur="0.3s" begin="${hackDelay + 0.2}s" fill="freeze"/>
    </text>`;
        }
    });
    
    // Zombie hacker character with improved path
    const zombiePath = generateZombiePath(hackSequence);
    svg += `
    <g class="zombie">
      <text font-size="16" text-anchor="middle" filter="url(#glow)">
        🧟‍♂️
        <animateMotion dur="${ANIMATION_DURATION}s" repeatCount="indefinite">
          <path d="${zombiePath}"/>
        </animateMotion>
      </text>
    </g>`;
    
    // Add infection trail - shows zombie's path
    hackSequence.forEach((cell, index) => {
        const x = cell.week * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
        const y = cell.day * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
        const delay = (index / hackSequence.length) * ANIMATION_DURATION;
        
        svg += `
    <circle cx="${x}" cy="${y}" r="2" fill="${colors.zombie}" opacity="0">
      <animate attributeName="opacity" values="0;0.8;0" dur="1s" begin="${delay}s"/>
      <animate attributeName="r" values="2;8;2" dur="1s" begin="${delay}s"/>
    </circle>`;
    });
    
    svg += `
  </g>`;
    
    // Stats panel
    const totalCells = contributionData.filter(c => c.level > 0).length;
    const hackedCells = hackSequence.length;
    const totalContributions = contributionData.reduce((sum, cell) => sum + (cell.count || 0), 0);
    
    svg += `
  <!-- Stats panel -->
  <g transform="translate(${width - 180}, ${height - 50})">
    <rect class="card-bg border" x="0" y="0" width="170" height="40" rx="4"/>
    <text class="text mono" x="8" y="15" font-size="10" font-weight="600">INFILTRATION STATUS</text>
    <text class="text-secondary mono" x="8" y="28" font-size="9">Systems: ${hackedCells}/${totalCells}</text>
    <text class="text-secondary mono" x="8" y="37" font-size="9">Commits: ${totalContributions}</text>
  </g>
  
  <!-- Progress bar -->
  <g transform="translate(20, ${height - 35})">
    <rect x="0" y="0" width="200" height="4" fill="${colors.border}" rx="2"/>
    <rect x="0" y="0" width="${Math.min(200, (hackedCells / Math.max(totalCells, 1)) * 200)}" height="4" fill="${colors.infected}" rx="2">
      <animate attributeName="width" from="0" to="${Math.min(200, (hackedCells / Math.max(totalCells, 1)) * 200)}" dur="${ANIMATION_DURATION}s" fill="freeze"/>
    </rect>
    <text class="text-secondary mono" x="0" y="-5" font-size="9">Infiltration Progress</text>
  </g>
  
  <!-- Footer -->
  <text class="text-secondary" x="${width / 2}" y="${height - 8}" text-anchor="middle" font-size="8">
    Real GitHub contribution data • Updated automatically
  </text>
  
</svg>`;
    
    return svg;
}

function generateHackSequence(contributionData) {
    // Create a more strategic hacking sequence that looks like actual movement
    const validCells = contributionData.filter(cell => cell.level > 0);
    
    if (validCells.length === 0) {
        // Fallback: create some interesting cells to hack in a logical path
        return contributionData.slice(0, 30).filter((cell, index) => index % 3 === 0);
    }
    
    // Start with highest value cells but arrange them in a more logical movement pattern
    validCells.sort((a, b) => {
        // Primary sort: by contribution level (higher first)
        if (a.level !== b.level) return b.level - a.level;
        // Secondary sort: by week (left to right progression)
        if (a.week !== b.week) return a.week - b.week;
        // Tertiary sort: by day
        return a.day - b.day;
    });
    
    // Take high-value targets but limit to create smooth movement
    const maxCells = Math.min(validCells.length, 25);
    let sequence = validCells.slice(0, maxCells);
    
    // Re-sort the sequence to create a logical left-to-right, top-to-bottom movement pattern
    sequence.sort((a, b) => {
        // Group by approximate week ranges for smoother movement
        const aWeekGroup = Math.floor(a.week / 4);
        const bWeekGroup = Math.floor(b.week / 4);
        
        if (aWeekGroup !== bWeekGroup) return aWeekGroup - bWeekGroup;
        
        // Within the same week group, alternate direction based on week
        if (aWeekGroup % 2 === 0) {
            // Even groups: top to bottom
            if (a.day !== b.day) return a.day - b.day;
            return a.week - b.week;
        } else {
            // Odd groups: bottom to top (creates snake-like movement)
            if (a.day !== b.day) return b.day - a.day;
            return a.week - b.week;
        }
    });
    
    return sequence;
}

function generateZombiePath(hackSequence) {
    if (hackSequence.length === 0) return "M 0 0";
    
    // Start from off-screen left and move to the first cell
    const startX = -20;
    const startY = hackSequence[0].day * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
    const firstX = hackSequence[0].week * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
    const firstY = hackSequence[0].day * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
    
    let path = `M ${startX} ${startY} L ${firstX} ${firstY}`;
    
    // Create a path through all the hack sequence points
    for (let i = 1; i < hackSequence.length; i++) {
        const x = hackSequence[i].week * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
        const y = hackSequence[i].day * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
        
        // Add some curve for more interesting movement
        const prevX = hackSequence[i-1].week * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
        const prevY = hackSequence[i-1].day * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
        
        // Use smooth curves between distant points, straight lines for adjacent ones
        const distance = Math.abs(x - prevX) + Math.abs(y - prevY);
        
        if (distance > (CELL_SIZE + CELL_GAP) * 2) {
            // Add a curve for longer distances
            const controlX = (prevX + x) / 2;
            const controlY = (prevY + y) / 2 + (Math.random() - 0.5) * 15;
            path += ` Q ${controlX} ${controlY} ${x} ${y}`;
        } else {
            // Straight line for adjacent cells
            path += ` L ${x} ${y}`;
        }
    }
    
    // End by moving off-screen right
    const lastX = hackSequence[hackSequence.length - 1].week * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
    const lastY = hackSequence[hackSequence.length - 1].day * (CELL_SIZE + CELL_GAP) + CELL_SIZE/2;
    const endX = (GRID_WIDTH * (CELL_SIZE + CELL_GAP)) + 20;
    path += ` L ${endX} ${lastY}`;
    
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
