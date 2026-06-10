```markdown
# NetScan: Sistema Perimetral de Auditoría de Radiofrecuencia y Diagnóstico de Red

**NetScan** es una solución de auditoría de seguridad y diagnóstico de redes inalámbricas basada en una arquitectura local descentralizada (*Edge-to-Server*). El sistema utiliza un dispositivo físico perimetral microcontrolado (ESP32) para la captura in situ de métricas de radiofrecuencia (RF), un servidor de persistencia criptográfica en el *backend* (Node.js/Express) y una interfaz analítica en tiempo real en el *frontend* (React/Vite).

Diseñado bajo la filosofía de **Network Appliance**, NetScan opera de forma 100% aislada de la red exterior (On-Premise), garantizando la integridad, soberanía y confidencialidad de los datos del espectro electromagnético auditado.

---

## 🚀 Características Principales

* **Edge Computing (ESP32):** Captura pasiva del espectro Wi-Fi en la banda de 2.4 GHz. Procesamiento perimetral del RSSI y cálculo nativo de la distancia estimada mediante el modelo logarítmico de pérdida de trayectoria (*Log-Distance Path Loss Model*).
* **Cifrado en Reposo (Encryption at Rest):** Persistencia forense inmune a filtraciones. El backend cifra línea por línea los datos en formato **AES-256-CBC** antes de escribirlos en el almacenamiento físico (`.csv`).
* **Descifrado dinámico en RAM:** Endpoint seguro que descifra el histórico de capturas al vuelo directamente en memoria RAM al solicitar la descarga, garantizando que los datos nunca toquen el disco duro en texto plano.
* **Dashboard en Tiempo Real:** Visualización fluida de la fluctuación de la señal (dBm) mediante gráficos interactivos y telemetría de red por tarjetas analíticas.

---

## 🏗️ Arquitectura del Sistema

El proyecto está estructurado en un monorepo que divide claramente las responsabilidades de las tres capas del sistema:

```text
       [ Capa Física / Edge ]
             ESP32 (C)
                 │
                 │ (HTTP POST /esp_info con RSSI Bruto)
                 ▼
     [ Capa de Persistencia y Control ]
          Node.js + Express (TS)
                 │
                 ├──► Cifrado AES-256-CBC ──► [ historial_escaneos.csv ] (Cifrado)
                 │
                 │ (HTTP GET /api/scan_results en RAM)
                 ▼
       [ Capa de Presentación ]
           React + Vite (TS) ◄── (Dashboard & Descarga de Reportes)

```

---

## 🛠️ Stack Tecnológico

* **Firmware:** C (Framework ESP-IDF v6.0.1), componentes `esp-tls` y `mbedtls` para la gestión de conexiones seguras.
* **Backend:** Node.js, Express, TypeScript, API nativa `crypto` (Criptografía) y `fs` (File System).
* **Frontend:** React, Vite, TypeScript, Tailwind CSS, Recharts (Motor de gráficos de alto rendimiento).

---

## ⚙️ Configuración del Entorno Local

### Requisitos Previos

* Node.js (versión 18 o superior)
* GNU/Linux Fedora (entorno de desarrollo recomendado)
* ESP-IDF SDK configurado para el flasheo del microcontrolador.

### 1. Variables de Entorno (`.env`)

Crea un archivo `.env` dentro de la carpeta `/backend` para configurar las llaves criptográficas estrictas del sistema:

```env
PORT=3000
ENCRYPTION_KEY=12345678901234567890123456789012 # Clave exacta de 32 bytes para AES-256
ENCRYPTION_IV=1234567890123456                  # Vector de inicialización de 16 bytes

```

### 2. Despliegue del Servidor (Backend)

Navega a la carpeta del servidor, instala las dependencias y arranca el entorno de desarrollo:

```bash
cd backend
npm install
npm run dev

```

*El backend se inicializará automáticamente, verificará la integridad del sistema de archivos y levantará el socket de escucha para el ESP32 y el Frontend.*

### 3. Despliegue del Dashboard (Frontend)

En una nueva terminal, navega a la carpeta de la interfaz, instala los paquetes y levanta el servidor de desarrollo de Vite:

```bash
cd frontend
npm install
npm run dev

```

*Abre tu navegador en `http://localhost:5173` para visualizar el panel de control.*

---

## 🔒 Esquema de Seguridad Criptográfica

NetScan implementa un flujo de datos seguro con cero persistencia de texto claro en el servidor anfitrión:

1. **Ingreso:** El backend recibe el texto crudo del ESP32, valida la estructura y la parsea en memoria.
2. **Cifrado:** Cada registro es transformado en una cadena hexadecimal ilegible mediante `aes-256-cbc`.
3. **Persistencia:** La cadena cifrada se concatena al archivo `historial_escaneos.csv`.
4. **Extracción Forense:** Al acceder a `/api/download_csv`, el backend lee las líneas criptográficas, ejecuta el inverso (`decipher`), reconstruye la estructura CSV legítima directamente en memoria y fuerza la descarga del reporte al cliente en un proceso transparente y seguro.

---

## 📂 Estructura del Repositorio

```text
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── crypto_service.ts  # Algoritmos de cifrado/descifrado AES
│   │   │   └── esp_service.ts     # Parseo sintáctico de los datos del chip
│   │   └── server.ts              # Servidor Express, Middlewares y Endpoints
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Interfaz reactiva y lógica de Recharts
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── firmware_esp32/
    ├── main/
    │   ├── main.c                 # Lógica de escaneo Wi-Fi y Cliente HTTP
    │   └── CMakeLists.txt         # Inyección de dependencias (esp-tls, mbedtls)
    └── CMakeLists.txt

```

---

## 📊 Verificación del Cifrado en Reposo

Para verificar la seguridad de la persistencia local en el sistema de archivos de la máquina de auditoría, ejecute:

```bash
cat backend/historial_escaneos.csv

```

**Resultado en disco (Datos Cifrados):**

```text
4a8b9f2c3e1d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a
8fa12b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a
```