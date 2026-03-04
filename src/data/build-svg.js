const fs = require('fs');
const d3 = require('d3-geo');

// Read the previously downloaded world.svg (which is actually GeoJSON)
const data = JSON.parse(fs.readFileSync('world.svg', 'utf8'));

// The user mentioned the map still doesn't look quite right visually.
// Let's adjust the projection to match standard game maps better (Mercator or slightly scaled Equirectangular).
const projection = d3.geoEquirectangular().scale(25).translate([70, 50]);
const pathGenerator = d3.geoPath().projection(projection);

let fullPath = '';
data.features.forEach(feature => {
    if (feature.id !== 'ATA') { // Skip Antarctica for better framing
        const p = pathGenerator(feature);
        if (p) fullPath += p + ' ';
    }
});

// Write with explicit double quotes to avoid template literal syntax errors in JS bundling
fs.writeFileSync('worldSvgStr.js', 'export const WORLD_SVG_PATH = "' + fullPath.trim() + '";\n');
console.log('Saved SVG path to worldSvgStr.js');
