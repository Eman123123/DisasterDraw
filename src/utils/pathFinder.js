class PathNode {
  constructor(x, z, wallId = null, isDoor = false, isWindow = false) {
    this.x = x;
    this.z = z;
    this.wallId = wallId;
    this.isDoor = isDoor;
    this.isWindow = isWindow; // Add window support
    this.g = 0;
    this.h = 0;
    this.f = 0;
    this.parent = null;
    this.neighbors = [];
    this.isExit = false;
    this.doorId = null;
    this.windowId = null; // Add window ID
  }
}

export class PathFinder {
  constructor(walls, furniture, doors, windows = []) { // Add windows parameter
    this.walls = walls || [];
    this.furniture = furniture || [];
    this.doors = doors || [];
    this.windows = windows || []; // Store windows
    this.nodes = [];
    this.startPoint = { x: 0, z: 0 };
    this.graphBuilt = false;
    this.roomBounds = null;
    this.wallSegments = [];
    this.obstacleZones = [];
    this.lastHash = '';
    
    this.SCALE = 0.03;
    this.OFFSET = 500;
    
    this.processObstacles();
  }

  getMarginForFurniture(type) {
    const margins = {
      'bed': 0.4, 'sofa': 0.3, 'table': 0.5, 'chair': 0.25,
      'cabinet': 0.2, 'desk': 0.4, 'shelf': 0.25, 'default': 0.25
    };
    return margins[type] || margins.default;
  }

  generateHash() {
    const furnitureStr = this.furniture.map(f => 
      `${f.id}-${f.position?.x?.toFixed(2)}-${f.position?.z?.toFixed(2)}-${f.size?.width}-${f.size?.depth}-${f.isObstacle}`
    ).join('|');
    
    const wallsStr = this.walls.map(w => 
      `${w.id}-${w.points[0].x}-${w.points[0].y}-${w.points[1].x}-${w.points[1].y}`
    ).join('|');
    
    const doorsStr = this.doors.map(d => `${d.id}-${d.isExterior}`).join('|');
    const windowsStr = this.windows.map(w => `${w.id}-${w.isExterior}`).join('|'); // Add windows to hash
    return furnitureStr + wallsStr + doorsStr + windowsStr;
  }

  setStartPoint(x, z) {
    this.startPoint = { x, z };
  }

  processObstacles() {
    this.obstacleZones = [];
    
    this.furniture.forEach(item => {
      if (!item.position || !item.size) return;
      
      const isWallMounted = item.isWallMounted === true;
      const isDoor = item.type === 'door' || item.type === 'window';
      const isObstacle = item.isObstacle === true;
      
      if (isWallMounted || isDoor || !isObstacle) return;
      
      const margin = this.getMarginForFurniture(item.type);
      const halfWidth = item.size.width / 2;
      const halfDepth = item.size.depth / 2;
      
      this.obstacleZones.push({
        x: item.position.x,
        z: item.position.z,
        minX: item.position.x - halfWidth - margin,
        maxX: item.position.x + halfWidth + margin,
        minZ: item.position.z - halfDepth - margin,
        maxZ: item.position.z + halfDepth + margin,
        width: item.size.width,
        depth: item.size.depth,
        type: item.type,
        margin: margin
      });
    });
  }

  isPointObstructed(x, z, checkBuffer = true) {
    const buffer = checkBuffer ? 0.15 : 0;
    for (const obs of this.obstacleZones) {
      if (x >= obs.minX - buffer && x <= obs.maxX + buffer && 
          z >= obs.minZ - buffer && z <= obs.maxZ + buffer) {
        return true;
      }
    }
    return false;
  }

  isLineObstructed(x1, z1, x2, z2) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
    const numSamples = Math.max(30, Math.floor(distance * 30));
    
    for (let i = 1; i < numSamples; i++) {
      const t = i / numSamples;
      const sampleX = x1 + (x2 - x1) * t;
      const sampleZ = z1 + (z2 - z1) * t;
      
      if (this.isPointObstructed(sampleX, sampleZ, true)) return true;
      
      const offsets = [0.1, 0.2];
      for (const offset of offsets) {
        if (this.isPointObstructed(sampleX + offset, sampleZ, true) ||
            this.isPointObstructed(sampleX - offset, sampleZ, true) ||
            this.isPointObstructed(sampleX, sampleZ + offset, true) ||
            this.isPointObstructed(sampleX, sampleZ - offset, true)) {
          return true;
        }
      }
    }
    return false;
  }

  calculateRoomBounds() {
    if (this.walls.length === 0) {
      this.roomBounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
      return this.roomBounds;
    }
    
    let minX2D = Infinity, maxX2D = -Infinity, minY2D = Infinity, maxY2D = -Infinity;
    
    this.walls.forEach(wall => {
      wall.points.forEach(p => {
        minX2D = Math.min(minX2D, p.x);
        maxX2D = Math.max(maxX2D, p.x);
        minY2D = Math.min(minY2D, p.y);
        maxY2D = Math.max(maxY2D, p.y);
      });
    });
    
    const minX = (minX2D - this.OFFSET) * this.SCALE;
    const maxX = (maxX2D - this.OFFSET) * this.SCALE;
    const minZ = (minY2D - this.OFFSET) * this.SCALE;
    const maxZ = (maxY2D - this.OFFSET) * this.SCALE;
    
    const padding = 0.4;
    this.roomBounds = { minX: minX + padding, maxX: maxX - padding, minZ: minZ + padding, maxZ: maxZ - padding };
    
    // Store wall segments WITH IDs for smarter collision
    this.wallSegments = this.walls.map(wall => ({
      id: wall.id,
      p1: { x: (wall.points[0].x - this.OFFSET) * this.SCALE, z: (wall.points[0].y - this.OFFSET) * this.SCALE },
      p2: { x: (wall.points[1].x - this.OFFSET) * this.SCALE, z: (wall.points[1].y - this.OFFSET) * this.SCALE }
    }));
    
    return this.roomBounds;
  }

  isPointWalkable(x, z) {
    if (!this.roomBounds) return true;
    if (x < this.roomBounds.minX || x > this.roomBounds.maxX ||
        z < this.roomBounds.minZ || z > this.roomBounds.maxZ) return false;
    
    for (const wall of this.wallSegments) {
      const distance = this.pointToLineDistance({ x, z }, wall.p1, wall.p2);
      if (distance < 0.25) return false;
    }
    
    if (this.isPointObstructed(x, z, true)) return false;
    return true;
  }

  // =====================================================
  // FIXED: Find ALL exterior exits (doors AND windows)
  // =====================================================
  findExteriorExits() {
    const exits = [];
    
    // Add exterior doors
    this.doors.forEach(door => {
      if (door.type === 'door' && door.isExterior === true) {
        exits.push({
          id: door.id,
          type: 'door',
          position2D: door.position2D,
          wallId: door.wallId
        });
      }
    });
    
    // Add exterior windows
    this.windows.forEach(window => {
      if (window.type === 'window' && window.isExterior === true) {
        exits.push({
          id: window.id,
          type: 'window',
          position2D: window.position2D,
          wallId: window.wallId
        });
      }
    });
    
    console.log(`🚪 Found ${exits.length} exterior exits (${this.doors.filter(d => d.isExterior).length} doors, ${this.windows.filter(w => w.isExterior).length} windows)`);
    return exits;
  }

  buildNavigationGraph() {
    const currentHash = this.generateHash();
    if (this.graphBuilt && currentHash === this.lastHash) return this.nodes;
    
    this.nodes = [];
    this.calculateRoomBounds();
    this.addExitNodes(); // Unified method for doors AND windows
    this.addWalkableGridNodes();
    this.connectWalkableNodes();
    
    this.graphBuilt = true;
    this.lastHash = currentHash;
    return this.nodes;
  }

  // =====================================================
  // NEW: Unified method for adding exit nodes (doors AND windows)
  // =====================================================
  addExitNodes() {
    // Add door nodes
    this.doors.forEach(door => {
      if (!door.position2D || !door.wallId) return;
      this.addOpeningNode(door, 'door');
    });
    
    // Add window nodes
    this.windows.forEach(window => {
      if (!window.position2D || !window.wallId) return;
      this.addOpeningNode(window, 'window');
    });
  }

  // Helper method to add opening nodes
  addOpeningNode(opening, type) {
    const openingX = (opening.position2D.x - this.OFFSET) * this.SCALE;
    const openingZ = (opening.position2D.y - this.OFFSET) * this.SCALE;

    const wallData = this.walls.find(w => w.id === opening.wallId);
    if (!wallData) return;

    const p1 = { 
      x: (wallData.points[0].x - this.OFFSET) * this.SCALE, 
      z: (wallData.points[0].y - this.OFFSET) * this.SCALE 
    };
    const p2 = { 
      x: (wallData.points[1].x - this.OFFSET) * this.SCALE, 
      z: (wallData.points[1].y - this.OFFSET) * this.SCALE 
    };

    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len === 0) return;

    // Perpendicular vector (normal)
    const nx = -dz / len;
    const nz = dx / len;

    // Place nodes on both sides
    const offsets = [0.8, -0.8];

    offsets.forEach(offset => {
      const testX = openingX + nx * offset;
      const testZ = openingZ + nz * offset;

      if (this.isPointWalkable(testX, testZ)) {
        const node = new PathNode(testX, testZ, opening.wallId, type === 'door', type === 'window');
        node.isExit = opening.isExterior || false;
        if (type === 'door') {
          node.doorId = opening.id;
        } else {
          node.windowId = opening.id;
        }
        this.nodes.push(node);
      }
    });
  }

  addWalkableGridNodes() {
    if (!this.roomBounds) return;
    const { minX, maxX, minZ, maxZ } = this.roomBounds;
    const step = 0.4;
    
    for (let x = minX; x <= maxX; x += step) {
      for (let z = minZ; z <= maxZ; z += step) {
        if (this.isPointWalkable(x, z)) {
          const exists = this.nodes.some(n => Math.abs(n.x - x) < step/2 && Math.abs(n.z - z) < step/2);
          if (!exists) this.nodes.push(new PathNode(x, z));
        }
      }
    }
    this.addExtraNodesAroundObstacles(step);
  }
  
  addExtraNodesAroundObstacles(step) {
    for (const obs of this.obstacleZones) {
      const corners = [
        { x: obs.minX - step, z: obs.minZ - step }, { x: obs.maxX + step, z: obs.minZ - step },
        { x: obs.minX - step, z: obs.maxZ + step }, { x: obs.maxX + step, z: obs.maxZ + step }
      ];
      
      for (const corner of corners) {
        if (this.isPointWalkable(corner.x, corner.z)) {
          const exists = this.nodes.some(n => Math.abs(n.x - corner.x) < step/2 && Math.abs(n.z - corner.z) < step/2);
          if (!exists) this.nodes.push(new PathNode(corner.x, corner.z));
        }
      }
    }
  }

  connectWalkableNodes() {
    const cellSize = 2.5;
    const grid = new Map();
    
    this.nodes.forEach((node, index) => {
      const cellX = Math.floor(node.x / cellSize);
      const cellZ = Math.floor(node.z / cellSize);
      const key = `${cellX},${cellZ}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push({ node, index });
    });
    
    for (let i = 0; i < this.nodes.length; i++) {
      const node1 = this.nodes[i];
      const cellX = Math.floor(node1.x / cellSize);
      const cellZ = Math.floor(node1.z / cellSize);
      
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const neighborKey = `${cellX + dx},${cellZ + dz}`;
          const cellNodes = grid.get(neighborKey);
          if (!cellNodes) continue;
          
          cellNodes.forEach(({ node: node2, index: j }) => {
            if (j <= i) return;
            const distance = Math.sqrt(Math.pow(node2.x - node1.x, 2) + Math.pow(node2.z - node1.z, 2));
            
            // Connect close nodes (increased range slightly for door/window nodes)
            if (distance < 1.5 && distance > 0.2) {
              
              // SPECIAL CASE: Directly connect opening pairs (pass through wall)
              if ((node1.doorId && node1.doorId === node2.doorId) ||
                  (node1.windowId && node1.windowId === node2.windowId)) {
                node1.neighbors.push({ node: node2, cost: distance });
                node2.neighbors.push({ node: node1, cost: distance });
                return; 
              }

              // STANDARD CASE: Check for wall collisions
              let wallBlocked = false;
              for (const wall of this.wallSegments) {
                // If either node belongs to this wall's opening, skip collision check
                const isOpeningOnThisWall = (node1.wallId === wall.id && (node1.isDoor || node1.isWindow)) || 
                                           (node2.wallId === wall.id && (node2.isDoor || node2.isWindow));
                
                if (isOpeningOnThisWall) {
                  continue; // Skip checking this wall segment
                }

                if (this.linesIntersect({ x: node1.x, y: node1.z }, { x: node2.x, y: node2.z }, { x: wall.p1.x, y: wall.p1.z }, { x: wall.p2.x, y: wall.p2.z })) {
                  wallBlocked = true; break;
                }
              }
              if (wallBlocked) return;

              // Obstacle check (furniture)
              if (!this.isLineObstructed(node1.x, node1.z, node2.x, node2.z)) {
                node1.neighbors.push({ node: node2, cost: distance });
                node2.neighbors.push({ node: node1, cost: distance });
              }
            }
          });
        }
      }
    }
  }

  pointToLineDistance(point, p1, p2) {
    const A = point.x - p1.x; const B = point.z - p1.z;
    const C = p2.x - p1.x; const D = p2.z - p1.z;
    const dot = A * C + B * D; const lenSq = C * C + D * D;
    let param = -1; if (lenSq !== 0) param = dot / lenSq;
    let xx, zz;
    if (param < 0) { xx = p1.x; zz = p1.z; }
    else if (param > 1) { xx = p2.x; zz = p2.z; }
    else { xx = p1.x + param * C; zz = p1.z + param * D; }
    return Math.sqrt(Math.pow(point.x - xx, 2) + Math.pow(point.z - zz, 2));
  }

  linesIntersect(p1, p2, p3, p4) {
    const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
  }

  findNearestNode(x, z) {
    let nearest = null; let minDist = Infinity;
    for (const node of this.nodes) {
      const dist = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.z - z, 2));
      if (dist < minDist) { minDist = dist; nearest = node; }
    }
    return nearest;
  }

  heuristic(node, goal) {
    return Math.sqrt(Math.pow(node.x - goal.x, 2) + Math.pow(node.z - goal.z, 2));
  }

  reconstructPath(goalNode, cameFrom) {
    const path = []; let current = goalNode;
    while (current) { 
      path.unshift({ x: current.x, z: current.z }); 
      current = cameFrom.get(current); 
    }
    return path;
  }

  smoothPath(path) {
    if (path.length <= 2) return path;
    const smoothed = [path[0]];
    for (let i = 1; i < path.length - 1; i++) {
      const prev = smoothed[smoothed.length - 1]; const current = path[i]; const next = path[i + 1];
      const dx1 = current.x - prev.x; const dz1 = current.z - prev.z;
      const dx2 = next.x - current.x; const dz2 = next.z - current.z;
      const len1 = Math.sqrt(dx1*dx1 + dz1*dz1); const len2 = Math.sqrt(dx2*dx2 + dz2*dz2);
      if (len1 > 0 && len2 > 0) {
        const cos = (dx1 * dx2 + dz1 * dz2) / (len1 * len2);
        if (Math.abs(cos) > 0.98) continue;
      }
      smoothed.push(current);
    }
    smoothed.push(path[path.length - 1]);
    return smoothed;
  }

  findPath(startX, startZ, goalX, goalZ) {
    this.buildNavigationGraph();
    
    if (this.nodes.length === 0) return null;

    const startNode = this.findNearestNode(startX, startZ);
    const goalNode = this.findNearestNode(goalX, goalZ);
    
    if (!startNode || !goalNode) return null;

    const startDist = Math.sqrt(Math.pow(startNode.x - startX, 2) + Math.pow(startNode.z - startZ, 2));
    const goalDist = Math.sqrt(Math.pow(goalNode.x - goalX, 2) + Math.pow(goalNode.z - goalZ, 2));
    
    if (startDist > 1.0 || goalDist > 1.0) return null;
    
    const openSet = [startNode];
    const closedSet = new Set();
    const cameFrom = new Map();
    
    for (const node of this.nodes) { node.g = Infinity; node.f = Infinity; }
    startNode.g = 0; startNode.f = this.heuristic(startNode, goalNode);
    
    let iterations = 0; const maxIterations = 8000;

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      let current = openSet[0];
      for (let i = 1; i < openSet.length; i++) { if (openSet[i].f < current.f) current = openSet[i]; }
      
      const distToGoal = Math.sqrt(Math.pow(current.x - goalX, 2) + Math.pow(current.z - goalZ, 2));
      if (current === goalNode || distToGoal < 0.8) return this.smoothPath(this.reconstructPath(current, cameFrom));
      
      openSet.splice(openSet.indexOf(current), 1); closedSet.add(current);
      
      for (const neighbor of current.neighbors) {
        if (closedSet.has(neighbor.node)) continue;
        const tentativeG = current.g + neighbor.cost;
        if (!openSet.includes(neighbor.node)) openSet.push(neighbor.node);
        else if (tentativeG >= neighbor.node.g) continue;
        cameFrom.set(neighbor.node, current);
        neighbor.node.g = tentativeG;
        neighbor.node.f = neighbor.node.g + this.heuristic(neighbor.node, goalNode);
      }
    }
    return null;
  }

  // =====================================================
  // FIXED: Find shortest path to ANY exterior exit
  // =====================================================
  findPathToNearestExit(startX, startZ) {
    const exits = this.findExteriorExits();
    if (exits.length === 0) {
      console.warn('❌ No exterior exits found');
      return null;
    }
    
    let bestPath = null;
    let bestDistance = Infinity;
    let bestExit = null;
    
    console.log(`🔍 Searching for shortest path to ${exits.length} exterior exits...`);
    
    for (const exit of exits) {
      if (exit.position2D) {
        const goalX = (exit.position2D.x - this.OFFSET) * this.SCALE;
        const goalZ = (exit.position2D.y - this.OFFSET) * this.SCALE;
        
        const path = this.findPath(startX, startZ, goalX, goalZ);
        
        if (path && path.length >= 2) {
          const distance = this.calculatePathDistance(path);
          console.log(`  Found ${exit.type} at distance: ${distance.toFixed(2)}m`);
          
          if (distance < bestDistance) {
            bestDistance = distance;
            bestPath = path;
            bestExit = exit;
          }
        }
      }
    }
    
    if (bestPath) {
      console.log(`✅ Shortest path: ${bestExit.type} at ${bestDistance.toFixed(2)}m`);
      // Add exit info to path for visualization
      bestPath.exitType = bestExit.type;
      bestPath.exitId = bestExit.id;
      bestPath.distance = bestDistance;
    } else {
      console.log('❌ No path found to any exterior exit');
    }
    
    return bestPath;
  }
    // Add this method inside the PathFinder class
  isValidStartPosition(x, z) {
    // 1. Ensure bounds are calculated
    if (!this.roomBounds || this.wallSegments.length === 0) {
      this.calculateRoomBounds();
    }
    
    // 2. Check if inside room bounds
    if (x < this.roomBounds.minX || x > this.roomBounds.maxX ||
        z < this.roomBounds.minZ || z > this.roomBounds.maxZ) {
      return false;
    }
    
    // 3. Check distance from walls (must be > 0.3m away for safety)
    for (const wall of this.wallSegments) {
      const distance = this.pointToLineDistance({ x, z }, wall.p1, wall.p2);
      if (distance < 0.3) return false;
    }
    
    // 4. Check obstacles (furniture)
    if (this.isPointObstructed(x, z, true)) {
      return false;
    }
    
    return true;
  } 

  
  // =====================================================
  // FIXED: Find path to specific exit by ID
  // =====================================================
  findPathToSpecificExit(startX, startZ, exitId) {
    // Check doors
    const door = this.doors.find(d => d.id === exitId && d.isExterior);
    if (door && door.position2D) {
      const goalX = (door.position2D.x - this.OFFSET) * this.SCALE;
      const goalZ = (door.position2D.y - this.OFFSET) * this.SCALE;
      return this.findPath(startX, startZ, goalX, goalZ);
    }
    
    // Check windows
    const window = this.windows.find(w => w.id === exitId && w.isExterior);
    if (window && window.position2D) {
      const goalX = (window.position2D.x - this.OFFSET) * this.SCALE;
      const goalZ = (window.position2D.y - this.OFFSET) * this.SCALE;
      return this.findPath(startX, startZ, goalX, goalZ);
    }
    
    return null;
  }

  calculatePathDistance(path) {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      distance += Math.sqrt(
        Math.pow(path[i].x - path[i-1].x, 2) + 
        Math.pow(path[i].z - path[i-1].z, 2)
      );
    }
    return distance;
  }

  getObstacleDebugInfo() {
    return this.obstacleZones.map(obs => ({ 
      type: obs.type, 
      center: [obs.x.toFixed(2), obs.z.toFixed(2)] 
    }));
  }

  invalidateGraph() {
    this.graphBuilt = false;
    this.lastHash = '';
  }
}

export default PathFinder;