import { useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend, ComposedChart, ScatterChart, Scatter, Sector, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar, Funnel, FunnelChart, LabelList, Label } from 'recharts';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DynamicChart = ({ chart, index, className, style, compact }) => {
    const { type, title, x, y, data, dataKey, nameKey, description } = chart;
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#10b981'];

    const renderChart = () => {
        switch (type) {
            case 'line':
                const lineDataLen = Array.isArray(data) ? data.length : 0;
                const xInterval = lineDataLen > 15 ? Math.max(0, Math.floor(lineDataLen / 12) - 1) : 0;
                const xRotate = lineDataLen > 12;
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data} margin={{ top: 20, right: 30, bottom: xRotate ? 70 : 50, left: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={x} interval={xInterval} angle={xRotate ? -45 : 0} textAnchor={xRotate ? 'end' : 'middle'}>
                                <Label value={x} offset={xRotate ? -45 : -20} position="insideBottom" style={{ fontWeight: 'bold' }} />
                            </XAxis>
                            <YAxis>
                                <Label value={y} angle={-90} position="insideLeft" dx={-15} style={{ fontWeight: 'bold', textAnchor: 'middle' }} />
                            </YAxis>
                            <Tooltip
                                formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, y || name]}
                            />
                            <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '0.5rem' }} />
                            <Line type="monotone" dataKey={y} stroke="var(--primary)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 10 }} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={data} margin={{ top: 20, right: 30, bottom: 40, left: 60 }}>
                            <defs>
                                <linearGradient id={`colorArea-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id={`colorArea2-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey={x}>
                                <Label value={x} offset={-10} position="insideBottom" style={{ fontWeight: 'bold' }} />
                            </XAxis>
                            <YAxis>
                                <Label value={y} angle={-90} position="insideLeft" dx={-15} style={{ fontWeight: 'bold', textAnchor: 'middle' }} />
                            </YAxis>
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip
                                formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, name]}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey={y} stroke="#10b981" fillOpacity={1} fill={`url(#colorArea-${index})`} isAnimationActive={false} />
                            {chart.y2 && <Area type="monotone" dataKey={chart.y2} stroke="#3b82f6" fillOpacity={1} fill={`url(#colorArea2-${index})`} isAnimationActive={false} />}
                        </AreaChart>
                    </ResponsiveContainer>
                );
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data} margin={{ top: 20, right: 30, bottom: 40, left: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={x}>
                                <Label value={x} offset={-10} position="insideBottom" style={{ fontWeight: 'bold' }} />
                            </XAxis>
                            <YAxis>
                                <Label value={y} angle={-90} position="insideLeft" dx={-15} style={{ fontWeight: 'bold', textAnchor: 'middle' }} />
                            </YAxis>
                            <Tooltip
                                formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, y || name]}
                            />
                            {chart.series ? (
                                chart.series.map((s, idx) => (
                                    <Bar
                                        key={s.dataKey}
                                        dataKey={s.dataKey}
                                        name={s.name}
                                        fill={s.fill || colors[idx % colors.length]}
                                        radius={[4, 4, 0, 0]}
                                        isAnimationActive={false}
                                    />
                                ))
                            ) : (
                                <Bar dataKey={y} fill="var(--primary)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'scatter':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <ScatterChart margin={{ top: 20, right: 30, bottom: 45, left: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey={x} name={x}>
                                <Label value={x} offset={-15} position="insideBottom" style={{ fontWeight: 'bold' }} />
                            </XAxis>
                            <YAxis type="number" dataKey={y} name={y}>
                                <Label value={y} angle={-90} position="insideLeft" dx={-15} style={{ fontWeight: 'bold', textAnchor: 'middle' }} />
                            </YAxis>
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, name]}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            {chart.series ? (
                                chart.series.map((s, idx) => (
                                    <Scatter
                                        key={s.dataKey || idx}
                                        name={s.name}
                                        data={s.data}
                                        fill={s.fill || colors[idx % colors.length]}
                                        isAnimationActive={false}
                                    />
                                ))
                            ) : (
                                <Scatter name="Data Points" data={data} fill="var(--primary)" isAnimationActive={false} />
                            )}
                        </ScatterChart>
                    </ResponsiveContainer>
                );
            case 'histogram':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data} barCategoryGap={0} margin={{ top: 20, right: 30, bottom: 40, left: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range">
                                <Label value="Value Range" offset={-10} position="insideBottom" style={{ fontWeight: 'bold' }} />
                            </XAxis>
                            <YAxis>
                                <Label value="Frequency" angle={-90} position="insideLeft" dx={-15} style={{ fontWeight: 'bold', textAnchor: 'middle' }} />
                            </YAxis>
                            <Tooltip
                                formatter={(value) => [value, 'Frequency']}
                                labelStyle={{ fontWeight: 'bold', color: 'var(--primary)' }}
                            />
                            <Bar dataKey="count" fill="var(--primary)" stroke="var(--primary-dark)" isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'boxPlot':
                if (!Array.isArray(data) || data.length === 0) {
                    return <p className="text-muted">No distribution data available.</p>;
                }

                // Transform for stacked bars: min, lowerWhisker, iqr, upperWhisker
                const boxData = data.map((d) => {
                    const min = Number(d.min);
                    const q1 = Number(d.q1);
                    const q3 = Number(d.q3);
                    const max = Number(d.max);
                    return {
                        ...d,
                        lowerWhisker: Math.max(0, q1 - min),
                        iqr: Math.max(0, q3 - q1),
                        upperWhisker: Math.max(0, max - q3),
                    };
                });

                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={boxData} margin={{ top: 20, right: 30, left: 60, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category">
                                <Label value="Category" offset={-10} position="insideBottom" style={{ fontWeight: 'bold' }} />
                            </XAxis>
                            <YAxis>
                                <Label value="Value" angle={-90} position="insideLeft" dx={-15} style={{ fontWeight: 'bold', textAnchor: 'middle' }} />
                            </YAxis>
                            <Tooltip
                                formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, name?.toUpperCase?.() || name]}
                                labelStyle={{ fontWeight: 'bold', color: 'var(--primary)' }}
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length || !label) return null;
                                    const d = boxData.find((r) => r.category === label);
                                    if (!d) return null;
                                    return (
                                        <div className="card" style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</div>
                                            <div>Min: {Number(d.min).toFixed(2)}</div>
                                            <div>Q1: {Number(d.q1).toFixed(2)}</div>
                                            <div>Median: {Number(d.median).toFixed(2)}</div>
                                            <div>Q3: {Number(d.q3).toFixed(2)}</div>
                                            <div>Max: {Number(d.max).toFixed(2)}</div>
                                        </div>
                                    );
                                }}
                            />
                            {/* Stacked bars: baseline (min) + lower whisker + IQR (box) + upper whisker */}
                            <Bar dataKey="min" stackId="box" fill="transparent" isAnimationActive={false} />
                            <Bar dataKey="lowerWhisker" stackId="box" fill="transparent" isAnimationActive={false} />
                            <Bar dataKey="iqr" stackId="box" fill="var(--primary)" fillOpacity={0.6} stroke="var(--primary)" isAnimationActive={false} />
                            <Bar dataKey="upperWhisker" stackId="box" fill="transparent" isAnimationActive={false} />
                            <Line type="monotone" dataKey="median" stroke="red" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                );
            case 'treemap':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data} layout="vertical" margin={{ left: 40, right: 30, top: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number">
                                <Label value="Value" offset={-10} position="insideBottom" style={{ fontWeight: 'bold' }} />
                            </XAxis>
                            <YAxis type="category" dataKey={nameKey || x} width={100} />
                            <Tooltip />
                            <Bar dataKey={dataKey || y} fill="var(--primary)" barSize={30} isAnimationActive={false}>
                                {data.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                outerRadius={compact ? 130 : 150}
                                fill="#8884d8"
                                dataKey={dataKey || y || 'value'}
                                nameKey={nameKey || x || 'name'}
                                isAnimationActive={false}
                            >
                                {data.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, name]}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'radar':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey={x} />
                            <PolarRadiusAxis />
                            <Tooltip />
                            <Legend />
                            {chart.series ? (
                                chart.series.map((s, idx) => (
                                    <Radar
                                        key={s.dataKey}
                                        name={s.name}
                                        dataKey={s.dataKey}
                                        stroke={s.stroke || colors[idx % colors.length]}
                                        fill={s.fill || colors[idx % colors.length]}
                                        fillOpacity={0.5}
                                        isAnimationActive={false}
                                    />
                                ))
                            ) : (
                                <Radar name={y} dataKey={y} stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} isAnimationActive={false} />
                            )}
                        </RadarChart>
                    </ResponsiveContainer>
                );
            case 'funnel':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <FunnelChart>
                            <Tooltip />
                            <Funnel dataKey={y} data={data} isAnimationActive={false}>
                                <LabelList position="right" fill="#888" dataKey={x} />
                            </Funnel>
                        </FunnelChart>
                    </ResponsiveContainer>
                );
            case 'radialBar':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={data}>
                            <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey={y} isAnimationActive={false} />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ top: '50%', right: 0, transform: 'translate(0, -50%)', lineHeight: '24px' }} />
                            <Tooltip />
                        </RadialBarChart>
                    </ResponsiveContainer>
                );
            default:
                return <p>Unsupported chart type: {type}</p>;
        }
    };

    return (
        <div className={`card ${className || ''}`} style={{ minHeight: '500px', padding: '2rem', ...style }}>
            <h3 className="text-xl mb-2">{title}</h3>
            <p className="text-muted mb-6 text-sm">{description}</p>
            {renderChart()}
        </div>
    );
};

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const projectType = searchParams.get('projectType') || 'general';
    const projectId = searchParams.get('id');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const dashboardRef = useRef(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!projectId && !projectType) {
                setError("No project identified. Please select a dashboard from the list.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const url = projectId
                    ? `http://localhost:3000/api/analytics/id/${projectId}`
                    : `http://localhost:3000/api/analytics/summary/${projectType}`;

                const res = await axios.get(url);
                if (res.data) {
                    setData(res.data);
                } else {
                    setError("No data found for this project.");
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.response?.data?.message || "Failed to load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [projectType, projectId]);

    const handleDownloadPDF = async () => {
        if (!dashboardRef.current || !data) return;
        try {
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#f8fafc'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${data.project_name || data.project_type || 'dashboard'}.pdf`);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('PDF export failed. Please try again.');
        }
    };

    const formatText = (text) => {
        if (!text) return '';
        return text.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p className="mt-4 text-muted">Loading Analytics...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div className="container py-12 text-center">
            <div className="card mx-auto" style={{ maxWidth: '500px', padding: '3rem' }}>
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <ArrowLeft size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
                <p className="text-muted mb-8">{error}</p>
                <Link to="/dashboards" className="btn btn-primary">
                    Return to Dashboards
                </Link>
            </div>
        </div>
    );

    if (!data) return null;

    return (
        <div className="animation-fade-in" ref={dashboardRef} style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="container py-8">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-2 text-muted">
                            <Link to="/dashboards" className="flex items-center gap-1 hover:text-primary transition-colors">
                                <ArrowLeft size={16} />
                                Back to Dashboards
                            </Link>
                            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {data?.project_type || projectType}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                            {data?.project_name ? data.project_name : (
                                `${formatText(data?.project_type || projectType)} Analytics Dashboard`
                            )}
                        </h1>
                    </div>
                    <button
                        onClick={handleDownloadPDF}
                        className="btn btn-primary flex items-center gap-2"
                        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                    >
                        <Download size={20} />
                        Download PDF
                    </button>
                </div>

                {/* KPIs Section */}
                <div className="grid grid-cols-4 gap-6 mb-12">
                    <div className="card relative overflow-hidden" style={{ padding: '2rem' }}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
                        <p className="text-muted font-medium mb-1">Total Records</p>
                        <h3 className="text-4xl font-bold">
                            {Array.isArray(data?.kpi_json)
                                ? (data.kpi_json.find(k => k.label === "Total Records")?.value || data.summary_json?.length || 0).toLocaleString()
                                : (data?.kpi_json?.totalRevenue || data?.summary_json?.length || 0).toLocaleString()
                            }
                        </h3>
                    </div>

                    <div className="card relative overflow-hidden" style={{ padding: '2rem' }}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
                        <p className="text-muted font-medium mb-1">Metrics Tracked</p>
                        <h3 className="text-4xl font-bold">
                            {Array.isArray(data?.kpi_json) && data.kpi_json.length > 1
                                ? data.kpi_json[1].label.replace('Total ', '')
                                : (data?.kpi_json?.primaryMetric || 'General')
                            }
                        </h3>
                    </div>

                    <div className="card relative overflow-hidden" style={{ padding: '2rem' }}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
                        <p className="text-muted font-medium mb-1">Total Growth</p>
                        <h3 className="text-4xl font-bold text-blue-600">
                            {Array.isArray(data?.kpi_json) && data.kpi_json.length > 2
                                ? data.kpi_json[2].value.toLocaleString()
                                : (data?.kpi_json?.growth || 0).toFixed(1) + '%'
                            }
                        </h3>
                    </div>

                    <div className="card relative overflow-hidden" style={{ padding: '2rem' }}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
                        <p className="text-muted font-medium mb-1">Last Analysis</p>
                        <h3 className="text-2xl font-bold">
                            {new Date(data?.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </h3>
                    </div>
                </div>

                {/* Main Charts Grid */}
                <div className={['enterprise', 'retail', 'emission'].includes(data?.project_type || projectType) ? "grid grid-cols-6 gap-6" : "grid grid-cols-2 gap-8"}>
                    {data?.charts_json && data.charts_json.map((chart, index) => {
                        let className = "col-span-1"; // Default
                        if (['enterprise', 'retail', 'emission'].includes(data?.project_type || projectType)) {
                            if (index === 0) className = "col-span-4"; // 2/3 width
                            else if (index === 1) className = "col-span-2"; // 1/3 width
                            else className = "col-span-3"; // 1/2 width
                        } else {
                            className = "col-span-1"; // 1/2 in a 2-col grid
                        }

                        return (
                            <DynamicChart
                                key={index}
                                chart={{
                                    ...chart,
                                    title: formatText(chart.title),
                                    description: formatText(chart.description)
                                }}
                                index={index}
                                className={className}
                                style={className.includes('col-span-2') || className.includes('col-span-4') || className.includes('col-span-3') ? { width: '100%' } : {}}
                                compact={['enterprise', 'retail', 'emission'].includes(data?.project_type || projectType) && index === 1 && chart.type === 'pie'}
                            />
                        );
                    })}
                </div>

                {/* Legacy/Fallback Plots */}
                {!data?.charts_json && (
                    <div className="grid grid-cols-2 gap-8">
                        <DynamicChart
                            chart={{
                                type: 'line',
                                title: 'Metric Trends',
                                x: 'month',
                                y: 'value',
                                data: data?.summary_json || []
                            }}
                            className="col-span-1"
                        />
                        <DynamicChart
                            chart={{
                                type: 'pie',
                                title: `${data?.kpi_json?.categoryMetric || 'Category'} Distribution`,
                                data: data?.category_json || []
                            }}
                            className="col-span-1"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
