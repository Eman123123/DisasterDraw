// [NEW FILE] components/PathOverlay.jsx
import React from 'react';
import { CANVAS_TO_3D_SCALE } from './DrawingCanvas';

const PathOverlay = ({ path, color = '#00ff00', width = 3 }) => {
  if (!path || path.length < 2) return null;
  
  // Convert 3D path points to 2D canvas coordinates
  const convertToCanvas = (point) => ({
    x: point.x / CANVAS_TO_3D_SCALE + 500,
    y: point.z / CANVAS_TO_3D_SCALE + 500
  });
  
  const canvasPoints = path.map(convertToCanvas);
  
  // Create path segments
  const segments = [];
  for (let i = 0; i < canvasPoints.length - 1; i++) {
    const start = canvasPoints[i];
    const end = canvasPoints[i + 1];
    
    const length = Math.sqrt(
      Math.pow(end.x - start.x, 2) + 
      Math.pow(end.y - start.y, 2)
    );
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
    
    segments.push(
      <div
        key={`path-${i}`}
        style={{
          position: 'absolute',
          left: start.x,
          top: start.y,
          width: length,
          height: width,
          backgroundColor: color,
          transformOrigin: '0 0',
          transform: `rotate(${angle}deg)`,
          opacity: 0.8,
          boxShadow: '0 0 5px rgba(0,255,0,0.5)',
          pointerEvents: 'none',
          zIndex: 20
        }}
      />
    );
    
    // Add direction indicator at the end
    if (i === canvasPoints.length - 2) {
      segments.push(
        <div
          key={`arrow-${i}`}
          style={{
            position: 'absolute',
            left: end.x - 15,
            top: end.y - 15,
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: `20px solid ${color}`,
            transform: `rotate(${angle}deg)`,
            opacity: 0.8,
            pointerEvents: 'none',
            zIndex: 20
          }}
        />
      );
    }
    
    // Add distance label for long segments
    if (length > 100) {
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const distance = Math.sqrt(
        Math.pow(path[i+1].x - path[i].x, 2) + 
        Math.pow(path[i+1].z - path[i].z, 2)
      ).toFixed(1);
      
      segments.push(
        <div
          key={`label-${i}`}
          style={{
            position: 'absolute',
            left: midX - 25,
            top: midY - 10,
            width: 50,
            height: 20,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            pointerEvents: 'none',
            zIndex: 21,
            border: `1px solid ${color}`
          }}
        >
          {distance}m
        </div>
      );
    }
  }
  
  // Add start marker
  segments.push(
    <div
      key="start-marker"
      style={{
        position: 'absolute',
        left: canvasPoints[0].x - 15,
        top: canvasPoints[0].y - 15,
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: '#ff0000',
        border: '2px solid white',
        opacity: 0.9,
        pointerEvents: 'none',
        zIndex: 21,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 0 15px rgba(255,0,0,0.5)'
      }}
    >
      S
    </div>
  );
  
  // Add end marker
  segments.push(
    <div
      key="end-marker"
      style={{
        position: 'absolute',
        left: canvasPoints[canvasPoints.length - 1].x - 15,
        top: canvasPoints[canvasPoints.length - 1].y - 15,
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: '#00ff00',
        border: '2px solid white',
        opacity: 0.9,
        pointerEvents: 'none',
        zIndex: 21,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 0 15px rgba(0,255,0,0.5)',
        animation: 'pulse 1.5s infinite'
      }}
    >
      E
    </div>
  );
  
  return (
    <>
      {segments}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 15px rgba(0,255,0,0.5); }
            50% { transform: scale(1.1); box-shadow: 0 0 25px rgba(0,255,0,0.8); }
            100% { transform: scale(1); box-shadow: 0 0 15px rgba(0,255,0,0.5); }
          }
        `}
      </style>
    </>
  );
};

export default PathOverlay;