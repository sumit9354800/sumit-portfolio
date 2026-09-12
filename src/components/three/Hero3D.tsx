import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    // Set up Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 22);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch {
      setWebglSupported(false);
      return;
    }

    // Lighting: Enhanced cinematic illumination with crisp metallic specular highlights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.2);
    mainLight.position.set(14, 16, 16);
    scene.add(mainLight);

    const silverRimLight = new THREE.DirectionalLight(0xe2e8f0, 2.4);
    silverRimLight.position.set(-16, -12, -8);
    scene.add(silverRimLight);

    const dynamicPointLight = new THREE.PointLight(0xffffff, 2.0, 45);
    dynamicPointLight.position.set(0, 2, 10);
    scene.add(dynamicPointLight);

    // Group for all 3D objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Dynamic 3D cubes with brushed metallic finish and high-contrast facets
    const cubeData = [
      // Left floating clusters
      { pos: [-11, 4, -3], scale: 2.5, rotSpeed: [0.004, 0.005], color: 0x363636 },
      { pos: [-8, -4, 2], scale: 2.9, rotSpeed: [-0.003, 0.004], color: 0x2e2e2e },
      { pos: [-13, -2, -1], scale: 2.0, rotSpeed: [0.005, -0.003], color: 0x404040 },
      { pos: [-6, 6, 0], scale: 1.8, rotSpeed: [-0.004, -0.003], color: 0x303030 },
      { pos: [-4, -6, 3], scale: 1.6, rotSpeed: [0.003, 0.005], color: 0x3a3a3a },

      // Center depth geometric structures
      { pos: [-2, 5.5, -6], scale: 3.4, rotSpeed: [0.003, 0.003], color: 0x282828 },
      { pos: [2.5, -5, -5], scale: 2.8, rotSpeed: [-0.003, 0.004], color: 0x323232 },
      { pos: [0, 1, -9], scale: 4.5, rotSpeed: [0.002, 0.002], color: 0x252525 },

      // Right floating clusters
      { pos: [10, 5, -2], scale: 2.7, rotSpeed: [-0.004, 0.004], color: 0x343434 },
      { pos: [8, -4, 3], scale: 3.1, rotSpeed: [0.003, -0.004], color: 0x2a2a2a },
      { pos: [13, -1, 0], scale: 2.2, rotSpeed: [-0.004, -0.003], color: 0x3e3e3e },
      { pos: [6, 6, 1], scale: 1.9, rotSpeed: [0.004, 0.003], color: 0x323232 },
      { pos: [5, -6, 4], scale: 1.5, rotSpeed: [-0.005, 0.004], color: 0x383838 },
      { pos: [14, 3, -4], scale: 2.1, rotSpeed: [0.003, -0.005], color: 0x2c2c2c },
      { pos: [-14, 2, -5], scale: 2.3, rotSpeed: [-0.003, 0.004], color: 0x303030 },
    ];

    const cubes: Array<{
      mesh: THREE.Mesh;
      basePos: [number, number, number];
      rotSpeed: [number, number];
      floatSpeed: number;
      floatPhase: number;
    }> = [];

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    // Crisp, glowing wireframe outlines for distinctive high-tech silhouette
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
    });

    cubeData.forEach((data, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        metalness: 0.85,
        roughness: 0.22,
      });

      const mesh = new THREE.Mesh(boxGeometry, material);
      mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
      mesh.scale.set(data.scale, data.scale, data.scale);
      mesh.rotation.set(index * 0.35, index * 0.55, index * 0.25);

      // Add crisp wireframe edge lines
      const line = new THREE.LineSegments(edgesGeometry, edgeMaterial);
      mesh.add(line);

      mainGroup.add(mesh);
      cubes.push({
        mesh,
        basePos: data.pos as [number, number, number],
        rotSpeed: data.rotSpeed as [number, number],
        floatSpeed: 0.65 + (index % 5) * 0.2,
        floatPhase: index * 0.7,
      });
    });

    // Central geometric orbital core (Icosahedron wireframe)
    const centralCoreGroup = new THREE.Group();
    const icoGeometry = new THREE.IcosahedronGeometry(3.8, 0);
    const icoEdges = new THREE.EdgesGeometry(icoGeometry);
    const icoMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
    });
    const icoWireframe = new THREE.LineSegments(icoEdges, icoMaterial);
    centralCoreGroup.add(icoWireframe);

    // Inner rotating octahedron wireframe
    const octaGeometry = new THREE.OctahedronGeometry(2.2, 0);
    const octaEdges = new THREE.EdgesGeometry(octaGeometry);
    const octaMaterial = new THREE.LineBasicMaterial({
      color: 0xd4d4d4,
      transparent: true,
      opacity: 0.65,
    });
    const octaWireframe = new THREE.LineSegments(octaEdges, octaMaterial);
    centralCoreGroup.add(octaWireframe);

    centralCoreGroup.position.set(0, 0, -4);
    mainGroup.add(centralCoreGroup);

    // Enhanced floating 3D particle constellation
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 38;
      positions[i + 1] = (Math.random() - 0.5) * 26;
      positions[i + 2] = (Math.random() - 0.5) * 22 - 3;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Responsive resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Visibility Observer
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera / cluster reaction to mouse
      targetRotationY = mouseX * 0.45;
      targetRotationX = mouseY * 0.35;

      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.04;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.04;

      // Slow cinematic yaw
      mainGroup.rotation.z = Math.sin(elapsedTime * 0.15) * 0.05;

      // Animate central orbital geometric core
      icoWireframe.rotation.y = elapsedTime * 0.12;
      icoWireframe.rotation.x = elapsedTime * 0.08;
      octaWireframe.rotation.y = -elapsedTime * 0.18;
      octaWireframe.rotation.z = elapsedTime * 0.14;

      // Dynamic cursor point light creates interactive specular sheen on floating cubes
      dynamicPointLight.position.x = mouseX * 12;
      dynamicPointLight.position.y = -mouseY * 8 + 2;

      // Individual cube floating
      cubes.forEach((cube) => {
        cube.mesh.rotation.x += cube.rotSpeed[0];
        cube.mesh.rotation.y += cube.rotSpeed[1];
        cube.mesh.position.y = cube.basePos[1] + Math.sin(elapsedTime * cube.floatSpeed + cube.floatPhase) * 0.45;
        cube.mesh.position.x = cube.basePos[0] + Math.cos(elapsedTime * (cube.floatSpeed * 0.7) + cube.floatPhase) * 0.25;
      });

      // Subtle particle drift
      particleSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      boxGeometry.dispose();
      edgesGeometry.dispose();
      edgeMaterial.dispose();
      icoGeometry.dispose();
      icoEdges.dispose();
      icoMaterial.dispose();
      octaGeometry.dispose();
      octaEdges.dispose();
      octaMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  if (!webglSupported) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      id="hero-3d-background-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      aria-hidden="true"
    />
  );
};
