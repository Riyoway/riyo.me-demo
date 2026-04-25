"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { useRouter } from 'next/navigation';

interface MazeGameProps {
  onComplete?: () => void;
}

export default function MazeGame({ onComplete }: MazeGameProps) {
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);
  const mazeContainerRef = useRef<HTMLDivElement>(null);
  const cssContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  const moveState = useRef({ 
    yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0,
    velocity: new THREE.Vector3(), bobTime: 0
  });
  
  const startTime = useRef<number>(Date.now());
  const bossSpawned = useRef<boolean>(false);
  const bossAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (!mazeContainerRef.current || !cssContainerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010101);
    scene.fog = new THREE.FogExp2(0x000000, 0.15);

    const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // WebGL
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    const pixelRatio = 0.25;
    renderer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.imageRendering = 'pixelated';
    renderer.domElement.style.position = 'absolute';
    mazeContainerRef.current.appendChild(renderer.domElement);

    // CSS3D
    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.pointerEvents = 'none';
    cssContainerRef.current.appendChild(cssRenderer.domElement);

    const loader = new THREE.TextureLoader();
    const wallTex = loader.load('/wall.png');
    wallTex.magFilter = wallTex.minFilter = THREE.NearestFilter;
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    const floorTex = loader.load('/floor.png');
    floorTex.magFilter = floorTex.minFilter = THREE.NearestFilter;
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(30, 30);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ map: floorTex }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ map: wallTex, color: 0x222222 }));
    ceiling.position.y = 10;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    const mazeMap = [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,1,1,0,1,0,1],
      [1,0,0,0,1,0,0,0,0,0,0,1],
      [1,1,1,0,1,0,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,0,1,1,1,0,1],
      [1,0,1,0,0,0,0,1,0,0,0,1],
      [1,0,0,0,1,1,0,0,0,1,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ];
    const cellSize = 14;
    const wallGeo = new THREE.BoxGeometry(cellSize, 10, cellSize);
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex });
    const walls: THREE.Mesh[] = [];

    for(let i=0; i<12; i++) {
      for(let j=0; j<12; j++) {
        if(mazeMap[i][j] === 1) {
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(i*cellSize - (12*cellSize)/2 + cellSize/2, 5, j*cellSize - (12*cellSize)/2 + cellSize/2);
          scene.add(wall);
          walls.push(wall);
        }
      }
    }

    const chasers: { sprite: CSS3DSprite, velocity: THREE.Vector3, soundCooldown: number, scale: number }[] = [];
    const chaserFiles = ['1.gif', '2.gif', '3.gif', '4.png', '5.png', '6.gif', '7.gif'];
    chaserFiles.forEach((file) => {
      const img = document.createElement('img');
      img.src = `/${file}`;
      const scale = 0.8 + Math.random() * 1.5;
      img.style.width = '512px';
      img.style.height = 'auto';
      const sprite = new CSS3DSprite(img);
      sprite.scale.set(scale / 51.2, scale / 51.2, 1);
      let sx, sz;
      do { sx = Math.floor(Math.random() * 12); sz = Math.floor(Math.random() * 12); } while (mazeMap[sx][sz] === 1);
      sprite.position.set(sx*cellSize - (12*cellSize)/2 + cellSize/2, scale/2, sz*cellSize - (12*cellSize)/2 + cellSize/2);
      scene.add(sprite);
      chasers.push({ sprite: sprite, velocity: new THREE.Vector3(), soundCooldown: 0, scale: scale });
    });

    let bossChaser: { sprite: CSS3DSprite, velocity: THREE.Vector3, scale: number } | null = null;

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const pointLight = new THREE.PointLight(0xff00c1, 15, 45);
    scene.add(pointLight);

    camera.position.set(cellSize - (12*cellSize)/2 + cellSize/2, 4, cellSize - (12*cellSize)/2 + cellSize/2);
    
    const raycaster = new THREE.Raycaster();

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        moveState.current.targetYaw -= e.movementX * 0.001;
        moveState.current.targetPitch -= e.movementY * 0.001;
        moveState.current.targetPitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, moveState.current.targetPitch));
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      const time = performance.now() * 0.001;
      const elapsed = Date.now() - startTime.current;

      // --- BOSS SPAWN ---
      if (elapsed > 20000 && !bossSpawned.current) {
        bossSpawned.current = true;
        const img = document.createElement('img');
        img.src = '/donate.png';
        const scale = 3.5; // Further reduced size
        img.style.width = '1024px';
        img.style.height = 'auto';
        const sprite = new CSS3DSprite(img);
        sprite.scale.set(scale / 102.4, scale / 102.4, 1);
        
        // Spawn far from player
        const playerGridX = Math.floor((camera.position.x + (12*cellSize)/2) / cellSize);
        const spawnX = playerGridX < 6 ? 10 : 1;
        const spawnZ = 10;
        
        sprite.position.set(spawnX * cellSize - (12*cellSize)/2, scale/2, spawnZ * cellSize - (12*cellSize)/2);
        scene.add(sprite);
        bossChaser = { sprite: sprite, velocity: new THREE.Vector3(), scale: scale };
        
        bossAudio.current = new Audio('/boss.mp3');
        bossAudio.current.loop = true;
        bossAudio.current.volume = 0.8;
        bossAudio.current.play().catch(() => {});
      }

      moveState.current.yaw = THREE.MathUtils.lerp(moveState.current.yaw, moveState.current.targetYaw, 0.08);
      moveState.current.pitch = THREE.MathUtils.lerp(moveState.current.pitch, moveState.current.targetPitch, 0.08);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = moveState.current.yaw;
      camera.rotation.x = moveState.current.pitch;

      const inputDir = new THREE.Vector3();
      if (keys.current['KeyW']) inputDir.z -= 1;
      if (keys.current['KeyS']) inputDir.z += 1;
      if (keys.current['KeyA']) inputDir.x -= 1;
      if (keys.current['KeyD']) inputDir.x += 1;
      
      const targetVel = inputDir.normalize().clone().applyQuaternion(camera.quaternion);
      targetVel.y = 0;
      targetVel.multiplyScalar(0.15);
      moveState.current.velocity.lerp(targetVel, 0.08);

      if (!isColliding(camera.position.x + moveState.current.velocity.x, camera.position.z)) camera.position.x += moveState.current.velocity.x;
      if (!isColliding(camera.position.x, camera.position.z + moveState.current.velocity.z)) camera.position.z += moveState.current.velocity.z;

      function isColliding(px: number, pz: number) {
        for (const wall of walls) {
          const dx = Math.abs(px - wall.position.x);
          const dz = Math.abs(pz - wall.position.z);
          if (dx < (cellSize/2 + 2.2) && dz < (cellSize/2 + 2.2)) return true;
        }
        return false;
      }

      // Normal Chasers
      chasers.forEach((c, idx) => {
        const toPlayer = camera.position.clone().sub(c.sprite.position);
        toPlayer.y = 0;
        const dist = toPlayer.length();
        
        // --- Line of Sight & Distance Fog ---
        const direction = c.sprite.position.clone().sub(camera.position).normalize();
        raycaster.set(camera.position, direction);
        const intersects = raycaster.intersectObjects(walls);
        let visible = true;
        if (intersects.length > 0 && intersects[0].distance < dist - 1) visible = false;

        // Apply Fog effect (brightness + blur based on distance)
        const fogFactor = Math.max(0, Math.min(1, 1 - dist / 50));
        c.sprite.element.style.filter = `brightness(${fogFactor})`;
        c.sprite.element.style.opacity = visible ? '1' : '0';

        if (dist < 60) {
          c.velocity.lerp(toPlayer.normalize().multiplyScalar(0.07), 0.05);
          chasers.forEach((other, oIdx) => {
            if (idx === oIdx) return;
            const sepDir = c.sprite.position.clone().sub(other.sprite.position);
            if (sepDir.length() < 5) c.velocity.add(sepDir.normalize().multiplyScalar(0.02));
          });
          if (dist < 8 && c.soundCooldown <= 0 && visible) {
            const v = new Audio('/voice.mp3');
            v.playbackRate = 0.5 + Math.random() * 1.5;
            v.volume = 1.0;
            v.play().catch(() => {});
            c.soundCooldown = 100;
          }
        }
        if (c.soundCooldown > 0) c.soundCooldown--;
        
        // Sliding for Chasers
        const checkWall = (px: number, pz: number) => {
          const gx = Math.floor((px + (12*cellSize)/2) / cellSize);
          const gz = Math.floor((pz + (12*cellSize)/2) / cellSize);
          return gx >= 0 && gx < 12 && gz >= 0 && gz < 12 && mazeMap[gx][gz] === 1;
        };
        const ncx = c.sprite.position.x + c.velocity.x;
        const ncz = c.sprite.position.z + c.velocity.z;
        if (!checkWall(ncx, c.sprite.position.z)) c.sprite.position.x = ncx;
        if (!checkWall(c.sprite.position.x, ncz)) c.sprite.position.z = ncz;
        c.sprite.position.y = c.scale/2 + Math.sin(time * 3 + idx) * 0.3;
      });

      // --- BOSS LOGIC ---
      if (bossChaser) {
        const toPlayer = camera.position.clone().sub(bossChaser.sprite.position);
        toPlayer.y = 0;
        const dist = toPlayer.length();
        
        // BOSS IS FAST
        bossChaser.velocity.lerp(toPlayer.normalize().multiplyScalar(0.25), 0.05);
        bossChaser.sprite.position.x += bossChaser.velocity.x;
        bossChaser.sprite.position.z += bossChaser.velocity.z;
        bossChaser.sprite.position.y = bossChaser.scale/2 + Math.sin(time * 5) * 1.0;
        
        // Occlusion Check for Boss
        const direction = bossChaser.sprite.position.clone().sub(camera.position).normalize();
        raycaster.set(camera.position, direction);
        const intersects = raycaster.intersectObjects(walls);
        let bossVisible = true;
        if (intersects.length > 0 && intersects[0].distance < dist - 1) bossVisible = false;

        // Fog for Boss
        const fogFactor = Math.max(0, Math.min(1, 1 - dist / 80));
        bossChaser.sprite.element.style.filter = `brightness(${fogFactor})`;
        bossChaser.sprite.element.style.opacity = bossVisible ? '1' : '0';

        // Collision with BOSS
        if (dist < 2.0) {
          cancelAnimationFrame(requestRef.current);
          if (bossAudio.current) bossAudio.current.pause();
          window.location.href = '/security'; // Fallback for push
          return;
        }
      }

      pointLight.position.copy(camera.position);
      renderer.render(scene, camera);
      cssRenderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio, false);
      cssRenderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      if (bossAudio.current) bossAudio.current.pause();
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      <div 
        ref={mazeContainerRef} 
        onClick={() => {
          mazeContainerRef.current?.querySelector('canvas')?.requestPointerLock();
          setIsStarted(true);
        }} 
        className="absolute inset-0 z-40 flex items-center justify-center cursor-crosshair" 
      />
      <div ref={cssContainerRef} className="absolute inset-0 z-[45] pointer-events-none" />
      
      {!isStarted && (
        <div 
          onClick={() => {
            mazeContainerRef.current?.querySelector('canvas')?.requestPointerLock();
            setIsStarted(true);
          }}
          className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center text-white p-4 text-center cursor-pointer"
        >
          <div className="mb-8 space-y-4">
            <h2 className="text-4xl font-bold tracking-tighter animate-pulse" style={{ color: '#ff00c1' }}>MISSION</h2>
            <p className="text-2xl font-mono">Find the key to the next page!</p>
          </div>
          <div className="mt-8 px-8 py-3 border-2 border-white/20 hover:border-[#ff00c1] hover:text-[#ff00c1] transition-colors cursor-pointer group">
            <p className="text-lg font-bold tracking-widest uppercase">Click to Start</p>
          </div>
          <div className="mt-12 text-sm text-gray-500 font-mono">
            WASD to Move | Mouse to Look
          </div>
        </div>
      )}
    </>
  );
}
