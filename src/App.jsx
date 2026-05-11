import React, { useState, useMemo, useRef } from 'react';
import { Plus, Trash2, Download, BookOpen, Scale, ArrowRightLeft, Copy, LayoutGrid } from 'lucide-react';

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

export default function App() {
  const [charts, setCharts] = useState([
    {
      id: 'chart-1',
      title: 'Markt A (Vorher)',
      curves: [
        { id: 'd1', type: 'demand', name: 'N1', position: 50, elasticity: 50, color: '#3b82f6' },
        { id: 's1', type: 'supply', name: 'A1', position: 50, elasticity: 50, color: '#ef4444' },
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
        { id: Date.now().toString() + 'd', type: 'demand', name: 'N1', position: 50, elasticity: 50, color: '#3b82f6' },
        { id: Date.now().toString() + 's', type: 'supply', name: 'A1', position: 50, elasticity: 50, color: '#ef4444' },
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
    const newCurve = {
      id: Date.now().toString(),
      type,
      name: `${isDemand ? 'N' : 'A'}${activeChart.curves.filter(c => c.type === type).length + 1}`,
      position: isDemand ? 70 : 30,
      elasticity: 50,
      color: COLORS[activeChart.curves.length % COLORS.length]
    };
    updateActiveChart({ curves: [...activeChart.curves, newCurve] });
  };

  const removeCurve = (id) => {
    updateActiveChart({ curves: activeChart.curves.filter(c => c.id !== id) });
  };

  const loadScenario = (scenario) => {
    switch(scenario) {
      case 'inelastic_demand':
        updateActiveChart({
          curves: [
            { id: 'd1', type: 'demand', name: 'N', position: 50, elasticity: 0, color: '#3b82f6' },
            { id: 's1', type: 'supply', name: 'A', position: 50, elasticity: 50, color: '#ef4444' },
          ], policy: { type: 'none', price: 50 }
        }); break;
      case 'elastic_supply':
        updateActiveChart({
          curves: [
            { id: 'd1', type: 'demand', name: 'N', position: 50, elasticity: 50, color: '#3b82f6' },
            { id: 's1', type: 'supply', name: 'A', position: 50, elasticity: 100, color: '#ef4444' },
          ], policy: { type: 'none', price: 50 }
        }); break;
      case 'demand_shock':
        updateActiveChart({
          curves: [
            { id: 'd1', type: 'demand', name: 'N1', position: 40, elasticity: 50, color: '#93c5fd' },
            { id: 'd2', type: 'demand', name: 'N2', position: 70, elasticity: 50, color: '#2563eb' },
            { id: 's1', type: 'supply', name: 'A', position: 50, elasticity: 50, color: '#ef4444' },
          ], policy: { type: 'none', price: 50 }
        }); break;
      default: break;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 text-slate-800 font-sans">
      <div className="w-full md:w-[420px] bg-white border-r border-slate-200 shadow-xl z-10 flex flex-col h-full">
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold">VWL Multi-Editor</h1>
          </div>
          <button onClick={addChart} className="flex items-center gap-1 text-xs bg-blue-600 px-3 py-1.5 rounded hover:bg-blue-500 transition font-medium">
            <Plus className="w-3 h-3" /> Graph
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          <section>
            <h2 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4"/> Diagramm-Info
            </h2>
            <input
              type="text"
              value={activeChart.title}
              onChange={(e) => updateActiveChart({ title: e.target.value })}
              className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
              placeholder="Titel des Diagramms"
            />
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Schnell-Szenarien</h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => loadScenario('demand_shock')} className="text-xs p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-left font-medium transition">Nachfrageschock</button>
              <button onClick={() => loadScenario('inelastic_demand')} className="text-xs p-2 bg-slate-100 hover:bg-slate-200 rounded text-left font-medium transition">Unelastische Nachfrage</button>
              <button onClick={() => loadScenario('elastic_supply')} className="text-xs p-2 bg-slate-100 hover:bg-slate-200 rounded text-left font-medium transition">Elastisches Angebot</button>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Akteure (Kurven)</h2>
              <div className="flex gap-2">
                <button onClick={() => addCurve('demand')} className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Nachfrage</button>
                <button onClick={() => addCurve('supply')} className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">+ Angebot</button>
              </div>
            </div>

            <div className="space-y-4">
              {activeChart.curves.map(curve => (
                <div key={curve.id} className={`p-4 border rounded-xl bg-white shadow-sm ${curve.type === 'demand' ? 'border-blue-200' : 'border-red-200'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: curve.color }} />
                      <input type="text" value={curve.name} onChange={(e) => updateCurve(curve.id, 'name', e.target.value)} className="font-bold text-sm w-12 border-b border-transparent focus:border-slate-400 outline-none" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {curve.type === 'demand' ? 'Nachfrage' : 'Angebot'}
                      </span>
                    </div>
                    <button onClick={() => removeCurve(curve.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span className="flex items-center gap-1"><ArrowRightLeft className="w-3 h-3"/> Verschiebung</span>
                        <span className="text-slate-400">{curve.position < 50 ? 'Links' : curve.position > 50 ? 'Rechts' : 'Mitte'}</span>
                      </div>
                      <input type="range" min="5" max="95" value={curve.position} onChange={(e) => updateCurve(curve.id, 'position', Number(e.target.value))} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${curve.type === 'demand' ? 'bg-blue-200 accent-blue-600' : 'bg-red-200 accent-red-600'}`} />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>Rückgang</span><span>Anstieg</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span className="flex items-center gap-1"><Scale className="w-3 h-3"/> Elastizität</span>
                      </div>
                      <input type="range" min="0" max="100" value={curve.elasticity} onChange={(e) => updateCurve(curve.id, 'elasticity', Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700" />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>Unelastisch (Steil)</span><span>Elastisch (Flach)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-xs font-bold uppercase text-amber-800 mb-3 tracking-wider">Staatliche Eingriffe</h2>
            <div className="flex gap-2 mb-3">
              {['none', 'ceiling', 'floor'].map(type => (
                <button 
                  key={type}
                  onClick={() => updateActiveChart({ policy: { ...activeChart.policy, type } })}
                  className={`flex-1 text-[11px] py-1.5 px-1 rounded font-medium border ${
                    activeChart.policy.type === type 
                      ? 'bg-amber-600 text-white border-amber-600' 
                      : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {type === 'none' ? 'Freier Markt' : type === 'ceiling' ? 'Höchstpreis' : 'Mindestpreis'}
                </button>
              ))}
            </div>
            {activeChart.policy.type !== 'none' && (
              <div>
                <div className="flex justify-between text-xs font-medium text-amber-800 mb-1">
                  <span>Preisniveau festlegen</span>
                </div>
                <input 
                  type="range" min="10" max="90" 
                  value={activeChart.policy.price} 
                  onChange={(e) => updateActiveChart({ policy: { ...activeChart.policy, price: Number(e.target.value) } })}
                  className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600" 
                />
              </div>
            )}
          </section>

        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartRenderer({ chart, isActive, onSelect, onDuplicate, onDelete, canDelete }) {
  const svgRef = useRef(null);

  const mathCurves = useMemo(() => {
    return chart.curves.map(c => {
      const b = calcSlope(c.elasticity);
      const a = calcIntercept(c.type, c.position, b);
      return { ...c, a, b };
    });
  }, [chart.curves]);

  const intersections = useMemo(() => {
    const points = [];
    const demands = mathCurves.filter((c) => c.type === 'demand');
    const supplies = mathCurves.filter((c) => c.type === 'supply');

    demands.forEach((d) => {
      supplies.forEach((s) => {
        const combinedB = d.b + s.b;
        if (combinedB === 0) return; 

        const qStar = (d.a - s.a) / combinedB;
        const pStar = d.a - d.b * qStar;

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

  const exportSVG = (e) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([svgData], { type: 'image/svg+xml' }));
    link.download = `VWL_Graph_${chart.title.replace(/\s+/g, '_')}.svg`;
    link.click();
  };

  return (
    <div 
      onClick={onSelect}
      className={`relative bg-white rounded-2xl shadow-lg transition-all duration-200 cursor-pointer flex flex-col group overflow-hidden
        ${isActive ? 'ring-4 ring-blue-500 transform scale-[1.01]' : 'hover:shadow-xl hover:ring-2 hover:ring-slate-300'}`}
    >
      {/* Chart Toolbar */}
      <div className={`absolute top-4 right-4 z-10 flex gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-2 bg-white text-slate-700 rounded-lg shadow-md hover:bg-slate-50 border border-slate-200" title="Graph duplizieren">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={exportSVG} className="p-2 bg-slate-800 text-white rounded-lg shadow-md hover:bg-slate-700" title="SVG Export">
          <Download className="w-4 h-4" />
        </button>
        {canDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700" title="Löschen">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 p-4 aspect-[4/3]">
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
            </marker>
          </defs>

          <text x={width / 2} y={padding - 10} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1e293b">{chart.title}</text>

          {/* Achsen */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" strokeWidth="3" markerStart="url(#arrow)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="3" markerEnd="url(#arrow)" />
          <text x={padding - 20} y={padding + 10} textAnchor="end" fontSize="18" fontWeight="bold" fill="#334155">Preis (P)</text>
          <text x={width - padding + 20} y={height - padding + 25} textAnchor="start" fontSize="18" fontWeight="bold" fill="#334155">Menge (Q)</text>
          <text x={padding - 15} y={height - padding + 20} textAnchor="end" fontSize="16" fill="#94a3b8">0</text>

          <clipPath id={`clip-${chart.id}`}><rect x={padding} y={padding} width={width - padding*2} height={height - padding*2} /></clipPath>

          <g clipPath={`url(#clip-${chart.id})`}>
            {/* Polices (Staatliche Eingriffe) */}
            {chart.policy.type !== 'none' && (() => {
              const p = chart.policy.price;
              const dCurve = mathCurves.filter(c => c.type === 'demand').pop();
              const sCurve = mathCurves.filter(c => c.type === 'supply').pop();
              
              let qD = 0, qS = 0;
              if (dCurve) qD = dCurve.b < 0.01 ? maxAxis : (dCurve.a - p) / dCurve.b;
              if (sCurve) qS = sCurve.b < 0.01 ? maxAxis : (p - sCurve.a) / sCurve.b;

              qD = Math.max(0, Math.min(qD, maxAxis));
              qS = Math.max(0, Math.min(qS, maxAxis));

              return (
                <g>
                  <line x1={padding} y1={mapCoord(p, true)} x2={width} y2={mapCoord(p, true)} stroke="#d97706" strokeWidth="3" strokeDasharray="8,4" />
                  {dCurve && sCurve && qD !== qS && (
                    <g>
                      <line x1={mapCoord(Math.min(qD, qS))} y1={mapCoord(p, true)} x2={mapCoord(Math.max(qD, qS))} y2={mapCoord(p, true)} stroke="#f59e0b" strokeWidth="8" opacity="0.5" />
                      <text x={mapCoord((qD + qS)/2)} y={mapCoord(p, true) - 15} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#b45309">
                        {qD > qS ? 'Nachfrageüberhang' : 'Angebotsüberschuss'}
                      </text>
                      <line x1={mapCoord(qD)} y1={mapCoord(p, true)} x2={mapCoord(qD)} y2={height - padding} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,4" />
                      <line x1={mapCoord(qS)} y1={mapCoord(p, true)} x2={mapCoord(qS)} y2={height - padding} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" />
                    </g>
                  )}
                </g>
              );
            })()}

            {/* Kurven */}
            {mathCurves.map((curve) => {
              let q1, q2, p1 = 200, p2 = -100;
              
              if (curve.b < 0.01) { // Waagerecht
                q1 = -100; p1 = curve.a;
                q2 = 200;  p2 = curve.a;
              } else {
                q1 = curve.type === 'demand' ? (curve.a - p1)/curve.b : (p1 - curve.a)/curve.b;
                q2 = curve.type === 'demand' ? (curve.a - p2)/curve.b : (p2 - curve.a)/curve.b;
              }

              let labelQ = 90;
              let labelP = curve.type === 'demand' ? curve.a - curve.b * labelQ : curve.a + curve.b * labelQ;
              if (labelP < 5) { labelP = 5; labelQ = curve.type === 'demand' ? (curve.a - 5)/curve.b : (5 - curve.a)/curve.b; }
              if (labelP > 95) { labelP = 95; labelQ = curve.type === 'demand' ? (curve.a - 95)/curve.b : (95 - curve.a)/curve.b; }

              return (
                <g key={curve.id}>
                  <line x1={mapCoord(q1)} y1={mapCoord(p1, true)} x2={mapCoord(q2)} y2={mapCoord(p2, true)} stroke={curve.color} strokeWidth="4" strokeLinecap="round" />
                  <rect x={mapCoord(labelQ)-12} y={mapCoord(labelP, true)-12} width="24" height="24" fill="white" rx="12" />
                  <circle cx={mapCoord(labelQ)} cy={mapCoord(labelP, true)} r="12" fill="transparent" stroke={curve.color} strokeWidth="2" />
                  <text x={mapCoord(labelQ)} y={mapCoord(labelP, true)} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill={curve.color}>{curve.name}</text>
                </g>
              );
            })}
          </g>

          {/* Eingriffs-Label außerhalb Clip */}
          {chart.policy.type !== 'none' && (
            <text x={padding - 10} y={mapCoord(chart.policy.price, true)} textAnchor="end" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill="#d97706">
              {chart.policy.type === 'ceiling' ? 'P_max' : 'P_min'}
            </text>
          )}

          {/* Schnittpunkte */}
          {intersections.map((pt, i) => (
            <g key={`eq-${i}`}>
              <line x1={padding} y1={mapCoord(pt.p, true)} x2={mapCoord(pt.q)} y2={mapCoord(pt.p, true)} stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={mapCoord(pt.q)} y1={mapCoord(pt.p, true)} x2={mapCoord(pt.q)} y2={height - padding} stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
              <circle cx={mapCoord(pt.q)} cy={mapCoord(pt.p, true)} r="6" fill="#1e293b" stroke="white" strokeWidth="2" />
              <text x={padding - 10} y={mapCoord(pt.p, true)} textAnchor="end" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill="#1e293b">P*</text>
              <text x={mapCoord(pt.q)} y={height - padding + 20} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">Q*</text>
            </g>
          ))}
        </svg>
      </div>

      {!isActive && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">Klicken zum Bearbeiten</span>
        </div>
      )}
    </div>
  );
}
