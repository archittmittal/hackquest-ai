import * as THREE from "three";
export const createLoginBackgroundScene = (container) => {
    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        // Create particle system - emit from login box area
        const particleCount = 4000;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        // Initialize particles emitting from box edges
        for (let i = 0; i < particleCount; i++) {
            let x, y, z;
            // Emit from edges of a centered box (login box area)
            const side = Math.floor(Math.random() * 4);
            if (side === 0) {
                // Top edge
                x = (Math.random() - 0.5) * 40;
                y = 30;
                z = (Math.random() - 0.5) * 20;
            }
            else if (side === 1) {
                // Bottom edge
                x = (Math.random() - 0.5) * 40;
                y = -30;
                z = (Math.random() - 0.5) * 20;
            }
            else if (side === 2) {
                // Left edge
                x = -20;
                y = (Math.random() - 0.5) * 40;
                z = (Math.random() - 0.5) * 20;
            }
            else {
                // Right edge
                x = 20;
                y = (Math.random() - 0.5) * 40;
                z = (Math.random() - 0.5) * 20;
            }
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            // White color
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;
            // Velocity - outward from center
            const angle = Math.atan2(y, x);
            const speed = Math.random() * 0.3 + 0.1;
            velocities[i * 3] = Math.cos(angle) * speed;
            velocities[i * 3 + 1] = Math.sin(angle) * speed;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        // Create shader material
        const particlesMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 }
            },
            vertexShader: `
                uniform float time;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vColor = color;
                    
                    // Pulsing effect
                    float pulse = sin(time * 0.5 + length(position) * 0.01) * 0.5 + 0.5;
                    float size = 2.0 + pulse * 2.0;
                    
                    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPos.z);
                    gl_Position = projectionMatrix * mvPos;
                    
                    vAlpha = 0.8;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    // Circular particles with soft falloff
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = (1.0 - dist * 2.0) * vAlpha;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);
        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        window.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth - 0.5) * 100;
            mouseY = -(event.clientY / window.innerHeight - 0.5) * 100;
        });
        // Handle resize
        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onWindowResize);
        // Animation loop
        let time = 0;
        const posArray = particlesGeometry.getAttribute('position').array;
        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.016;
            particlesMaterial.uniforms.time.value = time;
            // Update particle positions
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                // Apply velocity
                posArray[i3] += velocities[i3];
                posArray[i3 + 1] += velocities[i3 + 1];
                posArray[i3 + 2] += velocities[i3 + 2];
                // Add wave motion across whole window
                posArray[i3 + 1] += Math.sin(time * 0.3 + posArray[i3] * 0.02) * 0.4;
                posArray[i3] += Math.cos(time * 0.25 + posArray[i3 + 1] * 0.02) * 0.4;
                // Damping (less damping for longer float)
                velocities[i3] *= 0.97;
                velocities[i3 + 1] *= 0.97;
                velocities[i3 + 2] *= 0.97;
                // Mouse repulsion
                const dx = mouseX - posArray[i3];
                const dy = mouseY - posArray[i3 + 1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 30) {
                    const force = (30 - dist) / 30 * 0.5;
                    velocities[i3] -= (dx / dist) * force;
                    velocities[i3 + 1] -= (dy / dist) * force;
                }
                // Reset if out of bounds - respawn from box edges
                if (Math.abs(posArray[i3]) > 150 || Math.abs(posArray[i3 + 1]) > 150) {
                    const side = Math.floor(Math.random() * 4);
                    if (side === 0) {
                        posArray[i3] = (Math.random() - 0.5) * 40;
                        posArray[i3 + 1] = 30;
                    }
                    else if (side === 1) {
                        posArray[i3] = (Math.random() - 0.5) * 40;
                        posArray[i3 + 1] = -30;
                    }
                    else if (side === 2) {
                        posArray[i3] = -20;
                        posArray[i3 + 1] = (Math.random() - 0.5) * 40;
                    }
                    else {
                        posArray[i3] = 20;
                        posArray[i3 + 1] = (Math.random() - 0.5) * 40;
                    }
                    posArray[i3 + 2] = (Math.random() - 0.5) * 20;
                    const angle = Math.atan2(posArray[i3 + 1], posArray[i3]);
                    const speed = Math.random() * 0.3 + 0.1;
                    velocities[i3] = Math.cos(angle) * speed;
                    velocities[i3 + 1] = Math.sin(angle) * speed;
                    velocities[i3 + 2] = (Math.random() - 0.5) * 0.3;
                }
            }
            particlesGeometry.getAttribute('position').needsUpdate = true;
            renderer.render(scene, camera);
        };
        animate();
        // Cleanup function
        return () => {
            window.removeEventListener('resize', onWindowResize);
            renderer.dispose();
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }
    catch (error) {
        console.error("Error creating login background:", error);
        throw error;
    }
};
