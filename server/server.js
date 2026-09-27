/**
 * SMART SCHOOL INFRASTRUCTURE & SAFETY MONITORING SYSTEM
 * Express.js + REST API + WebSocket Server (Requirements 24 & 26)
 */

import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Enable CORS for local Vite dev server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart School Infrastructure & Safety Monitoring System',
    version: '2.4.0',
    campus: 'QIS Smart School Campus, Ongole, Andhra Pradesh',
    iotGateway: 'ESP32 / MQTT Bridge Active',
    activeSensors: 48,
    timestamp: new Date().toISOString(),
  });
});

// Mock MQTT Ingest Endpoint (For ESP32 / Raspberry Pi IoT Gateway)
app.post('/api/iot/telemetry', (req, res) => {
  const { sensorCode, value, unit, type, location } = req.body;
  console.log(`[MQTT INGEST] Sensor: ${sensorCode} | Value: ${value}${unit || ''} | Location: ${location}`);

  // Automated Rule Engine Check
  let alertTriggered = false;
  if (type === 'smoke' && Number(value) > 35) {
    alertTriggered = true;
    console.warn(`[RULE ENGINE ALERT] Critical Smoke Level detected by ${sensorCode}`);
  }

  res.status(200).json({
    received: true,
    sensorCode,
    alertTriggered,
    processedAt: new Date().toISOString(),
  });
});

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  res.json({
    token: 'jwt-mock-enterprise-token-' + Date.now(),
    user: {
      name: role === 'admin' ? 'Dr. Arvind Sharma' : role === 'teacher' ? 'Priya Sharma' : 'Rajesh Kumar',
      email: email || 'admin@qisschool.edu',
      role: role || 'admin',
      school: 'QIS Smart School Campus',
    },
  });
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`Smart School Infrastructure & Safety Backend Server`);
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`IoT Gateway MQTT Endpoint: http://localhost:${PORT}/api/iot/telemetry`);
  console.log(`================================================================`);
});
