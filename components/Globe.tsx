import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Coordinates } from '../types';

interface GlobeProps {
    targetCoordinates: Coordinates | null;
    onTargetPositionUpdate: (pos: { x: number; y: number } | null) => void;
}

export const Globe: React.FC<GlobeProps> = ({ targetCoordinates, onTargetPositionUpdate }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const earthMeshRef = useRef<THREE.Mesh | null>(null);
    const cloudMeshRef = useRef<THREE.Mesh | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const markerRef = useRef<THREE.Mesh | null>(null);
    
    // Convert Lat/Lon to 3D coordinates
    const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    };
    
    useEffect(() => {
        if (!mountRef.current) return;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 15;
        cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        scene.add(new THREE.AmbientLight(0xbbbbbb));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        const textureLoader = new THREE.TextureLoader();

        // Earth
        const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
        
        const nightTexture = textureLoader.load('https://cdn.jsdelivr.net/gh/turban/webgl-earth/images/night_lights_4k.jpg');
        const sunDirection = directionalLight.position.clone().negate().normalize();

        const earthMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('https://cdn.jsdelivr.net/gh/turban/webgl-earth/images/2_no_clouds_4k.jpg'),
            bumpMap: textureLoader.load('https://cdn.jsdelivr.net/gh/turban/webgl-earth/images/elev_bump_4k.jpg'),
            bumpScale: 0.05,
            specularMap: textureLoader.load('https://cdn.jsdelivr.net/gh/turban/webgl-earth/images/water_4k.png'),
            specular: new THREE.Color('grey'),
            shininess: 5
        });

        earthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.nightTexture = { value: nightTexture };
            shader.uniforms.sunDirection = { value: sunDirection };

            shader.vertexShader = 'varying vec3 vWorldNormal;\n' + shader.vertexShader;
            shader.fragmentShader = 'varying vec3 vWorldNormal;\n' + shader.fragmentShader;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                `
                #include <worldpos_vertex>
                vWorldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
                `
            );
            
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <emissive_fragment>',
                `
                #include <emissive_fragment>
                vec3 nightColor = texture2D( nightTexture, vMapUv ).rgb;
                float intensity = dot( normalize( vWorldNormal ), sunDirection );
                float nightFactor = 1.0 - smoothstep( -0.1, 0.1, intensity );
                totalEmissiveRadiance += nightColor * nightFactor;
                `
            );
        };

        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        earthMeshRef.current = earthMesh;
        scene.add(earthMesh);

        // Clouds
        const cloudGeometry = new THREE.SphereGeometry(5.07, 64, 64);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            map: textureLoader.load('https://cdn.jsdelivr.net/gh/turban/webgl-earth/images/fair_clouds_4k.png'),
            transparent: true,
            opacity: 0.8,
        });
        const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudMeshRef.current = cloudMesh;
        scene.add(cloudMesh);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 8;
        controls.maxDistance = 50;
        controlsRef.current = controls;

        // Animation Loop
        let animationFrameId: number;
        const animate = () => {
            controls.update();

            if (markerRef.current) {
                markerRef.current.rotation.y += 0.01;
            }

            if (markerRef.current && cameraRef.current && rendererRef.current) {
                const screenPosition = markerRef.current.position.clone();
                screenPosition.project(cameraRef.current);
                const renderer = rendererRef.current;
                const x = (screenPosition.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
                const y = (-screenPosition.y * 0.5 + 0.5) * renderer.domElement.clientHeight;
                onTargetPositionUpdate({ x, y });
            } else {
                onTargetPositionUpdate(null);
            }
            
            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (mountRef.current) {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            mountRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
            controls.dispose();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Satellite image update effect
    useEffect(() => {
        const textureLoader = new THREE.TextureLoader();
        
        const updateSatelliteImage = () => {
            try {
                const CLOUDS_URL = `https://rammb.cira.colostate.edu/repository/merged_imagery/latest_M1.jpg?${new Date().getTime()}`;
                
                textureLoader.load(
                    CLOUDS_URL,
                    (newTexture) => {
                        if (cloudMeshRef.current) {
                            const material = cloudMeshRef.current.material as THREE.MeshBasicMaterial;
                            if (material.map && material.map !== newTexture) {
                                material.map.dispose();
                            }
                            material.map = newTexture;
                            material.opacity = 1.0;
                            material.needsUpdate = true;
                        }
                    },
                    undefined,
                    (error) => {
                        console.error('An error occurred while loading the cloud texture:', error);
                    }
                );
            } catch (error) {
                console.error("Error setting up satellite image update:", error);
            }
        };

        updateSatelliteImage();
        
        const intervalId = setInterval(updateSatelliteImage, 600000); 

        return () => clearInterval(intervalId);
    }, []);

    // Animate to target and place marker
    useEffect(() => {
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        let animationFrameId: number;
        
        if (controls) {
            controls.enabled = !targetCoordinates;
        }

        // Marker logic
        if (scene) {
            // Remove previous marker
            if (markerRef.current) {
                scene.remove(markerRef.current);
                markerRef.current.geometry.dispose();
                (markerRef.current.material as THREE.Material).dispose();
                markerRef.current = null;
            }

            if (targetCoordinates) {
                const { lat, lon } = targetCoordinates;
                const markerPosition = latLonToVector3(lat, lon, 5.15); // Slightly above the surface

                const markerGeometry = new THREE.OctahedronGeometry(0.07, 0);
                const markerMaterial = new THREE.MeshLambertMaterial({
                    color: 0xffd700,
                    emissive: 0xffd700,
                    emissiveIntensity: 0.6,
                });
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.copy(markerPosition);

                scene.add(marker);
                markerRef.current = marker;
            }
        }

        // Camera animation logic
        if (targetCoordinates && controls && camera) {
            const { lat, lon } = targetCoordinates;
            // Zoom to max zoom level defined by controls.minDistance
            const targetPosition = latLonToVector3(lat, lon, controls.minDistance);
            
            const startPosition = camera.position.clone();
            const duration = 1200; // A little longer for a smoother feel
            let startTime = 0;

            const animateRotation = (time: number) => {
                if(startTime === 0) startTime = time;
                const elapsed = time - startTime;
                const t = Math.min(elapsed / duration, 1.0);
                // Ease out cubic
                const easedT = 1 - Math.pow(1 - t, 3);

                camera.position.lerpVectors(startPosition, targetPosition, easedT);
                controls.update();

                if(t < 1.0) {
                    animationFrameId = requestAnimationFrame(animateRotation);
                }
            };
            
            animationFrameId = requestAnimationFrame(animateRotation);
        }
        
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        }
    }, [targetCoordinates]);

    return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-10" />;
};