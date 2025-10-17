import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Coordinates } from '../types';

interface GlobeProps {
    targetCoordinates: Coordinates | null;
    onTargetPositionUpdate: (pos: { x: number; y: number } | null) => void;
    onTextureProgress: (progress: number) => void;
    onTexturesLoaded: () => void;
    onCloudProgress: (progress: number) => void;
    onCloudsLoaded: () => void;
    startCloudLoading: boolean;
    countryCode: string | null;
}

// Convert Lat/Lon to 3D coordinates. Moved to module scope for performance.
const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
};

// Simple module-level cache for GeoJSON data to prevent re-fetching
const geoJsonCache: { [key: string]: any } = {};


export const Globe: React.FC<GlobeProps> = ({ 
    targetCoordinates, 
    onTargetPositionUpdate,
    onTextureProgress,
    onTexturesLoaded,
    onCloudProgress,
    onCloudsLoaded,
    startCloudLoading,
    countryCode
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const earthMeshRef = useRef<THREE.Mesh | null>(null);
    const cloudMeshRef = useRef<THREE.Mesh | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const markerRef = useRef<THREE.Mesh | null>(null);
    const borderRef = useRef<THREE.Group | null>(null);

    // Memoize materials so they are not recreated on every render.
    // They are disposed in the main useEffect's cleanup function.
    const borderMaterials = useMemo(() => ({
        core: new THREE.LineBasicMaterial({
            color: 0x99ffff, // A bright, light cyan for the core line
            transparent: true,
            opacity: 1.0,
            depthTest: false, // Render on top
        }),
        glow: new THREE.LineBasicMaterial({
            color: 0x00e0ff, // The main glow color
            transparent: true,
            opacity: 0.4,
            depthTest: false, // Render on top
        }),
    }), []);
    
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

        // Loading Manager for base textures
        const manager = new THREE.LoadingManager();
        manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal) * 100;
            onTextureProgress(progress);
        };
        manager.onLoad = () => {
            onTexturesLoaded();
        };
        manager.onError = (url) => {
            console.error('Error loading texture: ' + url);
        };

        const textureLoader = new THREE.TextureLoader(manager);

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
            // Clean up memoized materials on component unmount
            borderMaterials.core.dispose();
            borderMaterials.glow.dispose();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Satellite image update effect
    useEffect(() => {
        if (!startCloudLoading) return;

        const updateSatelliteImage = async () => {
             try {
                // Use a proxy to avoid CORS issues
                const PROXY_URL = 'https://images.weserv.nl/?url=';
                const IMAGE_URL = `rammb.cira.colostate.edu/repository/merged_imagery/latest_M1.jpg?${new Date().getTime()}`;
                
                const response = await fetch(PROXY_URL + IMAGE_URL);

                if (!response.ok || !response.body) {
                    throw new Error(`Failed to fetch satellite image: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('Content-Type');
                const reader = response.body.getReader();
                const contentLength = +(response.headers.get('Content-Length') || 0);
                let receivedLength = 0;
                const chunks: Uint8Array[] = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    receivedLength += value.length;
                    if (contentLength > 0) {
                        const progress = Math.min((receivedLength / contentLength) * 100, 100);
                        onCloudProgress(progress);
                    }
                }

                const blob = new Blob(chunks, { type: contentType || 'image/jpeg' });
                const objectURL = URL.createObjectURL(blob);
                
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(
                    objectURL,
                    (newTexture) => {
                        if (cloudMeshRef.current) {
                            const material = cloudMeshRef.current.material as THREE.MeshBasicMaterial;
                            if (material.map) material.map.dispose();
                            material.map = newTexture;
                            material.opacity = 1.0;
                            material.needsUpdate = true;
                        }
                        URL.revokeObjectURL(objectURL);
                        onCloudsLoaded();
                    },
                    undefined,
                    (error) => {
                        console.error('An error occurred while loading the cloud texture blob:', error);
                        URL.revokeObjectURL(objectURL);
                        onCloudsLoaded(); // Ensure progress bar is hidden even on failure
                    }
                );
            } catch (error) {
                console.error("Error setting up satellite image update:", error);
                onCloudsLoaded(); // Ensure progress bar is hidden even on failure
            }
        };

        updateSatelliteImage();
        const intervalId = setInterval(updateSatelliteImage, 600000); // 10 minutes

        return () => clearInterval(intervalId);
    }, [startCloudLoading, onCloudProgress, onCloudsLoaded]);

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

    // Fetch and draw country border with a glow effect
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;
    
        // Helper to dispose of all geometry and materials in a group
        const cleanupBorder = () => {
            if (borderRef.current) {
                scene.remove(borderRef.current);
                borderRef.current.traverse((object) => {
                    const line = object as THREE.Line;
                    if (line.isLine && line.geometry) {
                        line.geometry.dispose();
                    }
                });
                borderRef.current = null;
            }
        };
    
        const drawBorder = (geoJson: any) => {
            cleanupBorder();
            if (!sceneRef.current) return;
    
            const borderGroup = new THREE.Group();
            borderGroup.renderOrder = 1; // Render on top
            const radius = 5.08; // Slightly above clouds
    
            const drawPolygon = (coordinates: number[][]) => {
                if (!coordinates || coordinates.length < 2) return;
                const points = coordinates.map(coord => latLonToVector3(coord[1], coord[0], radius));
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
                const coreLine = new THREE.Line(geometry, borderMaterials.core);
                const glowLine = new THREE.Line(geometry.clone(), borderMaterials.glow);
                glowLine.scale.setScalar(1.005);
    
                borderGroup.add(coreLine);
                borderGroup.add(glowLine);
            };
    
            if (!geoJson || !geoJson.type) {
                console.error("Invalid GeoJSON object received.");
                return;
            }
    
            const features = geoJson.type === 'FeatureCollection'
                ? geoJson.features
                : (geoJson.type === 'Feature' ? [geoJson] : []);
    
            if (!features || features.length === 0) {
                console.error("No features found in GeoJSON data for border.");
                return;
            }
    
            features.forEach((feature: any) => {
                if (!feature || !feature.geometry || !feature.geometry.coordinates) return;
    
                const { type, coordinates } = feature.geometry;
    
                if (type === 'Polygon') {
                    coordinates.forEach((polygon: number[][]) => drawPolygon(polygon));
                } else if (type === 'MultiPolygon') {
                    coordinates.forEach((multiPolygon: number[][][]) => {
                        multiPolygon.forEach((polygon: number[][]) => drawPolygon(polygon));
                    });
                }
            });
    
            if (borderGroup.children.length > 0) {
                sceneRef.current.add(borderGroup);
                borderRef.current = borderGroup;
            }
        };
    
        let isCancelled = false;
    
        if (countryCode) {
            const code = countryCode.toUpperCase();
            if (geoJsonCache[code]) {
                drawBorder(geoJsonCache[code]);
            } else {
                const resolution = '60M';
                fetch(`https://gisco-services.ec.europa.eu/distribution/v2/countries/geojson/${code}_${resolution}.geojson`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to fetch border for ${code} (${res.status})`);
                        return res.json();
                    })
                    .then(geoJson => {
                        if (isCancelled) return;
                        geoJsonCache[code] = geoJson;
                        drawBorder(geoJson);
                    })
                    .catch(err => {
                        if (isCancelled) return;
                        console.error("Failed to fetch/draw country border:", err);
                        cleanupBorder();
                    });
            }
        } else {
            cleanupBorder();
        }
    
        return () => {
            isCancelled = true;
            cleanupBorder();
        };
    }, [countryCode, borderMaterials]);

    return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-10" />;
};