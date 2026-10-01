import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Search,
  Filter,
  PlusCircle,
  Radio,
  Flame,
  Thermometer,
  Droplets,
  Zap,
  Activity,
  Battery,
  RotateCcw,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IoTSensor, SensorType } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const IoTSensorDashboard: React.FC = () => {
  const {
    sensors,
    triggerEmergencySimulation,
    resetSimulations,
    addSensor,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<'all' | SensorType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'warning' | 'critical' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddSensorOpen, setIsAddSensorOpen] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<'checking' | 'connected' | 'unavailable'>('checking');
  const [gatewaySummary, setGatewaySummary] = useState('Checking demo API...');

  useEffect(() => {
    const apiBaseUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
    let active = true;

    const refreshGateway = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/dashboard`);
        if (!response.ok) throw new Error('Demo API is unavailable.');
        const data = await response.json() as {
          sensors: { total: number };
          activeAlerts: number;
          mode: string;
        };
        if (!active) return;
        setGatewayStatus('connected');
        setGatewaySummary(`${data.sensors.total} API sensors · ${data.activeAlerts} active alerts · ${data.mode} mode`);
      } catch {
        if (!active) return;
        setGatewayStatus('unavailable');
        setGatewaySummary('Start the optional API to receive device telemetry.');
      }
    };

    void refreshGateway();
    const refreshInterval = window.setInterval(() => void refreshGateway(), 15000);
    const eventStream = new EventSource(`${apiBaseUrl}/api/events`);
    eventStream.addEventListener('sensor.updated', (event) => {
      const update = JSON.parse((event as MessageEvent<string>).data) as {
        sensor: { sensor_id: string; status: string };
      };
      setGatewayStatus('connected');
      setGatewaySummary(`Latest: ${update.sensor.sensor_id} · ${update.sensor.status}`);
    });
    eventStream.addEventListener('alert.created', () => {
      setGatewayStatus('connected');
      void refreshGateway();
    });
    eventStream.onerror = () => {
      if (active) setGatewayStatus('unavailable');
    };

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      eventStream.close();
    };
  }, []);

  // Form for new sensor
  const [newCode, setNewCode] = useState('TMP-205');
  const [newName, setNewName] = useState('Room 205 Ambient Thermostat');
  const [newLocation, setNewLocation] = useState('Room 205, Block A');
  const [newBuilding, setNewBuilding] = useState('Block A');
  const [newType, setNewType] = useState<SensorType>('temperature');

  const filteredSensors = sensors.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.sensorCode.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    total: sensors.length,
    online: sensors.filter((s) => s.status === 'online').length,
    warning: sensors.filter((s) => s.status === 'warning').length,
    critical: sensors.filter((s) => s.status === 'critical').length,
    offline: sensors.filter((s) => s.status === 'offline').length,
  };

  const handleCreateSensor = (e: React.FormEvent) => {
    e.preventDefault();
    addSensor({
      sensorCode: newCode,
      name: newName,
      location: newLocation,
      buildingName: newBuilding,
      type: newType,
      currentValue: newType === 'temperature' ? '26.8°C' : 'Normal',
      numericValue: newType === 'temperature' ? 26.8 : 0,
      unit: newType === 'temperature' ? '°C' : '',
      status: 'online',
      batteryPercentage: 98,
      lastUpdated: 'Just now',
    });
    setIsAddSensorOpen(false);
  };

  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="w-4 h-4 text-amber-500" />;
      case 'smoke':
        return <Flame className="w-4 h-4 text-rose-500" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-500" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'air_quality':
        return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'vibration':
        return <Activity className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              IoT Sensor Network &amp; Hardware Telemetry
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
              gatewayStatus === 'connected'
                ? 'bg-emerald-100 text-emerald-800'
                : gatewayStatus === 'checking'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                gatewayStatus === 'connected' ? 'bg-emerald-500' : gatewayStatus === 'checking' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              API {gatewayStatus}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Seeded dashboard sensors are demo data. API gateway: {gatewaySummary}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsAddSensorOpen(true)}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Sensor Node</span>
          </button>
        </div>
      </div>

      {/* Sensor Status Summary Strip (Requirement 18: Online, Offline, Warning, Critical) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('online')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'online' ? 'border-emerald-500 bg-emerald-50/70 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-emerald-700">Online &amp; Normal</span>
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            {counts.online}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Nominal thresholds</p>
        </div>

        <div
          onClick={() => setStatusFilter('warning')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'warning' ? 'border-amber-500 bg-amber-50/70 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-amber-700">Warning State</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 font-mono">
            {counts.warning}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High temp / electrical</p>
        </div>

        <div
          onClick={() => setStatusFilter('critical')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'critical' ? 'border-rose-500 bg-rose-50/70 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-rose-700">Critical Alarms</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">
            {counts.critical}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Requires immediate response</p>
        </div>

        <div
          onClick={() => setStatusFilter('offline')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'offline' ? 'border-slate-500 bg-slate-100 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600">Offline Nodes</span>
            <Wifi className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-2 font-mono">
            {counts.offline}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">0 packet loss detected</p>
        </div>
      </div>

      {/* Interactive Fault Injection Box */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">IoT Sensor Test Harness &amp; Gateway Injector</h3>
          </div>
          <p className="text-xs text-blue-200 mt-0.5">
            Use these controls to simulate hardware condition changes for the hackathon jury demonstration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => triggerEmergencySimulation('smoke')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Spike Smoke (Lab 2)</span>
          </button>
          <button
            onClick={() => triggerEmergencySimulation('water')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Trigger Washroom Water Leak</span>
          </button>
          <button
            onClick={resetSimulations}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sensor code or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Sensor Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | SensorType)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium"
          >
            <option value="all">All Sensor Types</option>
            <option value="temperature">Temperature Sensors</option>
            <option value="smoke">Smoke / Fire Detectors</option>
            <option value="water">Water Leak Probes</option>
            <option value="electrical">Electrical Current Meters</option>
            <option value="air_quality">Air Quality (CO2/PM2.5)</option>
            <option value="vibration">Vibration Monitors</option>
          </select>
        </div>
      </div>

      {/* Connected Devices Table (Requirement 18) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 pl-5">Sensor ID</th>
                <th className="p-3.5">Device Name</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Sensor Type</th>
                <th className="p-3.5">Current Value</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Battery</th>
                <th className="p-3.5 text-right pr-5">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSensors.map((sensor) => (
                <tr key={sensor.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 pl-5 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {sensor.sensorCode}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{sensor.name}</td>
                  <td className="p-3.5 text-slate-600">{sensor.location}</td>
                  <td className="p-3.5 capitalize text-slate-700 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      {getSensorIcon(sensor.type)}
                      {sensor.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {sensor.currentValue}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <StatusBadge status={sensor.status} size="sm" />
                  </td>
                  <td className="p-3.5 text-slate-600 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                      <Battery className="w-3.5 h-3.5 text-slate-400" />
                      {sensor.batteryPercentage}%
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-5 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {sensor.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sensor Dialog Modal */}
      {isAddSensorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4 animate-fadeIn text-xs">
            <h3 className="text-base font-bold text-slate-900">Provision New IoT Sensor Node</h3>
            <p className="text-slate-500">Configure device credentials and hardware thresholds</p>

            <form onSubmit={handleCreateSensor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sensor Code</label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Device Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sensor Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as SensorType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="temperature">Temperature</option>
                    <option value="smoke">Smoke</option>
                    <option value="water">Water Leakage</option>
                    <option value="electrical">Electrical Current</option>
                    <option value="air_quality">Air Quality</option>
                    <option value="vibration">Vibration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Building</label>
                  <input
                    type="text"
                    required
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Details</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSensorOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800"
                >
                  Provision Sensor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
