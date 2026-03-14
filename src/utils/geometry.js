export const calculateDistance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + 
    Math.pow(point2.y - point1.y, 2)
  )
}

export const calculateAngle = (point1, point2) => {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x)
}

export const calculateCenter = (point1, point2) => {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2
  }
}