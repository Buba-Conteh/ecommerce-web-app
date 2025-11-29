const https = require('https');

function getSecretMessage(url) {
  https.get(url, (res) => {
    let data = '';

    // A chunk of data has been received.
    res.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received.
    res.on('end', () => {
      parseAndPrint(data);
    });

  }).on('error', (err) => {
    console.log("Error: " + err.message);
  });
}

function parseAndPrint(html) {
  // 1. Simple Parser logic using Regex (since we can't use Cheerio)
  // Find the table content
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    console.log("No table found.");
    return;
  }

  // Extract rows
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = [...tableMatch[1].matchAll(rowRegex)].map(m => m[1]);

  if (rows.length === 0) return;

  // Helper to clean cell content (remove tags like <span> and <p>)
  const cleanText = (str) => str.replace(/<[^>]+>/g, '').trim();

  // 2. Parse Headers to find indices
  // Get cells from the first row
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const headerCells = [...rows[0].matchAll(cellRegex)].map(m => cleanText(m[1]).toLowerCase());

  const xIdx = headerCells.findIndex(h => h.includes('x-coordinate'));
  const yIdx = headerCells.findIndex(h => h.includes('y-coordinate'));
  const charIdx = headerCells.findIndex(h => h.includes('character'));

  if (xIdx === -1 || yIdx === -1 || charIdx === -1) {
    console.log("Could not find necessary headers.");
    return;
  }

  // 3. Parse Data
  const coordinates = [];
  let maxX = 0;
  let maxY = 0;

  // Skip header row (i=0) start at i=1
  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i].matchAll(cellRegex)].map(m => cleanText(m[1]));
    
    if (cells.length > Math.max(xIdx, yIdx, charIdx)) {
      const x = parseInt(cells[xIdx], 10);
      const y = parseInt(cells[yIdx], 10);
      const char = cells[charIdx];

      if (!isNaN(x) && !isNaN(y)) {
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        coordinates.push({ x, y, char });
      }
    }
  }

  // 4. Print Grid
  // Create grid (maxY + 1 rows, maxX + 1 cols)
  const grid = Array.from({ length: maxY + 1 }, () => Array(maxX + 1).fill(' '));

  coordinates.forEach(({ x, y, char }) => {
    grid[y][x] = char;
  });

  // Print from top (maxY) to bottom (0) to handle Cartesian coordinates
  for (let y = maxY; y >= 0; y--) {
    console.log(grid[y].join(''));
  }
}

// Run it
const url = 'https://docs.google.com/document/d/e/2PACX-1vTMOmshQe8YvaRXi6gEPKKlsC6UpFJSMAk4mQjLm_u1gmHdVVTaeh7nBNFBRlui0sTZ-snGwZM4DBCT/pub';
getSecretMessage(url);