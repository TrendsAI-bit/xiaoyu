import React, { useEffect, useRef, useState } from "react";

export default function XiaoyuVRM() {
  const mountRef = useRef();
  const [error, setError] = useState(null);

  useEffect(() => {
    let renderer, scene, camera, vrm;
    let cleanup = () => {};

    if (typeof window !== "undefined") {
      Promise.all([
        import("three"),
        import("@pixiv/three-vrm")
      ]).then(([THREE, VRM]) => {
        // Robustly get VRMLoader
        let VRMLoader = VRM.VRMLoader || (VRM.default && VRM.default.VRMLoader);
        if (!VRMLoader) {
          // Log the import for debugging
          console.error("VRM import structure:", VRM);
          setError("Failed to load VRMLoader from @pixiv/three-vrm. See console for details.");
          return;
        }
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        camera.position.set(0, 1.4, 2.5);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));

        const loader = new VRMLoader();
        loader.load(
          "/xiaoyu.vrm",
          (loadedVrm) => {
            vrm = loadedVrm;
            scene.add(vrm.scene);
            animate();
          },
          undefined,
          (err) => {
            setError("Failed to load VRM model. See console for details.");
            console.error("VRM load error:", err);
          }
        );

        function animate() {
          requestAnimationFrame(animate);
          if (vrm) vrm.update(1 / 60);
          renderer.render(scene, camera);
        }

        cleanup = () => {
          renderer.dispose();
          if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
        };
      }).catch((err) => {
        setError("Failed to import Three.js or three-vrm. See console for details.");
        console.error("Dynamic import error:", err);
      });
    }

    return () => cleanup();
  }, []);

  if (error) {
    return <div className="text-red-600 font-bold p-4">{error}</div>;
  }

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
} 