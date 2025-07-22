import React from "react";
import XiaoyuVRM from "./XiaoyuVRM";

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-blue-100 to-purple-200 font-sans">
      <header className="w-full max-w-3xl flex justify-between items-center py-8 px-4">
        <h1 className="text-4xl font-extrabold text-pink-600 drop-shadow">Xiaoyu AI Companion</h1>
        <button className="bg-white/70 backdrop-blur text-pink-600 px-6 py-2 rounded-xl shadow font-semibold border border-pink-200 hover:bg-pink-100 transition">Connect Wallet</button>
      </header>
      <main className="w-full max-w-3xl flex flex-col items-center gap-8 px-4">
        <div className="w-full h-[480px] bg-white/60 rounded-3xl shadow-lg flex items-center justify-center mb-4 backdrop-blur">
          <div className="w-[320px] h-[440px]">
            <XiaoyuVRM />
          </div>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white/80 rounded-2xl shadow p-6 flex flex-col items-center justify-center backdrop-blur">
            <div className="text-lg font-bold text-purple-700">$NAME</div>
            <div className="text-2xl font-extrabold text-green-600">$0.00</div>
            <div className="text-gray-500">Market Cap: $0</div>
          </div>
          <div className="flex-1 bg-white/80 rounded-2xl shadow p-6 flex flex-col gap-4 backdrop-blur">
            <div className="flex-1 min-h-[120px] text-gray-700 bg-white/60 rounded-xl p-4">Chat history will appear here.</div>
            <form className="flex gap-2">
              <input className="flex-1 border border-pink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300" placeholder="Say hi to Xiaoyu..." />
              <button className="bg-pink-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-pink-600 transition">Send</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
