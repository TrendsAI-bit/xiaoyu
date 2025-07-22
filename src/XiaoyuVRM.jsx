import React, { useEffect, useRef } from "react";

export default function XiaoyuVRM() {
  const mountRef = useRef();

  useEffect(() => {
    let renderer, scene, camera, vrm;
    let cleanup = () => {};

    if (typeof window !== "undefined") {
      Promise.all([
        import("three"),
        import("@pixiv/three-vrm")
      ]).then(([THREE, VRMExports]) => {
        const { VRMLoader } = VRMExports;
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
        loader.load("/xiaoyu.vrm", (loadedVrm) => {
          vrm = loadedVrm;
          scene.add(vrm.scene);
          animate();
        });

        function animate() {
          requestAnimationFrame(animate);
          if (vrm) vrm.update(1/60);
          renderer.render(scene, camera);
        }

        cleanup = () => {
          renderer.dispose();
          if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
        };
      });
    }

    return () => cleanup();
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
} 