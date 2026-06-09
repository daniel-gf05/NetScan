import type { WifiNetwork } from '../types/wifi';

interface WifiTableProps {
  networks: WifiNetwork[];
}

export default function WifiTable({ networks }: WifiTableProps) {
  const getSignalBgColor = (rssi: number) => {
    if (rssi > -70) return 'bg-emerald-500';
    if (rssi > -85) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSignalTextColor = (rssi: number) => {
    if (rssi > -70) return 'text-emerald-600';
    if (rssi > -85) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {networks.map((net) => {
        const percentage = Math.max(0, Math.min(100, 100 - ((net.rssi + 50) * -2)));
        
        return (
          <div 
            key={net.bssid} 
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-2 truncate" title={net.ssid || 'Red Oculta'}>
              {net.ssid || 'Red Oculta'}
            </h2>
            
            <div className="space-y-1 mb-4">
              <p className="text-sm text-slate-500 flex justify-between">
                <span className="font-medium text-slate-400">MAC:</span> 
                <span className="font-mono text-slate-700">{net.bssid}</span>
              </p>
              <p className="text-sm text-slate-500 flex justify-between">
                <span className="font-medium text-slate-400">Channel:</span> 
                <span className="text-slate-700 font-semibold">{net.primary}</span>
              </p>
              <p className="text-sm text-slate-500 flex justify-between">
                <span className="font-medium text-slate-400">Distance:</span> 
                <span className="text-slate-700 font-semibold">{net.distance_meters} m</span>
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Signal (RSSI)</span>
                <span className={`text-sm font-bold ${getSignalTextColor(net.rssi)}`}>
                  {net.rssi} dBm
                </span>
              </div>
              
              <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${getSignalBgColor(net.rssi)}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}