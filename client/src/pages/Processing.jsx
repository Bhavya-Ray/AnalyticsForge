import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const Processing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { data, projectType } = location.state || {}; // Expecting data from upload response

    if (!data) return <div className="container mt-4">No data to display. Please upload a file.</div>;

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <h2 className="text-2xl mb-4 text-center">Data Processing Complete</h2>

            <div className="card mb-4">
                <h3 className="text-xl mb-4 border-b pb-2">Processing Report</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-muted">Rows Processed</p>
                        <p className="text-xl">{data.rowsProcessed}</p>
                    </div>
                    <div>
                        <p className="text-muted">Status</p>
                        <p className="text-xl text-green-600 flex items-center gap-2">
                            <CheckCircle size={20} color="green" /> Success
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="card">
                    <h4 className="text-xl mb-2">Cleaning Actions</h4>
                    <ul style={{ listStyle: 'circle', paddingLeft: '1.5rem' }} className="text-muted">
                        <li>Removed null rows</li>
                        <li>Standardized column headers</li>
                        <li>Validated data types</li>
                    </ul>
                </div>
                <div className="card">
                    <h4 className="text-xl mb-2">Transformations</h4>
                    <ul style={{ listStyle: 'circle', paddingLeft: '1.5rem' }} className="text-muted">
                        <li>Calculated derived metrics</li>
                        <li>Aggregated monthly data</li>
                        <li>Generated KPIs</li>
                    </ul>
                </div>
            </div>

            <div className="text-center mt-4">
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/dashboard?id=${data.summary_id}`)}
                    style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
                >
                    View Visualization <ArrowRight className="ml-2" />
                </button>
            </div>
        </div>
    );
};

export default Processing;
