import React, { useState } from 'react';
import EquationInput from './EquationInput';
import EquationList from './EquationList';
import VoiceInput from './VoiceInput';
import VideoUpload from './VideoUpload';
import AdvancedTools from './AdvancedTools';
import './Sidebar.css';

const Sidebar = ({
  equations,
  onAddEquation,
  onDeleteEquation,
  onUpdateEquationColor,
  onUpdateEquation,
  onClearGraph,
  onExportGraph,
  onVoiceInput,
  onVideoExtract
}) => {
  const [activeTab, setActiveTab] = useState('equations');

  const tabs = [
    { id: 'equations', label: 'Equations', icon: '📊' },
    { id: 'tools', label: 'Tools', icon: '🔧' },
    { id: 'analysis', label: 'Analysis', icon: '📈' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>WebMOS</h1>
        <p>Professional Mathematical Graphing</p>
      </div>

      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-content">
        {activeTab === 'equations' && (
          <>
            <EquationInput onAddEquation={onAddEquation} />

            <VoiceInput onVoiceInput={onVoiceInput} />

            <VideoUpload onVideoExtract={onVideoExtract} />

            <EquationList
              equations={equations}
              onDeleteEquation={onDeleteEquation}
              onUpdateEquationColor={onUpdateEquationColor}
              onUpdateEquation={onUpdateEquation}
            />
          </>
        )}

        {activeTab === 'tools' && (
          <AdvancedTools
            equations={equations}
            addEquation={onAddEquation}
          />
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-panel">
            <h3>Graph Analysis</h3>
            <div className="analysis-stats">
              <div className="stat-item">
                <span className="stat-label">Total Equations:</span>
                <span className="stat-value">{equations.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Visible Equations:</span>
                <span className="stat-value">{equations.filter(eq => eq.visible).length}</span>
              </div>
            </div>

            <div className="analysis-actions">
              <button className="analysis-button" onClick={onClearGraph}>
                Clear All
              </button>
              <button className="analysis-button export" onClick={onExportGraph}>
                Export Graph
              </button>
            </div>

            <div className="analysis-info">
              <h4>Supported Functions:</h4>
              <ul>
                <li>Trigonometric: sin, cos, tan, asin, acos, atan</li>
                <li>Hyperbolic: sinh, cosh, tanh</li>
                <li>Special: gamma, erf, besselj0, ellipticK</li>
                <li>Statistical: normalPDF, normalCDF</li>
                <li>Constants: pi, e, phi, c, h, hbar</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
