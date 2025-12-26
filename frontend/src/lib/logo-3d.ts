import * as THREE from "three";

export const create3DLogo = (container: HTMLDivElement) => {
    try {
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 120;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Create logo group
        const logoGroup = new THREE.Group();
        scene.add(logoGroup);

        // Create main logo card (extruded shape with depth)
        const cardGeometry = new THREE.BoxGeometry(80, 80, 8);
        const cardMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.4,
            emissive: 0x111111,
        });
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        logoGroup.add(card);

        // Create glow sphere behind card for accent lighting
        const glowGeometry = new THREE.SphereGeometry(95, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00d9ff,
            transparent: true,
            opacity: 0.15,
        });
        const glow1 = new THREE.Mesh(glowGeometry, glowMaterial);
        glow1.position.z = -20;
        logoGroup.add(glow1);

        // Add violet glow accent
        const glowMaterial2 = new THREE.MeshBasicMaterial({
            color: 0x6600ff,
            transparent: true,
            opacity: 0.1,
        });
        const glow2 = new THREE.Mesh(
            new THREE.SphereGeometry(85, 32, 32),
            glowMaterial2
        );
        glow2.position.z = 25;
        logoGroup.add(glow2);

        // Create canvas texture for logo text
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d")!;

        // Draw logo on canvas
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 512, 512);

        // Draw "⚡" symbol
        ctx.font = "bold 180px Arial";
        ctx.fillStyle = "#00d9ff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚡", 256, 180);

        // Draw text
        ctx.font = "bold 60px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("HackQuest", 256, 350);

        ctx.font = "40px Arial";
        ctx.fillStyle = "#00d9ff";
        ctx.fillText("AI", 256, 420);

        const texture = new THREE.CanvasTexture(canvas);
        const frontMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: 0.2,
            roughness: 0.5,
            emissive: 0x1a1a1a,
        });

        // Apply texture to front of card
        cardMaterial.color.set(0xfafafa);
        const materials = [
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                metalness: 0.4,
                roughness: 0.6,
            }),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                metalness: 0.4,
                roughness: 0.6,
            }),
            new THREE.MeshStandardMaterial({
                color: 0x0f0f0f,
                metalness: 0.3,
                roughness: 0.7,
            }),
            new THREE.MeshStandardMaterial({
                color: 0x0f0f0f,
                metalness: 0.3,
                roughness: 0.7,
            }),
            frontMaterial,
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                metalness: 0.4,
                roughness: 0.6,
            }),
        ];

        const logoCard = new THREE.Mesh(cardGeometry, materials);
        logoGroup.remove(card);
        logoGroup.add(logoCard);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        scene.add(directionalLight);

        // Add rim light from the side with accent color
        const rimLight = new THREE.DirectionalLight(0x00d9ff, 0.4);
        rimLight.position.set(-150, 50, 50);
        scene.add(rimLight);

        // Add violet accent light
        const accentLight = new THREE.DirectionalLight(0x6600ff, 0.3);
        accentLight.position.set(150, -50, 50);
        scene.add(accentLight);

        // Create shadow/glow underneath
        const shadowGeometry = new THREE.PlaneGeometry(100, 20);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
        });
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.position.y = -55;
        shadow.position.z = -5;
        logoGroup.add(shadow);

        // Handle container resize
        const handleResize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        // Animation loop
        let time = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.008;

            // Smooth Y-axis rotation (primary rotation)
            logoGroup.rotation.y = time * 0.5;

            // Subtle X-axis tilt
            logoGroup.rotation.x = Math.sin(time * 0.25) * 0.1;

            // Gentle floating motion
            logoGroup.position.y = Math.sin(time * 0.3) * 8;

            renderer.render(scene, camera);
        };

        animate();
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            cardGeometry.dispose();
            texture.dispose();
            materials.forEach((m) => m.dispose());
            shadowGeometry.dispose();
            shadowMaterial.dispose();
            glowGeometry.dispose();
            glowMaterial.dispose();
            glowMaterial2.dispose();

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    } catch (error) {
        console.error("Error creating 3D logo:", error);
        throw error;
    }
};
