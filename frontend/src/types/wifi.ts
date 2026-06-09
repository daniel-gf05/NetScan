export interface WifiNetwork {
    ssid: string;
    bssid: string;
    rssi: number;
    primary: number;
    distance_meters: number; 
}