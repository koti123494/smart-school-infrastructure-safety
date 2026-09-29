# Smart School Infrastructure & Safety Monitoring System

> **Enterprise SaaS Digital Operations Platform for K-12 & Higher Education Campuses**  
> *Developed for Smart India Hackathon (SIH), College Project Demonstrations, and Presentation to School Administrators.*

> **Prototype status:** The current frontend uses seeded, locally simulated application state. The optional API now validates sensor telemetry and demonstrates threshold alerts, but stores data in memory and has no authentication, persistent database connection, or configured AI/notification provider. Do not use it for real emergency response or production school operations.

---

## 🏛️ System Overview

The **Smart School Infrastructure & Safety Monitoring System** is a unified, centralized platform that bridges the gap between **IoT Hardware Telemetry**, **Life-Safety Monitoring**, **Staff Incident Reporting**, **Maintenance Work Order Execution**, and **Predictive Infrastructure Risk Analytics**.

Rather than treating school complaints as simple text tickets, this platform provides an **end-to-end digital twin** of the entire campus—enforcing automated SLA escalations when hazards occur and detecting recurring structural breakdowns before equipment fails.

---

## 🚀 Key Modules & Capabilities

### 1. 🎓 Enterprise Landing & Multi-Role Authentication
- Split-screen branded login portal for **Administrators**, **Teachers/Staff**, and **Maintenance Crews**.
- 1-click demo role switcher for live hackathon presentations.
- Multi-school governance switcher (e.g., *QIS Smart School Campus, Ongole*, *Delhi Public School*, *St. Xavier's International*).

### 2. 📊 Executive Operations Dashboard
- **Campus Safety Status Banner**: Dynamic status (`🟢 SAFE`, `🟠 WARNING`, `🔴 CRITICAL`) with heartbeat indicator.
- **Metric Cards**: Total Classrooms (24), Active IoT Sensors (48), Open Problems (12), Critical Alerts (2), In Progress (5), Resolved (126).
- **Live Campus Monitoring**: Real-time status for Smoke Detection, Ambient Temperature (28°C), Water Leakage, Electrical Substation Load (14.2A), and Power Supply stability (Mains + Solar Hybrid).
- **Live Activity Feed**: Time-stamped event stream with instant drilldown links.

### 3. 🗺️ Interactive Visual Campus Blueprint
- High-fidelity visual map showcasing:
  - *Main Administration Building*
  - *Academic Classrooms (Block A & Block B)*
  - *Science & STEM Laboratories*
  - *Central Library & Media Center*
  - *Canteen & Dining Pavilion*
  - *Playground & Athletic Track*
  - *Substation & Electrical Room*
  - *Overhead Water Tank & RO Filter Plant*
  - *School Entrance & Security Barriers*
- Live color-coded status badges (`🟢`, `🟠`, `🔴`) on every zone.
- Clickable zone modal with connected sensors, classroom lists, and open repair orders.

### 4. 🏫 Classroom Environmental Monitoring
- Detailed classroom cards (Rooms 101, 102, 103, 104, 201, 202, 203, 204, Chemistry Lab, Washroom Complex).
- Live metrics: Student attendance, temperature, smoke ppm, electrical circuit balance, water leakage, and open tickets.
- Dedicated classroom inspection drawer with telemetry sensor readings, assigned teachers, and inspection logs.

### 5. 🛠️ "Problems Inside Classrooms" Module
- Specialized reporting portal for classroom-specific defects:
  - Broken Fan, Broken Light, Damaged Desk, Damaged Chair, Projector, Smart Board, AC, Ceiling, etc.
  - Automatic generation of unique tracking identifiers: `SCH-2026-00124`.

### 6. 🌳 "School Surroundings Problems" Module
- Dedicated module for campus exterior infrastructure:
  - **Playground**: Broken equipment, damaged ground, water accumulation.
  - **Washrooms**: Pipe leakage, broken taps, blocked drainage, hygiene.
  - **Corridors**: Slippery floor, peeling plaster, flickering lights.
  - **Entrance / Gates**: Vehicle boom barrier motor, security lighting.
  - **Electrical & Substation**: Exposed wires, transformer panel warnings.
  - **Water Facilities**: Tank overflow, low booster pressure.

### 7. 📱 6-Step Guided Problem Reporting Wizard
- Mobile-optimized progressive reporting wizard:
  1. *Select Location* (Classroom, Lab, Library, Washroom, Playground, Corridor, etc.)
  2. *Select Problem Category*
  3. *Add Details & Priority* (Low, Medium, High, Critical)
  4. *Upload Evidence* (Camera upload / Sample evidence gallery picker)
  5. *Confirm Exact Location* on campus spatial breadcrumbs
  6. *Review & Submit* → Animated success state with status `REPORTED`.

### 8. 📋 Issue Management Dashboard
- Searchable, filterable data grid with columns:
  `Issue ID` | `Problem` | `Location` | `Reported By` | `Priority` | `Assigned To` | `Status`
- Lifecycle workflow: `REPORTED` → `ASSIGNED` → `IN PROGRESS` → `RESOLVED`.
- Administrators can directly reassign maintenance teams and adjust priorities.
- One-click CSV Export for administrative audit compliance.

### 9. 🧰 Maintenance Staff Dashboard
- Tailored for field technicians:
  - *Assigned Tasks*, *High Priority Tasks*, *Tasks In Progress*, *Completed Tasks*.
  - Work timer triggers: **Start Work**, **Update Progress**, **Mark Resolved**.
  - Upload **Before Photo** and **After Photo** for verification.
  - Digital resolution log notes (*e.g., "Fan motor replaced and tested successfully"*).

### 10. 👩‍🏫 Teacher / Staff Portal
- "My Reports" tracking list with status counters.
- Clear timeline visibility into when technician arrived, what parts were ordered, and expected completion.

### 11. 🚨 Safety Alert Center & 3-Tier Escalation Ladder
- Automated incident detection from IoT sensors and staff reports:
  - **Level 1**: Safety issue detected → Dispatched to School Administrator.
  - **Level 2**: If unacknowledged within 2 minutes → Auto-escalated to Maintenance Supervisor.
  - **Level 3**: If critical hazard remains unresolved → Escalated to School Management & Emergency Services.
- Multi-channel notification simulation: **Browser Web Push**, **Mobile Push (FCM)**, **Email Alert**, and **SMS Gateway**.

### 12. 📈 Infrastructure Analytics & Predictive Risk Analysis
- Visual graphs: Problems by Category, Problems by Campus Location, Monthly Incident Trends.
- Resolution performance metrics: Average response time (18 mins), resolution time (2.4 hours), SLA compliance (94.2%).
- **Recurring Problems Intelligence**:
  - Highlights repeated failures (*e.g., Classroom 103 Fan Failure – 5 times in 3 months*).
  - Smart Action Recommendation (*"Inspect or replace complete ceiling truss and hanger rather than repeated repairs"*).
  - Predictive failure probability and estimated cost savings.

### 13. 📡 IoT Sensor Network Dashboard
- Live device table displaying: Sensor ID, Location, Type, Current Value, Status (Online, Warning, Critical, Offline), Battery %, and Last Updated.
- Integrated **Live Fault Injection Simulator**:
  - *Inject Smoke Alert in Chemistry Lab*
  - *Trigger Washroom Water Leak*
  - *Simulate Substation Power Overload*
  - *Reset Campus to Baseline*

---

## 💻 Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Web Audio API |
| **Backend** | Dependency-free Node.js HTTP API, REST endpoints, Server-Sent Events |
| **Database** | In-memory demo API; `server/schema.sql` is a PostgreSQL starting schema and is not wired to the server |
| **IoT Connectivity** | HTTP telemetry ingestion prototype; no MQTT broker is configured |
| **Security** | Frontend role-switching is for demonstration only; API authentication and authorization are not implemented |

---

## 🏃 Quick Start Guide

### Production-style Backend (PostgreSQL + Prisma)

The original React application is preserved. The independent typed API lives in [`backend/README.md`](backend/README.md); it provides JWT auth, issue/report workflows, uploads, analytics, and Socket.IO. Configure `backend/.env`, apply Prisma migrations, then run `npm run dev` inside `backend/`. The frontend runs from the repository root and uses `http://localhost:5001` by default when an API token is present. It continues to use its local demo state when the API is unavailable.

### 1. Run the Frontend (Vite + React)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 2. Run the Optional Backend API Server
```bash
node server/server.js
```
The demo API starts at **`http://localhost:5000`**. It provides `GET /api/health`, `GET /api/dashboard`, `GET /api/sensors`, `GET /api/alerts`, `POST /api/sensors/data`, `GET /api/sensors/:sensorId/readings`, `PATCH /api/alerts/:id`, and the `GET /api/events` SSE stream. The older `POST /api/iot/telemetry` path remains as a compatibility alias.

The API validates sensor IDs, supported types, finite numeric values, locations, timestamps, and battery percentages. Readings and alerts exist only in server memory and are lost on restart. Set `SENSOR_THRESHOLDS_JSON` to a JSON object keyed by sensor type to enable configured warning/critical limits; no universal safety thresholds are assumed. `.env.example` documents the optional settings. Node does not load `.env` files by itself, so export the variables in your shell or use an approved environment loader.

Example telemetry request:
```json
{
  "sensor_id": "TMP-101",
  "sensor_type": "temperature",
  "value": 46,
  "unit": "C",
  "location": "Room 101, Block A"
}
```

Run backend tests with `npm test`. `POST /api/ai/analyze-alert` and `POST /api/ai/assistant` are backend-only integration boundaries; they return HTTP 503 with “Insufficient data available.” until a provider adapter is injected into `createAIService`. No provider is identifiable/configured in this repository. Put any future credential in the server environment as `AI_API_KEY`; never expose it to frontend code. Before production, add authentication and role authorization, persistent storage, rate limiting, validated school-specific thresholds, audit logs, and explicitly authorized notification/emergency integrations.

---

## 👥 Demo User Credentials

You can use the **1-Click Quick Role Switcher** in the top navigation bar or log in with these credentials:

| Role | Name | Email | Password |
|---|---|---|---|
| **Administrator** | Dr. Arvind Sharma | `admin@qisschool.edu` | `••••••••` |
| **Teacher / Staff** | Priya Sharma | `priya.sharma@qisschool.edu` | `••••••••` |
| **Maintenance Lead** | Rajesh Kumar | `rajesh.kumar@qisschool.edu` | `••••••••` |
| **Facility Supervisor** | Vikram Singh | `vikram.singh@qisschool.edu` | `••••••••` |

---

## 🎤 Presentation & Hackathon Pitch Script (SIH / College Viva)

1. **Problem Statement**:
   Schools and universities lose millions annually and endanger student safety due to reactive, disconnected maintenance reporting. A small water leak near an electrical conduit goes unnoticed until it causes a fire or power outage.
2. **The Solution**:
   **Smart School Infrastructure & Safety Monitoring System** unites proactive IoT sensory telemetry with human incident reporting. If smoke spikes in a science lab, the system initiates a 3-tier escalation ladder before anyone even smells it.
3. **Live Demonstration Flow**:
   - Show the **Executive Dashboard** with live metrics for QIS Smart School Campus.
   - Click the **Demo Simulator** in the top navbar and click **"Simulate Smoke in Lab"**.
   - Notice the **Pulsing Emergency Escalation Banner** appear with the 2-minute countdown timer.
   - Open the **Campus Map** and view the Science Block pulsating in red.
   - Switch to the **Maintenance Staff Portal** as Rajesh Kumar, click **Start Work**, upload an **After Photo**, and click **Mark Resolved**.
   - Review the **Analytics & Predictive Risk** tab to showcase how repeated fan repairs in Classroom 103 triggered an AI overhaul recommendation.
