// Extend JSX to support Three.js elements with React 19
// @react-three/fiber doesn't officially support React 19 yet, so we need to extend the types
import type * as THREE from 'three';
import { type Object3DNode } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
    planeGeometry: Object3DNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
    primitive: Object3DNode<THREE.Object3D, typeof THREE.Object3D> & { object: any; attach?: string };
    shaderMaterial: Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial>;
  }
}

