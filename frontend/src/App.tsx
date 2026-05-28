// src/App.tsx
import { useState, useEffect } from 'react';
import type { WifiNetwork } from './types/wifi';
import type { HistoryPoint } from './types/HistoryPoint';
import KpiCards from './components/KpiCard';
import WifiCharts from './components/WifiChart';
import WifiTable from './components/WifiTable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/scan_results`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data && Array.isArray(data)) {
          setNetworks(data);
          setError(null);

          const now = new Date();
          const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

          const newHistoryPoint: HistoryPoint = { time: timeString };

          data.forEach((net: WifiNetwork) => {
            const identifier = net.ssid && net.ssid !== "Desconocido" ? net.ssid : net.bssid;
            newHistoryPoint[identifier] = net.rssi;
          });

          setHistory(prevHistory => {
            const updatedHistory = [...prevHistory, newHistoryPoint];
            return updatedHistory.length > 15 ? updatedHistory.slice(updatedHistory.length - 15) : updatedHistory;
          });
        }
      } catch (err) {
        console.error("Error fetching networks:", err);
        setError("Connection to the local server lost");
      }
    };

    fetchNetworks();
    const interval = setInterval(fetchNetworks, 10000);
    return () => clearInterval(interval);
  }, []);

  const uniqueNetworks = Array.from(new Set(networks.map(n => n.ssid && n.ssid !== "Desconocido" ? n.ssid : n.bssid)));

  return (
    <div className="h-screen max-h-screen bg-slate-50 p-6 flex flex-col overflow-hidden font-sans text-slate-800">
      <div className="max-w-7xl w-full mx-auto flex flex-col h-full overflow-hidden">

        <div className="flex justify-between items-center mb-4 shrink-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            📡 RF Audit Dashboard
          </h1>
          <a
            href={`${API_BASE_URL}/api/download_csv`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors duration-200 flex items-center space-x-2 text-sm"
          >
            <span>Download report CSV</span>
          </a>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 shadow-sm shrink-0">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {networks.length === 0 && !error ? (
          <div className="flex items-center justify-center flex-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-slate-500 font-medium">Waiting for the first read from the ESP32...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden gap-4">

            <KpiCards networks={networks} />

            <WifiCharts history={history} uniqueNetworks={uniqueNetworks} />

            <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
              <WifiTable networks={networks} />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;