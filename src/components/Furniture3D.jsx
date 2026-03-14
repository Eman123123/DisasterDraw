import React from 'react'
import { useThree } from '@react-three/fiber'

const Furniture3D = ({ 
  furniture, 
  isSelected = false, 
  onSelect,
  onPositionUpdate 
}) => {
  const { scene } = useThree()

  const handleDrag = (e) => {
    e.stopPropagation()
    // Simple drag implementation - in real app you'd use proper drag controls
    const intersection = e.intersections[0]
    if (intersection) {
      const newPosition = {
        x: intersection.point.x,
        z: intersection.point.z
      }
      onPositionUpdate(furniture.id, newPosition)
    }
  }

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect(furniture.id)
  }

  return (
    <mesh
      position={[furniture.position.x, furniture.size.height / 2, furniture.position.z]}
      rotation={[0, furniture.rotation, 0]}
      castShadow
      receiveShadow
      onClick={handleClick}
      onPointerMove={handleDrag}
    >
      <boxGeometry args={[furniture.size.width, furniture.size.height, furniture.size.depth]} />
      <meshStandardMaterial 
        color={isSelected ? '#f39c12' : furniture.color}
        roughness={0.7}
        metalness={0.1}
        emissive={isSelected ? '#f39c12' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
      
      {/* Selection outline */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[
            furniture.size.width + 0.05, 
            furniture.size.height + 0.05, 
            furniture.size.depth + 0.05
          ]} />
          <meshBasicMaterial 
            color="#f39c12" 
            transparent 
            opacity={0.3} 
            wireframe 
          />
        </mesh>
      )}
    </mesh>
  )
}

export default Furniture3D