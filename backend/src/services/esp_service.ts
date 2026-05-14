export const formatDataFromEsp = (data: string) => {
  const cleanData = data.replace(/"/g, '').trim();
  const lines = cleanData.split('\n');

  const networksArray = lines
    .filter(line => line.trim() !== '')
    .map(line => {
      const parts = line.split(',');
      
      return {
        ssid: parts[0] || "Desconocido",
        bssid: parts[1] || "00:00:00:00:00:00",
        rssi: parseInt(parts[2], 10) || -100,
        primary: parseInt(parts[3], 10) || 1,
        distance_meters: parseInt(parts[4], 10) || 0
      };
    });

  return networksArray;
};