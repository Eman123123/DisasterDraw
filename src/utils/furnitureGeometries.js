import * as THREE from 'three';

// Enhanced furniture creation functions
export const createFurnitureGeometry = (type, dimensions, color) => {
  const { width, depth, height } = dimensions;
  
  switch (type) {
    case 'bed':
      return createBedGeometry(width, depth, height, color);
    case 'sofa':
      return createSofaGeometry(width, depth, height, color);
    case 'chair':
      return createChairGeometry(width, depth, height, color);
    case 'table':
      return createTableGeometry(width, depth, height, color);
    case 'dining':
      return createDiningTableGeometry(width, depth, height, color);
    case 'cabinet':
      return createCabinetGeometry(width, depth, height, color);
    case 'shelf':
      return createShelfGeometry(width, depth, height, color);
    case 'door':
      return createDoorGeometry(width, depth, height, color);
    case 'window':
      return createWindowGeometry(width, depth, height, color);
    default:
      return createDefaultGeometry(width, depth, height, color);
  }
};

// Bed with mattress and detailed parts
function createBedGeometry(width, depth, height, color) {
  const bedGroup = new THREE.Group();
  
  // Bed base
  const bedGeometry = new THREE.BoxGeometry(width, height, depth);
  const bedMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
  });
  const bed = new THREE.Mesh(bedGeometry, bedMaterial);
  bed.position.set(0, height / 2, 0);
  bed.castShadow = true;
  bed.receiveShadow = true;
  bedGroup.add(bed);
  
  // Mattress
  const mattressGeometry = new THREE.BoxGeometry(width - 0.2, 0.5, depth - 0.2);
  const mattressMaterial = new THREE.MeshStandardMaterial({
    color: 0x4169E1,
    roughness: 0.8,
  });
  const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
  mattress.position.set(0, height + 0.25, 0);
  mattress.castShadow = true;
  mattress.receiveShadow = true;
  bedGroup.add(mattress);
  
  // Headboard
  const headboardGeometry = new THREE.BoxGeometry(width, height * 1.5, 0.1);
  const headboardMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.6,
  });
  const headboard = new THREE.Mesh(headboardGeometry, headboardMaterial);
  headboard.position.set(0, height * 0.75, -depth / 2 + 0.05);
  headboard.castShadow = true;
  bedGroup.add(headboard);
  
  return bedGroup;
}

// Sofa with back and arms
function createSofaGeometry(width, depth, height, color) {
  const sofaGroup = new THREE.Group();
  
  // Seat base
  const seatGeometry = new THREE.BoxGeometry(width, height * 0.4, depth * 0.8);
  const seatMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8,
  });
  const seat = new THREE.Mesh(seatGeometry, seatMaterial);
  seat.position.set(0, height * 0.2, depth * 0.1);
  seat.castShadow = true;
  seat.receiveShadow = true;
  sofaGroup.add(seat);
  
  // Back
  const backGeometry = new THREE.BoxGeometry(width, height * 0.8, 0.2);
  const back = new THREE.Mesh(backGeometry, seatMaterial);
  back.position.set(0, height * 0.6, -depth * 0.4 + 0.1);
  back.castShadow = true;
  sofaGroup.add(back);
  
  // Arms
  const armGeometry = new THREE.BoxGeometry(0.3, height * 0.8, depth * 0.8);
  const leftArm = new THREE.Mesh(armGeometry, seatMaterial);
  leftArm.position.set(-width / 2 + 0.15, height * 0.4, depth * 0.1);
  leftArm.castShadow = true;
  sofaGroup.add(leftArm);
  
  const rightArm = new THREE.Mesh(armGeometry, seatMaterial);
  rightArm.position.set(width / 2 - 0.15, height * 0.4, depth * 0.1);
  rightArm.castShadow = true;
  sofaGroup.add(rightArm);
  
  return sofaGroup;
}

// Chair with backrest
function createChairGeometry(width, depth, height, color) {
  const chairGroup = new THREE.Group();
  
  // Seat
  const seatGeometry = new THREE.BoxGeometry(width, 0.1, depth);
  const seatMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
  });
  const seat = new THREE.Mesh(seatGeometry, seatMaterial);
  seat.position.set(0, height * 0.3, 0);
  seat.castShadow = true;
  seat.receiveShadow = true;
  chairGroup.add(seat);
  
  // Back
  const backGeometry = new THREE.BoxGeometry(width, height * 0.6, 0.1);
  const back = new THREE.Mesh(backGeometry, seatMaterial);
  back.position.set(0, height * 0.6, -depth / 2 + 0.05);
  back.castShadow = true;
  chairGroup.add(back);
  
  // Legs
  const legGeometry = new THREE.BoxGeometry(0.1, height * 0.3, 0.1);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.8,
  });
  
  const legPositions = [
    [-width/2 + 0.05, height * 0.15, -depth/2 + 0.05],
    [width/2 - 0.05, height * 0.15, -depth/2 + 0.05],
    [-width/2 + 0.05, height * 0.15, depth/2 - 0.05],
    [width/2 - 0.05, height * 0.15, depth/2 - 0.05],
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    chairGroup.add(leg);
  });
  
  return chairGroup;
}

// Table with legs
function createTableGeometry(width, depth, height, color) {
  const tableGroup = new THREE.Group();
  
  // Table top
  const tableTopGeometry = new THREE.BoxGeometry(width, 0.3, depth);
  const tableTopMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.6,
  });
  const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
  tableTop.position.set(0, height, 0);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  tableGroup.add(tableTop);
  
  // Table legs
  const legGeometry = new THREE.BoxGeometry(0.3, height, 0.3);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.8,
  });
  
  const positions = [
    [-width/2 + 0.3, height/2, -depth/2 + 0.3],
    [width/2 - 0.3, height/2, -depth/2 + 0.3],
    [-width/2 + 0.3, height/2, depth/2 - 0.3],
    [width/2 - 0.3, height/2, depth/2 - 0.3],
  ];
  
  positions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    leg.receiveShadow = true;
    tableGroup.add(leg);
  });
  
  return tableGroup;
}

// Dining table (similar to table but larger)
function createDiningTableGeometry(width, depth, height, color) {
  const diningGroup = new THREE.Group();
  
  // Table top
  const tableTopGeometry = new THREE.BoxGeometry(width, 0.3, depth);
  const tableTopMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.6,
  });
  const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
  tableTop.position.set(0, height, 0);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  diningGroup.add(tableTop);
  
  // Table legs
  const legGeometry = new THREE.BoxGeometry(0.4, height, 0.4);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.8,
  });
  
  const positions = [
    [-width/2 + 0.5, height/2, -depth/2 + 0.5],
    [width/2 - 0.5, height/2, -depth/2 + 0.5],
    [-width/2 + 0.5, height/2, depth/2 - 0.5],
    [width/2 - 0.5, height/2, depth/2 - 0.5],
  ];
  
  positions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    leg.receiveShadow = true;
    diningGroup.add(leg);
  });
  
  return diningGroup;
}

// Cabinet/Wardrobe
function createCabinetGeometry(width, depth, height, color) {
  const cabinetGroup = new THREE.Group();
  
  // Main body
  const bodyGeometry = new THREE.BoxGeometry(width, height, depth);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.set(0, height / 2, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  cabinetGroup.add(body);
  
  // Doors
  const doorGeometry = new THREE.BoxGeometry(width / 2 - 0.1, height - 0.2, 0.05);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.6,
  });
  
  const leftDoor = new THREE.Mesh(doorGeometry, doorMaterial);
  leftDoor.position.set(-width / 4, height / 2, depth / 2 + 0.025);
  cabinetGroup.add(leftDoor);
  
  const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial);
  rightDoor.position.set(width / 4, height / 2, depth / 2 + 0.025);
  cabinetGroup.add(rightDoor);
  
  return cabinetGroup;
}

// Shelf
function createShelfGeometry(width, depth, height, color) {
  const shelfGroup = new THREE.Group();
  
  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.6,
  });
  
  // Multiple shelves
  const shelfCount = 3;
  const shelfHeight = height / shelfCount;
  
  for (let i = 0; i < shelfCount; i++) {
    const shelfGeometry = new THREE.BoxGeometry(width, 0.1, depth);
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.set(0, shelfHeight * i + shelfHeight / 2, 0);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    shelfGroup.add(shelf);
  }
  
  // Side supports
  const supportGeometry = new THREE.BoxGeometry(0.1, height, 0.1);
  const leftSupport = new THREE.Mesh(supportGeometry, shelfMaterial);
  leftSupport.position.set(-width / 2 + 0.05, height / 2, 0);
  shelfGroup.add(leftSupport);
  
  const rightSupport = new THREE.Mesh(supportGeometry, shelfMaterial);
  rightSupport.position.set(width / 2 - 0.05, height / 2, 0);
  shelfGroup.add(rightSupport);
  
  return shelfGroup;
}

// Door
function createDoorGeometry(width, depth, height, color) {
  const doorGeometry = new THREE.BoxGeometry(width, height, depth);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.castShadow = true;
  door.receiveShadow = true;
  return door;
}

// Window
function createWindowGeometry(width, depth, height, color) {
  const windowGroup = new THREE.Group();
  
  // Window frame
  const frameGeometry = new THREE.BoxGeometry(width, height, depth);
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.6,
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  windowGroup.add(frame);
  
  // Glass
  const glassGeometry = new THREE.BoxGeometry(width - 0.2, height - 0.2, depth * 0.5);
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x87CEEB,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
  });
  const glass = new THREE.Mesh(glassGeometry, glassMaterial);
  glass.position.set(0, 0, depth * 0.25);
  windowGroup.add(glass);
  
  return windowGroup;
}

// Default fallback
function createDefaultGeometry(width, depth, height, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
  });
  return new THREE.Mesh(geometry, material);
}

// Preview version (transparent)
export const createFurniturePreview = (type, dimensions, color) => {
  const preview = createFurnitureGeometry(type, dimensions, color);
  
  // Make transparent for preview
  preview.traverse((child) => {
    if (child.isMesh) {
      child.material.transparent = true;
      child.material.opacity = 0.7;
    }
  });
  
  preview.userData.isPreview = true;
  return preview;
};