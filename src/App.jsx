import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

useGLTF.preload("/xiaoyu.glb");

function XiaoyuModel() {
  const { scene } = useGLTF("/xiaoyu.glb");
  return <primitive object={scene} />;
}

function Xiaoyu3D() {
  return (
    <Canvas camera={{ position: [0, 1.5, 3] }} style={{ width: "100%", height: "100%" }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[0, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <XiaoyuModel />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <header className="w-full max-w-2xl flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-red-600">Xiaoyu AI Companion</h1>
        <button className="bg-yellow-400 text-white px-4 py-2 rounded shadow">Connect Wallet</button>
      </header>
      <main className="w-full max-w-2xl flex flex-col items-center gap-6 mt-8">
        <div className="w-full h-96 bg-white rounded shadow flex items-center justify-center">
          <Xiaoyu3D />
        </div>
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">$NAME Price:</span>
            <span className="text-green-600">$0.00</span>
            <span className="text-gray-400">(Market Cap: $0)</span>
          </div>
        </div>
        <div className="w-full bg-white rounded shadow p-4 flex flex-col gap-2">
          <div className="flex-1 min-h-[100px] text-gray-600">Chat history will appear here.</div>
          <form className="flex gap-2">
            <input className="flex-1 border rounded px-2 py-1" placeholder="Say hi to Xiaoyu..." />
            <button className="bg-red-500 text-white px-4 py-1 rounded">Send</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
