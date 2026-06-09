// src/components/KpiCards.tsx
import type { WifiNetwork } from '../types/wifi';

interface KpiCardsProps {
  networks: WifiNetwork[];
}

export default function KpiCards({ networks }: KpiCardsProps) {
  const totalNetworks = networks.length;
  
  // Calcular la mejor señal (el número menos negativo)
  const bestRssi = totalNetworks > 0 
    ? Math.max(...networks.map(n => n.rssi)) 
    : -100;

  // Calcular la distancia más cercana
  const closestDistance = totalNetworks > 0 
    ? Math.min(...networks.map(n => n.distance_meters)) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Networks</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{totalNetworks}</p>
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Best Signal Strength</p>
        <p className="text-3xl font-bold text-emerald-600 mt-2">{bestRssi} dBm</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Closest Access Point</p>
        <p className="text-3xl font-bold text-indigo-600 mt-2">{closestDistance.toFixed(2)} m</p>
      </div>
    </div>
  );
}