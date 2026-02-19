import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const Navbar = () => {
    return (
        <nav style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
            <div className="container flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)' }}>
                    <BarChart3 size={24} />
                    <span>AnalyticsForge</span>
                </Link>
                <div className="flex gap-4">
                    <Link to="/dashboards" style={{ color: 'var(--text-muted)' }}>Dashboard</Link>
                    <Link to="/about" style={{ color: 'var(--text-muted)' }}>About</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
