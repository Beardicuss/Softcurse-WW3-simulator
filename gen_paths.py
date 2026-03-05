import json, math, sys

# Load GeoJSON
with open('/mnt/user-data/uploads/1772704952238_world.svg') as f:
    geojson = json.load(f)

# Equirectangular projection matching the original build-svg.js
# scale=25, translate=[70,50]
SCALE = 25
TX = 70
TY = 50

def project(lon, lat):
    x = lon * (SCALE / 180) * math.pi + TX   # equirectangular: x = lon * scale_factor + tx
    y = -lat * (SCALE / 180) * math.pi + TY  # y flipped
    # Actually match d3.geoEquirectangular().scale(25).translate([70,50])
    # d3: x = scale * lambda + tx,  y = -scale * phi + ty  (in radians: lambda=lon*pi/180)
    lon_r = lon * math.pi / 180
    lat_r = lat * math.pi / 180
    x = SCALE * lon_r + TX
    y = -SCALE * lat_r + TY
    return x, y

def coords_to_path(rings):
    d = ''
    for ring in rings:
        if not ring:
            continue
        for i, (lon, lat) in enumerate(ring):
            x, y = project(lon, lat)
            if i == 0:
                d += f'M{x:.3f},{y:.3f}'
            else:
                d += f'L{x:.3f},{y:.3f}'
        d += 'Z'
    return d

def feature_to_path(feature):
    geom = feature['geometry']
    if geom['type'] == 'Polygon':
        return coords_to_path(geom['coordinates'])
    elif geom['type'] == 'MultiPolygon':
        d = ''
        for poly in geom['coordinates']:
            d += coords_to_path(poly)
        return d
    return ''

# Map game regions to ISO country codes
REGION_TO_ISO = {
    'alaska':    ['USA'],  # handled specially - alaska portion
    'canada':    ['CAN', 'GRL'],
    'usa':       ['USA'],
    'mexico':    ['MEX', 'GTM', 'BLZ', 'HND', 'SLV', 'NIC', 'CRI', 'PAN'],
    'caribb':    ['CUB', 'DOM', 'HTI', 'JAM', 'PRI', 'TTO', 'BHS'],
    'colombia':  ['COL', 'VEN', 'GUY', 'SUR', 'GUF', 'ECU', 'PER', 'BOL'],
    'brazil':    ['BRA'],
    'argentina': ['ARG', 'CHL', 'PRY', 'URY'],
    'greenland': ['GRL'],
    'uk':        ['GBR', 'IRL', 'ISL'],
    'france':    ['FRA', 'BEL', 'NLD', 'LUX', 'CHE', 'AUT'],
    'germany':   ['DEU', 'CZE', 'SVK', 'HUN'],
    'poland':    ['POL', 'LTU', 'LVA', 'EST', 'BLR'],
    'ukraine':   ['UKR', 'MDA'],
    'spain':     ['ESP', 'PRT'],
    'italy':     ['ITA', 'SVN', 'HRV', 'MLT'],
    'balkans':   ['SRB', 'BIH', 'MNE', 'ALB', 'MKD', 'GRC', 'BGR', 'ROU', 'CYP', 'CS-KM'],
    'scandinavia':['NOR', 'SWE', 'FIN', 'DNK'],
    'russia_w':  ['RUS'],  # approximated as full RUS
    'russia_e':  ['RUS'],
    'russia_s':  ['ARM', 'AZE', 'GEO'],
    'kazakhstan':['KAZ', 'UZB', 'TKM', 'KGZ', 'TJK'],
    'siberia':   ['RUS'],
    'turkey':    ['TUR'],
    'iran':      ['IRN'],
    'iraq_syria':['IRQ', 'SYR', 'LBN', 'JOR'],
    'arabia':    ['SAU', 'YEM', 'OMN', 'ARE', 'KWT', 'QAT', 'BHR'],
    'israel':    ['ISR', 'PSE'],
    'n_africa':  ['MAR', 'DZA', 'LBY', 'TUN', 'EGY', 'ESH'],
    'w_africa':  ['MRT', 'SEN', 'GMB', 'GNB', 'GIN', 'SLE', 'LBR', 'CIV', 'GHA', 'TGO', 'BEN', 'NGA', 'NER', 'MLI', 'BFA', 'CMR', 'GNQ', 'GAB', 'COG'],
    'e_africa':  ['ETH', 'ERI', 'DJI', 'SOM', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SDN', 'SSD', 'TCD'],
    'congo':     ['COD', 'CAF', 'MOZ', 'MWI', 'ZMB', 'ZWE', 'AGO'],
    's_africa':  ['ZAF', 'NAM', 'BWA', 'LSO', 'SWZ', 'MDG'],
    'india':     ['IND', 'LKA', 'BGD', 'NPL', 'BTN'],
    'pakistan':  ['PAK', 'AFG'],
    'se_asia':   ['MMR', 'THA', 'LAO', 'KHM', 'VNM', 'MYS', 'SGP', 'PHL', 'BRN', 'TLS', 'PNG'],
    'indonesia': ['IDN'],
    'china_n':   ['CHN', 'MNG', 'PRK'],
    'china_s':   ['CHN'],
    'mongolia':  ['MNG'],
    'korea':     ['KOR', 'PRK'],
    'japan':     ['JPN'],
    'taiwan':    ['TWN'],
    'australia': ['AUS'],
    'nz':        ['NZL', 'FJI', 'VUT', 'SLB', 'NCL'],
    'pacific_i': ['FJI', 'VUT', 'SLB', 'NCL'],
}

# Faction starting regions from mapData
FACTION_STARTS = {
    'NATO':  ['usa','canada','uk','france','germany','poland','spain','italy','scandinavia','greenland','australia','brazil'],
    'EAST':  ['russia_w','russia_e','russia_s','siberia','ukraine','kazakhstan','iran','iraq_syria','arabia'],
    'CHINA': ['china_n','china_s','mongolia','korea','taiwan','se_asia','indonesia','japan','pacific_i'],
}

def get_faction(region_id):
    for faction, regions in FACTION_STARTS.items():
        if region_id in regions:
            return faction
    return 'NEUTRAL'

FACTION_COLORS = {
    'NATO':    '#1a4a7a',
    'EAST':    '#6b1515',
    'CHINA':   '#7a6500',
    'NEUTRAL': '#1a2a1a',
}

FACTION_COLORS_STROKE = {
    'NATO':    '#3a9eff',
    'EAST':    '#ff3333',
    'CHINA':   '#ffcc00',
    'NEUTRAL': '#2a3d50',
}

# Build ISO -> path dict
iso_to_path = {}
for feature in geojson['features']:
    fid = feature.get('id', '')
    if fid == 'ATA':
        continue
    path = feature_to_path(feature)
    if path:
        iso_to_path[fid] = path

# Build region entries
region_entries = []
# Track which ISOs have been assigned (to avoid double-painting)
# Priority: more specific game regions take precedence
for region_id, isos in REGION_TO_ISO.items():
    faction = get_faction(region_id)
    fill = FACTION_COLORS[faction]
    stroke = FACTION_COLORS_STROKE[faction]
    paths = []
    for iso in isos:
        if iso in iso_to_path:
            paths.append(iso_to_path[iso])
    combined = ' '.join(paths)
    if combined.strip():
        region_entries.append({
            'id': region_id,
            'faction': faction,
            'fill': fill,
            'stroke': stroke,
            'path': combined,
        })

# Also add remaining unassigned countries as neutral
assigned_isos = set()
for isos in REGION_TO_ISO.values():
    assigned_isos.update(isos)

neutral_paths = []
for iso, path in iso_to_path.items():
    if iso not in assigned_isos:
        neutral_paths.append(path)

neutral_combined = ' '.join(neutral_paths)

# Write JS output
out = '// Auto-generated by gen_paths.py — DO NOT EDIT\n'
out += '// Per-country SVG paths grouped by game region with faction colors\n\n'
out += 'export const REGION_PATHS = [\n'
for entry in region_entries:
    path_escaped = entry['path'].replace('\\', '\\\\').replace('"', '\\"').replace('\n', '')
    out += f'  {{\n'
    out += f'    id: "{entry["id"]}",\n'
    out += f'    faction: "{entry["faction"]}",\n'
    out += f'    fill: "{entry["fill"]}",\n'
    out += f'    stroke: "{entry["stroke"]}",\n'
    out += f'    path: "{path_escaped}",\n'
    out += f'  }},\n'
out += '];\n\n'

neutral_escaped = neutral_combined.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '')
out += f'export const NEUTRAL_PATHS = "{neutral_escaped}";\n'

with open('/home/claude/worldRegionPaths.js', 'w') as f:
    f.write(out)

print(f'Done! {len(region_entries)} region entries written.')
print(f'Neutral countries: {len(neutral_paths)}')
print(f'Total file size: {len(out):,} bytes')
