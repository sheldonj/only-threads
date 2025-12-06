import { type Object3DNode } from '@react-three/fiber';
// Extend JSX to support Three.js elements with React 19
// @react-three/fiber doesn't officially support React 19 yet, so we need to extend the types
import type * as THREE from 'three';

declare module '@react-three/fiber' {
  type ThreeElements = {
    mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
    planeGeometry: Object3DNode<
      THREE.PlaneGeometry,
      typeof THREE.PlaneGeometry
    >;
    primitive: Object3DNode<THREE.Object3D, typeof THREE.Object3D> & {
      attach?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      object: any;
    };
    shaderMaterial: Object3DNode<
      THREE.ShaderMaterial,
      typeof THREE.ShaderMaterial
    >;
  };
}
