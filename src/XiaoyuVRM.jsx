import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { VRMLoader } from "@pixiv/three-vrm";

export default function XiaoyuVRM() {
  const mountRef = useRef();

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(0, 1.4, 2.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    let vrm;
    const loader = new VRMLoader();
    loader.load("/xiaoyu.vrm", (loadedVrm) => {
      vrm = loadedVrm;
      scene.add(vrm.scene);
      animate();
    });

    function animate() {
      requestAnimationFrame(animate);
      if (vrm) vrm.update(1/60); // update VRM animation
      renderer.render(scene, camera);
    }

    return () => {
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
} 