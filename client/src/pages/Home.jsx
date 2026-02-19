import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Car, Settings, Building2 } from 'lucide-react';

const projects = [
    { id: 'retail', name: 'Retail Analytics', icon: ShoppingBag, color: '#ec4899', desc: 'Sales, inventory, and customer insights.' },
    { id: 'emission', name: 'Vehicle Emission', icon: Car, color: '#10b981', desc: 'Track and analyze carbon footprint data.' },
    { id: 'maintenance', name: 'Predictive Maintenance', icon: Settings, color: '#f59e0b', desc: 'Predict equipment failures before they happen.' },
    { id: 'enterprise', name: 'Enterprise Dashboard', icon: Building2, color: '#3b82f6', desc: 'Comprehensive business intelligence overview.' },
];

const Home = () => {
    const navigate = useNavigate();

    const handleSelect = (id) => {
        navigate(`/upload?projectType=${id}`);
    };

    return (
        <div className="text-center">
            <div style={{ padding: '4rem 0' }}>
                <h1 className="text-2xl" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    Transform Raw Data into <span style={{ color: 'var(--primary)' }}>Actionable Intelligence</span>
                </h1>
                <p className="text-muted" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
                    Select a project template to get started. Upload your data, and let AnalyticsForge handle the cleaning, processing, and visualization.
                </p>
            </div>

            <div className="grid grid-cols-2 container" style={{ maxWidth: '900px' }}>
                {projects.map((p) => (
                    <div key={p.id} className="card" style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => handleSelect(p.id)}>
                        <div className="flex items-center gap-4 mb-4">
                            <div style={{ backgroundColor: `${p.color}20`, padding: '0.75rem', borderRadius: '50%', color: p.color }}>
                                <p.icon size={24} />
                            </div>
                            <h3 className="text-xl">{p.name}</h3>
                        </div>
                        <p className="text-muted">{p.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
