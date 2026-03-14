export const CANVAS_CONFIG = {
  WIDTH: 1000,
  HEIGHT: 800,
  GRID_SIZE: 50
}

export const WALL_CONFIG = {
  HEIGHT: 1.5, // meters
  THICKNESS: 0.2, // meters
  DEFAULT_COLOR: '#3498db'
}

export const COLORS = {
  PRIMARY: '#3498db',
  SECONDARY: '#2ecc71',
  ACCENT: '#e74c3c',
  BACKGROUND: '#ecf0f1',
  TEXT: '#2c3e50'
}
// Shared conversion constants
export const CANVAS_TO_3D_SCALE = 0.03;
export const CANVAS_CENTER_OFFSET = 500;
export const PIXELS_PER_METER = 100;

// Shared conversion functions
export const convertCanvasTo3D = (canvasPoint) => {
  return {
    x: (canvasPoint.x - CANVAS_CENTER_OFFSET) * CANVAS_TO_3D_SCALE,
    y: 0,
    z: (canvasPoint.y - CANVAS_CENTER_OFFSET) * CANVAS_TO_3D_SCALE
  };
};

export const convert3DToCanvas = (worldPoint) => {
  return {
    x: (worldPoint.x / CANVAS_TO_3D_SCALE) + CANVAS_CENTER_OFFSET,
    y: (worldPoint.z / CANVAS_TO_3D_SCALE) + CANVAS_CENTER_OFFSET
  };
};