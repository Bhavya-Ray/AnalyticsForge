import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Clock, ArrowRight, Plus } from 'lucide-react';

const DashboardList = () => {
    const [dashboards, setDashboards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/analytics/dashboards');
                setDashboards(res.data);
            } catch (err) {
                console.error('Error fetching dashboards:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboards();
    }, []);

    return (
        <div className="container py-8 animation-fade-in">
            <Link to="/" className="flex items-center text-primary hover:underline mb-6" style={{ width: 'fit-content' }}>
                <ArrowRight size={16} style={{ marginRight: '0.5rem', transform: 'rotate(180deg)' }} /> Back to Home
            </Link>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #2563eb, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                        Your Dashboards
                    </h1>
                    <p className="text-muted">Access your analytics workspaces</p>
                </div>
                <Link
                    to="/upload"
                    className="btn btn-primary"
                    style={{ gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                >
                    <Plus size={20} />
                    <span>New Project</span>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card" style={{ height: '200px', backgroundColor: '#f3f4f6', animation: 'pulse 2s infinite' }}></div>
                    ))}
                </div>
            ) : dashboards.length === 0 ? (
                <div className="card text-center" style={{ padding: '5rem 2rem', borderStyle: 'dashed' }}>
                    <div style={{ backgroundColor: '#eff6ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <LayoutDashboard className="text-primary" size={32} />
                    </div>
                    <h3 className="text-xl" style={{ marginBottom: '0.5rem' }}>No dashboards yet</h3>
                    <p className="text-muted mb-6">Upload your first dataset to get started</p>
                    <Link to="/upload" className="text-primary" style={{ fontWeight: '500' }}>
                        Create your first dashboard
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
                    {dashboards.map((board) => (
                        <Link
                            to={`/dashboard?id=${board.latest_id}`}
                            key={board.latest_id}
                            className="card group"
                            style={{ display: 'block', position: 'relative', overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(to right, #3b82f6, #10b981)', opacity: 0, transition: 'opacity 0.3s' }} className="group-hover-line"></div>

                            <div className="flex justify-between items-center mb-4">
                                <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem', color: '#2563eb' }}>
                                    <LayoutDashboard size={24} />
                                </div>
                                <div style={{ color: '#94a3b8' }}>
                                    <ArrowRight size={20} />
                                </div>
                            </div>

                            <h3 className="text-xl" style={{ marginBottom: '0.5rem', fontWeight: 'bold', textTransform: board.project_name ? 'none' : 'capitalize' }}>
                                {board.project_name || `${board.project_type} Analysis`}
                            </h3>

                            <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.875rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                <Clock size={16} />
                                <span>
                                    Last updated: {new Date(board.latestCreatedAt).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .group:hover .group-hover-line {
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
};

export default DashboardList;
