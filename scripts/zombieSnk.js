import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - using same values as Platane/snk for consistency
const GRID_WIDTH = 53;
const GRID_HEIGHT = 7;
const CELL_SIZE = 12;
const DOT_SIZE = 10;
const ANIMATION_DURATION = 16000; // 16 seconds like original snk

// Zombie-themed colors based on GitHub's dark theme
const ZOMBIE_THEME = {
    bg: '#0d1117',
    gridBg: '#161b22',
    border: '#30363d',
    empty: '#161b22',
    levels: {
        1: '#0e4429',
        2: '#006d32', 
        3: '#26a641',
        4: '#39d353'
    },
    zombie: '#ffa657',
    infected: '#f85149'
};

// Create zombie contribution animation using Platane/snk principles
async function createZombieContributionSVG(contributionData, theme = ZOMBIE_THEME) {
    const width = (GRID_WIDTH + 2) * CELL_SIZE;
    const height = (GRID_HEIGHT + 5) * CELL_SIZE;
    
    // Generate zombie path using simplified version of Platane's solver
    const zombiePath = generateZombiePath(contributionData);
    
    // Create living cells exactly like Platane/snk - cells that get infected when zombie visits
    const livingCells = createLivingCells(contributionData, zombiePath);
    const infectedCells = livingCells.filter(cell => cell.t !== null);
    
    console.log(`Generated ${zombiePath.length} zombie path steps`);
    console.log(`Found ${infectedCells.length} cells that will be infected`);
    
    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      /* CSS Variables for colors like Platane/snk */
      :root {
        --cb: ${theme.border};
        --ce: ${theme.empty};
        --c1: ${theme.levels[1]};
        --c2: ${theme.levels[2]};
        --c3: ${theme.levels[3]};
        --c4: ${theme.levels[4]};
        --infected: ${theme.infected};
      }
      
      .bg { fill: ${theme.bg}; }
      .grid-bg { fill: ${theme.gridBg}; }
      .border { stroke: ${theme.border}; stroke-width: 1; fill: none; }
      
      /* Grid cells - exact same approach as Platane/snk */
      .c {
        shape-rendering: geometricPrecision;
        fill: var(--ce);
        stroke-width: 1px;
        stroke: var(--cb);
        animation: none ${ANIMATION_DURATION}ms linear infinite;
        width: ${DOT_SIZE}px;
        height: ${DOT_SIZE}px;
      }
      
      /* Zombie character */
      .zombie {
        font-size: ${CELL_SIZE}px;
        text-anchor: middle;
        dominant-baseline: middle;
        animation: zombieMove ${ANIMATION_DURATION}ms linear infinite;
      }
      
      /* Infection effects */
      .infection {
        fill: var(--infected);
        opacity: 0;
      }
      
      .skull {
        opacity: 0;
      }
      
      ${generateLivingCellAnimations(livingCells)}
      
      @keyframes zombieMove {
        ${generateZombieKeyframes(zombiePath)}
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect class="bg" width="${width}" height="${height}"/>
  
  <!-- Grid container -->
  <g transform="translate(${CELL_SIZE}, ${CELL_SIZE * 2})">`;
  
    // Generate grid cells using living cells like Platane/snk
    let cellIndex = 0;
    livingCells.forEach((cell) => {
        const x = cell.x * CELL_SIZE + (CELL_SIZE - DOT_SIZE) / 2;
        const y = cell.y * CELL_SIZE + (CELL_SIZE - DOT_SIZE) / 2;
        
        const hasInfection = cell.t !== null;
        const cellId = hasInfection ? `c${cellIndex++}` : '';
        
        // Set initial fill style based on contribution level, like Platane/snk
        let fillStyle = 'fill: var(--ce)'; // Default empty
        if (cell.level > 0) {
            fillStyle = `fill: var(--c${cell.level})`;
        }
        
        if (hasInfection) {
            console.log(`Cell with infection: (${cell.x}, ${cell.y}), level=${cell.level}, time=${cell.t}`);
        }
        
        svg += `
    <rect class="c ${cellId}" 
          x="${x}" 
          y="${y}" 
          width="${DOT_SIZE}" 
          height="${DOT_SIZE}" 
          rx="2" 
          ry="2"
          style="${fillStyle}"/>`;
          
        // Add infection circle
        if (hasInfection) {
            const centerX = cell.x * CELL_SIZE + CELL_SIZE / 2;
            const centerY = cell.y * CELL_SIZE + CELL_SIZE / 2;
            
            svg += `
    <circle class="infection inf${cellIndex - 1}"
            cx="${centerX}"
            cy="${centerY}"
            r="4"/>`;
            
            // Add skull emoji that appears after infection
            svg += `
    <text class="skull skull${cellIndex - 1}"
          x="${centerX}"
          y="${centerY + 1}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="8"
          opacity="0">💀</text>`;
        }
    });
    
    // Add zombie character
    const startX = zombiePath[0] ? zombiePath[0].x * CELL_SIZE + CELL_SIZE / 2 : CELL_SIZE / 2;
    const startY = zombiePath[0] ? zombiePath[0].y * CELL_SIZE + CELL_SIZE / 2 : CELL_SIZE / 2;
    
    svg += `
    <!-- Zombie -->
    <text class="zombie" x="${startX}" y="${startY}">🧟‍♂️</text>
  </g>
  
  <!-- Title -->
  <text x="${width / 2}" y="20" text-anchor="middle" fill="white" font-family="monospace" font-size="14">
    🧟‍♂️ Zombie GitHub Infiltration
  </text>
  
</svg>`;
    
    return svg;
}

// Create living cells exactly like Platane/snk - tracks when zombie visits each cell
function createLivingCells(contributionData, zombiePath) {
    const livingCells = contributionData.map(cell => ({
        x: cell.week,
        y: cell.day,
        t: null, // Will be set when zombie visits this cell
        color: cell.level,
        level: cell.level
    }));
    
    // Track when zombie visits each cell (like snake eating)
    for (let i = 0; i < zombiePath.length; i++) {
        const zombieX = zombiePath[i].x;
        const zombieY = zombiePath[i].y;
        
        // Find the cell at this position
        const cell = livingCells.find(c => c.x === zombieX && c.y === zombieY);
        if (cell && cell.level > 0 && cell.t === null) {
            // Zombie visits this cell - mark the time
            cell.t = i / zombiePath.length;
            console.log(`Zombie visits cell (${zombieX}, ${zombieY}) at time ${cell.t}`);
        }
    }
    
    return livingCells;
}

// Generate zombie path using simplified Platane-style pathfinding
function generateZombiePath(contributionData) {
    const activeCells = contributionData.filter(cell => cell.level > 0);
    
    if (activeCells.length === 0) {
        // Create classic snake pattern like Platane/snk
        const path = [];
        for (let week = 0; week < GRID_WIDTH; week++) {
            if (week % 2 === 0) {
                // Going down
                for (let day = 0; day < GRID_HEIGHT; day++) {
                    path.push({ x: week, y: day });
                }
            } else {
                // Going up  
                for (let day = GRID_HEIGHT - 1; day >= 0; day--) {
                    path.push({ x: week, y: day });
                }
            }
        }
        return path;
    }
    
    // Sort cells by week then day for natural progression
    activeCells.sort((a, b) => {
        if (a.week !== b.week) return a.week - b.week;
        return a.day - b.day;
    });
    
    // Create zigzag path through active cells like original snake
    const path = [];
    const weekGroups = {};
    
    activeCells.forEach(cell => {
        if (!weekGroups[cell.week]) weekGroups[cell.week] = [];
        weekGroups[cell.week].push({ x: cell.week, y: cell.day });
    });
    
    Object.keys(weekGroups).sort((a, b) => a - b).forEach((week, weekIndex) => {
        const weekCells = weekGroups[week];
        
        // Alternate direction each week like snake
        if (weekIndex % 2 === 0) {
            weekCells.sort((a, b) => a.y - b.y);
        } else {
            weekCells.sort((a, b) => b.y - a.y);
        }
        
        path.push(...weekCells);
    });
    
    return path;
}

// Generate animations for living cells exactly like Platane/snk
function generateLivingCellAnimations(livingCells) {
    let animations = '';
    let cellIndex = 0;
    
    livingCells.forEach((cell) => {
        if (cell.t !== null) {
            const startTime = (cell.t * 100).toFixed(2);
            const endTime = Math.min(100, cell.t * 100 + 5).toFixed(2);
            
            // Cell color change animation - turns red when zombie visits
            animations += `
      .c${cellIndex} {
        animation: infected${cellIndex} ${ANIMATION_DURATION}ms linear infinite;
      }
      @keyframes infected${cellIndex} {
        0%, ${startTime}% { fill: var(--c${cell.level}); }
        ${startTime}%, 100% { fill: var(--infected); }
      }`;
      
            // Infection circle animation
            animations += `
      .inf${cellIndex} {
        animation: infection${cellIndex} ${ANIMATION_DURATION}ms linear infinite;
      }
      @keyframes infection${cellIndex} {
        0%, ${startTime}% { opacity: 0; transform: scale(0); }
        ${startTime}% { opacity: 0.9; transform: scale(1.5); }
        ${(cell.t * 100 + 2).toFixed(2)}% { opacity: 0.6; transform: scale(2.5); }
        ${endTime}% { opacity: 0; transform: scale(0); }
        100% { opacity: 0; transform: scale(0); }
      }`;
      
            // Skull animation - appears after infection
            animations += `
      .skull${cellIndex} {
        animation: skull${cellIndex} ${ANIMATION_DURATION}ms linear infinite;
      }
      @keyframes skull${cellIndex} {
        0%, ${endTime}% { opacity: 0; transform: scale(0); }
        ${endTime}%, 100% { opacity: 1; transform: scale(1); }
      }`;
      
            cellIndex++;
        }
    });
    
    return animations;
}

function generateZombieKeyframes(path) {
    if (path.length === 0) return '0% { transform: translate(0, 0); } 100% { transform: translate(0, 0); }';
    
    return path.map((point, index) => {
        const t = (index / (path.length - 1)) * 100;
        const x = point.x * CELL_SIZE;
        const y = point.y * CELL_SIZE;
        return `${t.toFixed(2)}% { transform: translate(${x}px, ${y}px); }`;
    }).join(' ');
}

// Load data and generate zombie SVG
async function generateZombieAnimation() {
    try {
        console.log('🧟‍♂️ Generating zombie GitHub animation using Platane/snk principles...');
        
        // Load contribution data
        const dataPath = path.join(__dirname, '..', 'public', 'data.json');
        let contributionData = [];
        
        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            contributionData = JSON.parse(rawData);
            console.log(`📊 Loaded ${contributionData.length} contribution data points`);
        } else {
            console.log('⚠️ No data.json found, generating sample data...');
            // Generate sample data
            for (let week = 0; week < GRID_WIDTH; week++) {
                for (let day = 0; day < GRID_HEIGHT; day++) {
                    const level = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
                    contributionData.push({ week, day, level, count: level * 2 });
                }
            }
        }
        
        // Create output directory
        const outputDir = path.join(__dirname, '..', 'dist');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Generate zombie SVG using Platane's approach
        const zombieSVG = await createZombieContributionSVG(contributionData);
        fs.writeFileSync(path.join(outputDir, 'zombie-github.svg'), zombieSVG);
        
        console.log('✅ Zombie animation generated successfully!');
        console.log('📁 File created: dist/zombie-github.svg');
        
    } catch (error) {
        console.error('💥 Error generating zombie animation:', error);
        process.exit(1);
    }
}

// Banner
console.log(`
🧟‍♂️ ========================================= 🧟‍♂️
    ZOMBIE GITHUB CONTRIBUTION GENERATOR
      Based on Platane/snk Architecture
🧟‍♂️ ========================================= 🧟‍♂️
`);

generateZombieAnimation();
