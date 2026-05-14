import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { formatDataFromEsp } from "./services/esp_service";
import path from 'path';
import fs from 'fs';
import { encryptLine } from './services/crypto_service';
import { decipherLine } from './services/crypto_service';

const app = express();
const port = 3000;
const CSV_FILE = path.join(__dirname, '../scan_history.csv');

if (!fs.existsSync(CSV_FILE)) {
  const headers = "timestamp,ssid,mac,rssi,channel,distance_meters\n";
  fs.writeFileSync(CSV_FILE, headers, 'utf8');
  console.log("CSV file created.");
}

let lastScan: any = [];

app.use(cors());
app.use(express.text({ type: '*/*' })); 
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('backend running...');
});

app.get('/api/scan_results', (req: Request, res: Response) => {
  res.json(lastScan);
});

const saveNetworksInCSV = (redesProcesadas: any[]) => {
  const timestamp = new Date().toISOString(); 
  let encrypted = "";

  redesProcesadas.forEach(red => {
    const lineaPlana = `${timestamp},"${red.ssid}",${red.bssid},${red.rssi},${red.primary},${red.distance_meters}`;
    encrypted += encryptLine(lineaPlana) + "\n";
  });

  fs.appendFile(CSV_FILE, encrypted, 'utf8', (err) => {
    if (err) console.error("Error:", err);
  });
};

app.post("/esp_info", (req: Request, res: Response) => {
  const data = req.body;
  
  console.log(`ESP32 info received:\n${data}`);

  if (!data || typeof data !== 'string' || data.trim() === ''){
    console.log("Error: invalid format");
    return res.status(400).send("Error: invalid format");
  }

  try {
    const dataFormated = formatDataFromEsp(data);
    
    lastScan = dataFormated;

    saveNetworksInCSV(dataFormated);

    console.log(`Networks processed`);
    res.send("OK");
  } catch (error: any) {
    console.log("Error in service formatDataFromEsp:", error.message);
    res.status(500).send("parse error");
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(400).send("Bad Request");
});

app.get('/api/download_csv', (req, res) => {
  if (!fs.existsSync(CSV_FILE)) {
    return res.status(404).send("File not found");
  }

  const enryptedContent = fs.readFileSync(CSV_FILE, 'utf8');
  const lineas = enryptedContent.split('\n');

  let decypheredCSV = "timestamp,ssid,mac,rssi,canal,distancia_m\n";

  lineas.forEach((linea, index) => {
    if (index === 0) return;
    
    if (linea.trim() !== "") {
      decypheredCSV += decipherLine(linea) + "\n";
    }
  });

  const fecha = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=netscan_report_${fecha}.csv`);
  
  res.send(decypheredCSV);
});

app.listen(3000, () => console.log('Backend listening in port 3000'));