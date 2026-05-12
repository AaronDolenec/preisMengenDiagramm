import React, { useState, useMemo, useRef } from 'react';
import { Plus, Trash2, Download, BookOpen, Scale, ArrowRightLeft, Copy, CopyPlus, LayoutGrid, Moon, Sun } from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const calcSlope = (elasticity) => {
  if (elasticity >= 99) return 0.001;
  if (elasticity <= 1) return 1000;
  return Math.tan(((100 - elasticity) / 100) * (Math.PI / 2));
};

const calcIntercept = (type, position, b) => {
  if (type === 'demand') {
    return position + (b * position);
  } else {
    return (100 - position) - (b * position);
  }
};

const calcCurveAnchor = (type, position) => {
  if (type === 'demand') {
    return { q: position, p: position };
  }
  return { q: position, p: 100 - position };
};

const calcCurveSlope = (type, elasticity, flipped) => {
  const baseSlope = calcSlope(elasticity);
  const orientation = type === 'demand' ? -1 : 1;
  const mirror = flipped ? -1 : 1;
  return baseSlope * orientation * mirror;
};

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    localStorage.setItem('darkMode', value ? 'true' : 'false');
  };
  const [charts, setCharts] = useState([
    {
      id: 'chart-1',
      title: 'Markt A (Ausgangslage)',
      curves: [
        { id: 'd1', type: 'demand', name: 'D', position: 50, elasticity: 50, color: '#3b82f6', flipped: false },
        { id: 's1', type: 'supply', name: 'S', position: 50, elasticity: 50, color: '#ef4444', flipped: false },
      ],
      policy: { type: 'none', price: 50 }
    }
  ]);

  const [activeChartId, setActiveChartId] = useState(charts[0].id);
  const activeChart = charts.find(c => c.id === activeChartId) || charts[0];

  const addChart = () => {
    const newChart = {
      id: Date.now().toString(),
      title: `Markt ${charts.length + 1}`,
      curves: [
        { id: Date.now().toString() + 'd', type: 'demand', name: 'D', position: 50, elasticity: 50, color: '#3b82f6', flipped: false },
        { id: Date.now().toString() + 's', type: 'supply', name: 'S', position: 50, elasticity: 50, color: '#ef4444', flipped: false },
      ],
      policy: { type: 'none', price: 50 }
    };
    setCharts([...charts, newChart]);
    setActiveChartId(newChart.id);
  };

  const duplicateChart = (id) => {
    const chartToCopy = charts.find(c => c.id === id);
    if (!chartToCopy) return;
    const newChart = {
      ...JSON.parse(JSON.stringify(chartToCopy)),
      id: Date.now().toString(),
      title: `${chartToCopy.title} (Kopie)`
    };
    setCharts([...charts, newChart]);
    setActiveChartId(newChart.id);
  };

  const deleteChart = (id) => {
    if (charts.length <= 1) return;
    const newCharts = charts.filter(c => c.id !== id);
    setCharts(newCharts);
    if (activeChartId === id) setActiveChartId(newCharts[0].id);
  };

  const updateActiveChart = (updates) => {
    setCharts(charts.map(c => c.id === activeChartId ? { ...c, ...updates } : c));
  };

  const updateCurve = (id, field, value) => {
    updateActiveChart({
      curves: activeChart.curves.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const addCurve = (type) => {
    const isDemand = type === 'demand';
    const existingCount = activeChart.curves.filter(c => c.type === type).length;
    const newCurve = {
      id: Date.now().toString(),
      type,
      name: isDemand ? (existingCount === 0 ? 'D' : `D${existingCount + 1}`) : (existingCount === 0 ? 'S' : `S${existingCount + 1}`),
      position: isDemand ? 70 : 30,
      elasticity: 50,
      color: COLORS[activeChart.curves.length % COLORS.length],
      flipped: false
    };
    updateActiveChart({ curves: [...activeChart.curves, newCurve] });
  };

  const removeCurve = (id) => {
    updateActiveChart({ curves: activeChart.curves.filter(c => c.id !== id) });
  };

  const loadScenario = (scenario) => {
    switch(scenario) {
      case 'initial':
        updateActiveChart({
          curves: [
            { id: 'd1', type: 'demand', name: 'D', position: 50, elasticity: 50, color: '#3b82f6', flipped: false },
            { id: 's1', type: 'supply', name: 'S', position: 50, elasticity: 50, color: '#ef4444', flipped: false },
          ], policy: { type: 'none', price: 50 }
        }); break;
      case 'inelastic_demand':
        updateActiveChart({
          curves: [
            { id: 'd1', type: 'demand', name: 'D', position: 50, elasticity: 0, color: '#3b82f6', flipped: false },
            { id: 's1', type: 'supply', name: 'S', position: 50, elasticity: 50, color: '#ef4444', flipped: false },
          ], policy: { type: 'none', price: 50 }
        }); break;
      case 'elastic_supply':
        updateActiveChart({
          curves: [
            { id: 'd1', type: 'demand', name: 'D', position: 50, elasticity: 50, color: '#3b82f6', flipped: false },
            { id: 's1', type: 'supply', name: 'S', position: 50, elasticity: 100, color: '#ef4444', flipped: false },
          ], policy: { type: 'none', price: 50 }
        }); break;
      case 'demand_shift':
        updateActiveChart({
          curves: [
            { id: 'd1', type: 'demand', name: 'D₁', position: 40, elasticity: 50, color: '#93c5fd', flipped: false },
            { id: 'd2', type: 'demand', name: 'D₂', position: 70, elasticity: 50, color: '#2563eb', flipped: false },
            { id: 's1', type: 'supply', name: 'S', position: 50, elasticity: 50, color: '#ef4444', flipped: false },
          ], policy: { type: 'none', price: 50 }
        }); break;
      case 'supply_shift':
        updateActiveChart({
          curves: [
            { id: 'd1', type: 'demand', name: 'D', position: 50, elasticity: 50, color: '#3b82f6', flipped: false },
            { id: 's1', type: 'supply', name: 'S₁', position: 30, elasticity: 50, color: '#fca5a5', flipped: false },
            { id: 's2', type: 'supply', name: 'S₂', position: 70, elasticity: 50, color: '#dc2626', flipped: false },
          ], policy: { type: 'none', price: 50 }
        }); break;
      case 'tax':
        updateActiveChart({
          curves: [
            { id: 'd1', type: 'demand', name: 'D', position: 50, elasticity: 50, color: '#3b82f6', flipped: false },
            { id: 's1', type: 'supply', name: 'S', position: 50, elasticity: 50, color: '#ef4444', flipped: false },
          ], policy: { type: 'ceiling', price: 60 }
        }); break;
      case 'subsidy':
        updateActiveChart({
          curves: [
            { id: 'd1', type: 'demand', name: 'D', position: 50, elasticity: 50, color: '#3b82f6', flipped: false },
            { id: 's1', type: 'supply', name: 'S', position: 50, elasticity: 50, color: '#ef4444', flipped: false },
          ], policy: { type: 'floor', price: 40 }
        }); break;
      default: break;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-800'} font-sans transition-colors`}>
      
      {/* SIDEBAR: Controls */}
      <div className={`w-full md:w-[420px] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-r shadow-xl z-10 flex flex-col h-full transition-colors`}>
        <div className={`p-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-800'} text-white flex justify-between items-center transition-colors`}>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold">VWL Multi-Editor</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleDarkModeToggle(!darkMode)} className="p-2 hover:bg-slate-600 rounded transition" title={darkMode ? 'Light mode' : 'Dark mode'}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={addChart} className="flex items-center gap-1 text-xs bg-blue-600 px-3 py-1.5 rounded hover:bg-blue-500 transition font-medium">
              <Plus className="w-3 h-3" /> Graph
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          
          {/* Chart Konfiguration */}
          <section>
            <h2 className={`text-xs font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-3 tracking-wider flex items-center gap-2`}>
              <BookOpen className="w-4 h-4"/> Diagramm-Info
            </h2>
            <input
              type="text"
              value={activeChart.title}
              onChange={(e) => updateActiveChart({ title: e.target.value })}
              className={`w-full text-sm p-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-600' : 'bg-slate-50 border-slate-300 focus:ring-blue-500'} rounded focus:ring-2 outline-none transition-colors`}
              placeholder="Titel des Diagramms"
            />
          </section>

          {/* Quick-Szenarien */}
          <section>
            <h2 className={`text-xs font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-3 tracking-wider`}>VWL-Szenarien</h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => loadScenario('initial')} className={`text-xs p-2 rounded text-left font-medium transition ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>Gleichgewicht</button>
              <button onClick={() => loadScenario('demand_shift')} className={`text-xs p-2 rounded text-left font-medium transition ${darkMode ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>Nachfrageshift</button>
              <button onClick={() => loadScenario('supply_shift')} className={`text-xs p-2 rounded text-left font-medium transition ${darkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>Angebotsshift</button>
              <button onClick={() => loadScenario('inelastic_demand')} className={`text-xs p-2 rounded text-left font-medium transition ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>Unelastisch</button>
              <button onClick={() => loadScenario('tax')} className={`text-xs p-2 rounded text-left font-medium transition ${darkMode ? 'bg-amber-900 text-amber-200 hover:bg-amber-800' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>Steuer</button>
              <button onClick={() => loadScenario('subsidy')} className={`text-xs p-2 rounded text-left font-medium transition ${darkMode ? 'bg-green-900 text-green-200 hover:bg-green-800' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>Subvention</button>
            </div>
          </section>

          {/* Kurven-Manager */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className={`text-xs font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'} tracking-wider`}>Akteure (Kurven)</h2>
              <div className="flex gap-2">
                <button onClick={() => addCurve('demand')} className={`text-xs font-bold px-2 py-1 rounded transition ${darkMode ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>+ Nachfrage</button>
                <button onClick={() => addCurve('supply')} className={`text-xs font-bold px-2 py-1 rounded transition ${darkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>+ Angebot</button>
              </div>
            </div>

            <div className="space-y-4">
              {activeChart.curves.map(curve => (
                <div key={curve.id} className={`p-4 border rounded-xl ${darkMode ? `bg-slate-700 ${curve.type === 'demand' ? 'border-blue-700' : 'border-red-700'}` : `bg-white ${curve.type === 'demand' ? 'border-blue-200' : 'border-red-200'}`} shadow-sm transition-colors`}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: curve.color }} />
                      <input type="text" value={curve.name} onChange={(e) => updateCurve(curve.id, 'name', e.target.value)} className={`font-bold text-sm w-12 border-b outline-none transition-colors ${darkMode ? 'bg-slate-700 text-slate-100 border-slate-600 focus:border-slate-400' : 'bg-transparent border-transparent focus:border-slate-400'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400 bg-slate-600' : 'text-slate-400 bg-slate-100'} px-1.5 py-0.5 rounded transition-colors`}>
                        {curve.type === 'demand' ? 'Nachfrage' : 'Angebot'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCurve(curve.id, 'flipped', !curve.flipped)} title={curve.flipped ? 'Spiegelung entfernen' : 'Kurve spiegeln'} className={`p-2 rounded-md transition ${curve.flipped ? (darkMode ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-900') : (darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-50')}`}>
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeCurve(curve.id)} className={`${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'} transition`}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* VWL Sliders */}
                  <div className="space-y-4">
                    <div>
                      <div className={`flex justify-between text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>
                        <span className="flex items-center gap-1"><ArrowRightLeft className="w-3 h-3"/> Verschiebung</span>
                        <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>{curve.position < 50 ? 'Links' : curve.position > 50 ? 'Rechts' : 'Mitte'}</span>
                      </div>
                      <input type="range" min="5" max="95" value={curve.position} onChange={(e) => updateCurve(curve.id, 'position', Number(e.target.value))} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${curve.type === 'demand' ? 'bg-blue-200 accent-blue-600' : 'bg-red-200 accent-red-600'}`} />
                      <div className={`flex justify-between text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                        <span>Rückgang</span><span>Anstieg</span>
                      </div>
                    </div>

                    <div>
                      <div className={`flex justify-between text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>
                        <span className="flex items-center gap-1"><Scale className="w-3 h-3"/> Elastizität</span>
                      </div>
                      <input type="range" min="0" max="100" value={curve.elasticity} onChange={(e) => updateCurve(curve.id, 'elasticity', Number(e.target.value))} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${darkMode ? 'bg-slate-600 accent-slate-400' : 'bg-slate-200 accent-slate-700'}`} />
                      <div className={`flex justify-between text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                        <span>Unelastisch (Steil)</span><span>Elastisch (Flach)</span>
                      </div>
                      {/* flip button now available in the curve header */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Staatliche Eingriffe */}
          <section className={`p-4 rounded-xl ${darkMode ? 'bg-amber-900/50 border-amber-700' : 'bg-amber-50 border-amber-200'} border transition-colors`}>
            <h2 className={`text-xs font-bold uppercase ${darkMode ? 'text-amber-200' : 'text-amber-800'} mb-3 tracking-wider`}>Staatliche Eingriffe</h2>
            <div className="flex gap-2 mb-3">
              {['none', 'ceiling', 'floor'].map(type => (
                <button 
                  key={type}
                  onClick={() => updateActiveChart({ policy: { ...activeChart.policy, type } })}
                  className={`flex-1 text-[11px] py-1.5 px-1 rounded font-medium border transition-colors ${
                    activeChart.policy.type === type 
                      ? `bg-amber-600 text-white border-amber-600 ${darkMode ? 'bg-amber-700' : ''}`
                      : `${darkMode ? 'bg-slate-700 text-amber-200 border-amber-700 hover:bg-slate-600' : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100'}`
                  }`}
                >
                  {type === 'none' ? 'Freier Markt' : type === 'ceiling' ? 'Höchstpreis' : 'Mindestpreis'}
                </button>
              ))}
            </div>
            {activeChart.policy.type !== 'none' && (
              <div>
                <div className={`flex justify-between text-xs font-medium ${darkMode ? 'text-amber-200' : 'text-amber-800'} mb-1`}>
                  <span>Preisniveau festlegen</span>
                </div>
                <input 
                  type="range" min="10" max="90" 
                  value={activeChart.policy.price} 
                  onChange={(e) => updateActiveChart({ policy: { ...activeChart.policy, price: Number(e.target.value) } })}
                  className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${darkMode ? 'bg-amber-700 accent-amber-600' : 'bg-amber-200 accent-amber-600'}`}
                />
              </div>
            )}
          </section>

        </div>
      </div>

      {/* MAIN GRID */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'} transition-colors`}>
        <div className={`grid gap-6 ${charts.length > 1 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
          {charts.map(chart => (
            <ChartRenderer 
              key={chart.id} 
              chart={chart} 
              isActive={chart.id === activeChartId}
              onSelect={() => setActiveChartId(chart.id)}
              onDuplicate={() => duplicateChart(chart.id)}
              onDelete={() => deleteChart(chart.id)}
              canDelete={charts.length > 1}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartRenderer({ chart, isActive, onSelect, onDuplicate, onDelete, canDelete, darkMode }) {
  const svgRef = useRef(null);
  const [copyFeedback, setCopyFeedback] = useState('');

  const mathCurves = useMemo(() => {
    return chart.curves.map(c => {
      const anchor = calcCurveAnchor(c.type, c.position);
      const slope = calcCurveSlope(c.type, c.elasticity, c.flipped);
      const intercept = anchor.p - (slope * anchor.q);
      return { ...c, anchorQ: anchor.q, anchorP: anchor.p, slope, intercept };
    });
  }, [chart.curves]);

  const intersections = useMemo(() => {
    const points = [];
    const demands = mathCurves.filter((c) => c.type === 'demand');
    const supplies = mathCurves.filter((c) => c.type === 'supply');

    demands.forEach((d) => {
      supplies.forEach((s) => {
        const slopeDelta = d.slope - s.slope;
        if (slopeDelta === 0) return;

        const qStar = (s.intercept - d.intercept) / slopeDelta;
        const pStar = d.slope * qStar + d.intercept;

        if (qStar >= -10 && qStar <= 150 && pStar >= -10 && pStar <= 150) {
          points.push({ q: qStar, p: pStar, dName: d.name, sName: s.name });
        }
      });
    });
    return points;
  }, [mathCurves]);

  const width = 800; const height = 600; const padding = 60;
  const maxAxis = 100; 
  const mapCoord = (val, isY = false) => {
    if (isY) return height - padding - (val / maxAxis) * (height - padding * 2);
    return padding + (val / maxAxis) * (width - padding * 2);
  };

  const getSerializedSVG = () => {
    if (!svgRef.current) return null;
    return new XMLSerializer().serializeToString(svgRef.current);
  };

  // Convert serialized SVG to a PNG Blob. Accepts an optional `scale`
  // parameter to increase pixel density for high-resolution exports.
  const svgToPngBlob = (svgData, scale = Math.max(1, window.devicePixelRatio || 1) * 2) => {
    return new Promise((resolve, reject) => {
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaledWidth = Math.round(width * scale);
        const scaledHeight = Math.round(height * scale);
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas context not available'));
          return;
        }

        // Improve rendering quality by drawing the image at the scaled size.
        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('PNG conversion failed'));
            return;
          }
          resolve(blob);
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load failed'));
      };

      img.src = url;
    });
  };

  const copySVGToClipboard = async (e) => {
    e.stopPropagation();
    const svgData = getSerializedSVG();
    if (!svgData || !navigator.clipboard) {
      setCopyFeedback('Kopieren nicht verfugbar');
      setTimeout(() => setCopyFeedback(''), 1800);
      return;
    }

    try {
      if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
        // Use a larger scale for high-resolution clipboard images.
        const pngBlob = await svgToPngBlob(svgData, 3);

        // Prefer writing only the PNG to clipboard so apps like Word paste the image,
        // otherwise some apps pick the plain-text alternative. If that fails, try
        // writing both PNG and SVG; final fallback is writing text.
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob })
          ]);
          setCopyFeedback('Bild kopiert');
        } catch (innerErr) {
          try {
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': pngBlob, 'image/svg+xml': svgBlob })
            ]);
            setCopyFeedback('Bild kopiert');
          } catch (innerErr2) {
            await navigator.clipboard.writeText(svgData);
            setCopyFeedback('SVG als Text kopiert');
          }
        }
      } else {
        await navigator.clipboard.writeText(svgData);
        setCopyFeedback('SVG als Text kopiert');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(svgData);
        setCopyFeedback('SVG als Text kopiert');
      } catch (fallbackError) {
        setCopyFeedback('Kopieren fehlgeschlagen');
      }
    }

    setTimeout(() => setCopyFeedback(''), 1800);
  };

  const exportSVG = (e) => {
    e.stopPropagation();
    const svgData = getSerializedSVG();
    if (!svgData) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([svgData], { type: 'image/svg+xml' }));
    link.download = `VWL_Graph_${chart.title.replace(/\s+/g, '_')}.svg`;
    link.click();
  };

  const axisColor = darkMode ? '#cbd5e1' : '#334155';
  const textColor = darkMode ? '#f1f5f9' : '#1e293b';

  return (
    <div 
      onClick={onSelect}
      className={`relative rounded-2xl shadow-lg transition-all duration-200 cursor-pointer flex flex-col group overflow-hidden
        ${darkMode ? 'bg-slate-800' : 'bg-white'} 
        ${isActive ? `ring-4 transform scale-[1.01] ${darkMode ? 'ring-blue-600' : 'ring-blue-500'}` : `hover:shadow-xl hover:ring-2 ${darkMode ? 'hover:ring-slate-600' : 'hover:ring-slate-300'}`}`}
    >
      {/* Chart Toolbar */}
      <div className={`absolute top-4 right-4 z-10 flex gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button onClick={copySVGToClipboard} className={`p-2 rounded-lg shadow-md border transition ${darkMode ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`} title="SVG kopieren">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className={`p-2 rounded-lg shadow-md border transition ${darkMode ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`} title="Graph duplizieren">
          <CopyPlus className="w-4 h-4" />
        </button>
        <button onClick={exportSVG} className={`p-2 rounded-lg shadow-md transition ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-800 text-white hover:bg-slate-700'}`} title="SVG Export">
          <Download className="w-4 h-4" />
        </button>
        {canDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition" title="Löschen">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {copyFeedback && (
        <div className={`absolute top-16 right-4 z-10 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-md ${copyFeedback === 'SVG kopiert' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
          {copyFeedback}
        </div>
      )}

      <div className="flex-1 p-4 aspect-[4/3]">
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={axisColor} />
            </marker>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d={`M 40 0 L 0 0 0 40`} fill="none" stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect x={padding} y={padding} width={width - padding * 2} height={height - padding * 2} fill={`url(#grid)`} />

          {/* Title */}
          <text x={width / 2} y={padding - 20} textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>{chart.title}</text>

          {/* Axes */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={axisColor} strokeWidth="2.5" markerStart="url(#arrow)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={axisColor} strokeWidth="2.5" markerEnd="url(#arrow)" />
          
          {/* Axis Labels - Positioned inside viewBox */}
          <g>
            {/* Y-axis label - Preis (P) */}
            <text 
              x={padding + 10} 
              y={padding - 8} 
              fontSize="15" 
              fontWeight="600" 
              fill={axisColor}
            >Preis (P)</text>
            
            {/* X-axis label - Menge (Q) */}
            <text 
              x={width - padding - 50} 
              y={height - padding + 25} 
              fontSize="15" 
              fontWeight="600" 
              fill={axisColor}
            >Menge (Q)</text>
            
            {/* Origin label - 0 */}
            <text 
              x={padding - 8} 
              y={height - padding + 16} 
              textAnchor="end" 
              dominantBaseline="middle" 
              fontSize="13" 
              fontWeight="500" 
              fill={darkMode ? '#94a3b8' : '#94a3b8'}
            >0</text>
          </g>

          <clipPath id={`clip-${chart.id}`}><rect x={padding} y={padding} width={width - padding*2} height={height - padding*2} /></clipPath>

          <g clipPath={`url(#clip-${chart.id})`}>
            {/* Polices (Staatliche Eingriffe) */}
            {chart.policy.type !== 'none' && (() => {
              const p = chart.policy.price;
              const dCurve = mathCurves.filter(c => c.type === 'demand').pop();
              const sCurve = mathCurves.filter(c => c.type === 'supply').pop();
              
              let qD = 0, qS = 0;
              if (dCurve) qD = Math.abs(dCurve.slope) < 0.01 ? maxAxis : (p - dCurve.intercept) / dCurve.slope;
              if (sCurve) qS = Math.abs(sCurve.slope) < 0.01 ? maxAxis : (p - sCurve.intercept) / sCurve.slope;

              qD = Math.max(0, Math.min(qD, maxAxis));
              qS = Math.max(0, Math.min(qS, maxAxis));

              return (
                <g>
                  <line x1={padding} y1={mapCoord(p, true)} x2={width - padding} y2={mapCoord(p, true)} stroke="#d97706" strokeWidth="2.5" strokeDasharray="6,3" opacity="0.8" />
                  {dCurve && sCurve && qD !== qS && (
                    <g>
                      <line x1={mapCoord(Math.min(qD, qS))} y1={mapCoord(p, true)} x2={mapCoord(Math.max(qD, qS))} y2={mapCoord(p, true)} stroke="#f59e0b" strokeWidth="6" opacity="0.35" />
                      <text x={mapCoord((qD + qS)/2)} y={mapCoord(p, true) - 18} textAnchor="middle" fontSize="12" fontWeight="600" fill="#b45309" opacity="0.9">
                        {qD > qS ? 'Nachfrageüberhang' : 'Angebotsüberschuss'}
                      </text>
                      <line x1={mapCoord(qD)} y1={mapCoord(p, true)} x2={mapCoord(qD)} y2={height - padding} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
                      <line x1={mapCoord(qS)} y1={mapCoord(p, true)} x2={mapCoord(qS)} y2={height - padding} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
                    </g>
                  )}
                </g>
              );
            })()}

            {/* Kurven */}
            {mathCurves.map((curve) => {
              const q1 = -20;
              const q2 = 120;
              const p1 = curve.slope * q1 + curve.intercept;
              const p2 = curve.slope * q2 + curve.intercept;

              let labelQ = curve.anchorQ + 18;
              let labelP = curve.slope * labelQ + curve.intercept;
              if (labelP < 5) {
                labelP = 5;
                labelQ = Math.abs(curve.slope) < 0.01 ? curve.anchorQ : (labelP - curve.intercept) / curve.slope;
              }
              if (labelP > 95) {
                labelP = 95;
                labelQ = Math.abs(curve.slope) < 0.01 ? curve.anchorQ : (labelP - curve.intercept) / curve.slope;
              }

              return (
                <g key={curve.id}>
                  <line x1={mapCoord(q1)} y1={mapCoord(p1, true)} x2={mapCoord(q2)} y2={mapCoord(p2, true)} stroke={curve.color} strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
                  <rect x={mapCoord(labelQ)-13} y={mapCoord(labelP, true)-13} width="26" height="26" fill={darkMode ? '#1e293b' : '#ffffff'} rx="13" strokeWidth="2" stroke={curve.color} opacity="0.95" />
                  <text x={mapCoord(labelQ)} y={mapCoord(labelP, true)} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill={curve.color}>{curve.name}</text>
                </g>
              );
            })}
          </g>

          {/* Eingriffs-Label außerhalb Clip */}
          {chart.policy.type !== 'none' && (
            <text x={padding - 12} y={mapCoord(chart.policy.price, true)} textAnchor="end" dominantBaseline="middle" fontSize="13" fontWeight="600" fill="#d97706" letterSpacing="0.5">
              {chart.policy.type === 'ceiling' ? 'P_max' : 'P_min'}
            </text>
          )}

          {/* Schnittpunkte (Equilibrium) */}
          {intersections.map((pt, i) => (
            <g key={`eq-${i}`}>
              <line x1={padding} y1={mapCoord(pt.p, true)} x2={mapCoord(pt.q)} y2={mapCoord(pt.p, true)} stroke={darkMode ? '#64748b' : '#cbd5e1'} strokeWidth="1.5" strokeDasharray="4,4" />
              <line x1={mapCoord(pt.q)} y1={mapCoord(pt.p, true)} x2={mapCoord(pt.q)} y2={height - padding} stroke={darkMode ? '#64748b' : '#cbd5e1'} strokeWidth="1.5" strokeDasharray="4,4" />
              <circle cx={mapCoord(pt.q)} cy={mapCoord(pt.p, true)} r="7" fill={textColor} stroke={darkMode ? '#1e293b' : 'white'} strokeWidth="2.5" />
              <text x={padding - 15} y={mapCoord(pt.p, true)} textAnchor="end" dominantBaseline="middle" fontSize="13" fontWeight="600" fill={textColor} letterSpacing="0.5">P*</text>
              <text x={mapCoord(pt.q)} y={height - padding + 22} textAnchor="middle" dominantBaseline="hanging" fontSize="13" fontWeight="600" fill={textColor} letterSpacing="0.5">Q*</text>
            </g>
          ))}
        </svg>
      </div>

      {!isActive && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={`${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-slate-900 text-white'} px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>Klicken zum Bearbeiten</span>
        </div>
      )}
    </div>
  );
}
