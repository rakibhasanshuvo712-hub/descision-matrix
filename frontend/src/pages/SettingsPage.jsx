import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FiSettings,
  FiCpu,
  FiServer,
  FiDownload,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';
import { TbGridDots } from 'react-icons/tb';

const SettingsPage = () => {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [aiProvider, setAiProvider] = useState('gemini');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setLoadingHealth(true);
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (err) {
      setHealth({ status: 'offline', error: err.message });
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/decisions');
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `decision_matrix_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export data: ' + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          System & <span className="text-cyan-400">AI Configuration</span>
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60 mt-1">
          Diagnostics, cloud environment status, and data export.
        </p>
      </div>

      {/* Backend & Health Status */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <FiServer className="w-4 h-4 text-cyan-400" />
            <span>Backend Health & Runtime</span>
          </h3>
          <button
            onClick={checkHealth}
            disabled={loadingHealth}
            className="btn btn-ghost btn-xs rounded-lg gap-1"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
            <span>Ping Server</span>
          </button>
        </div>

        {health && (
          <div className="p-4 rounded-xl bg-base-300/40 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-base-content/70">Health Status:</span>
              <span
                className={`badge badge-sm font-bold ${
                  health.status === 'healthy' ? 'badge-success' : 'badge-error'
                }`}
              >
                {health.status || 'Offline'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base-content/70">Database Mode:</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {health.database?.host || 'in-memory-engine'} ({health.database?.name || 'fallback'})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base-content/70">Active AI Architecture:</span>
              <span className="font-mono font-semibold">
                {health.hasApiKey ? `${health.aiProvider} (API Key Configured)` : 'Standalone Multi-Criteria Engine'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base-content/70">Server Uptime:</span>
              <span className="font-mono text-base-content/60">
                {Math.round(health.uptime || 0)} seconds
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Railway & Deployment Guidance */}
      <div className="glass-panel p-6 space-y-3">
        <h3 className="font-bold text-base flex items-center gap-2">
          <FiCpu className="w-4 h-4 text-indigo-400" />
          <span>Railway & Cloud Production Ready</span>
        </h3>
        <p className="text-xs text-base-content/70 leading-relaxed">
          DECISION MATRIX is configured for one-click deployment on Railway. The backend dynamically
          listens to Railway's <code>PORT</code> variable, serves the compiled Vite frontend production build
          statically, and connects seamlessly to MongoDB Atlas or Railway MongoDB plugins.
        </p>
        <div className="p-3 rounded-xl bg-base-300/30 text-[11px] font-mono text-cyan-400">
          railway.json & Procfile included • npm run build:all • Single container deployment
        </div>
      </div>

      {/* Data Export / Backup */}
      <div className="glass-panel p-6 space-y-3">
        <h3 className="font-bold text-base flex items-center gap-2">
          <FiDownload className="w-4 h-4 text-emerald-400" />
          <span>Data Export & Archiving</span>
        </h3>
        <p className="text-xs text-base-content/70 leading-relaxed">
          Download a complete JSON export of all your decisions, evaluations, criteria scores, and reasoning logs.
        </p>
        <button
          onClick={handleExportData}
          className="btn btn-outline btn-sm rounded-xl gap-1.5 text-xs font-semibold"
        >
          <FiDownload className="w-3.5 h-3.5" />
          <span>Export All Decisions (JSON)</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
