import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Upload as UploadIcon, FileText, ArrowLeft } from 'lucide-react';

const UploadPage = () => {
    const [searchParams] = useSearchParams();
    const projectType = searchParams.get('projectType') || 'general';
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectType', projectType);
        formData.append('projectName', projectName);

        try {
            // Assuming backend is on port 3000
            const response = await axios.post('http://localhost:3000/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log(response.data);
            // Pass data to processing/visualization page via state or just navigate
            // For now, let's navigate to processing page with some state
            navigate('/processing', { state: { data: response.data, projectType, projectName } });
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Check console.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <Link to="/" className="flex items-center text-primary hover:underline mb-8" style={{ width: 'fit-content' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Home
            </Link>
            <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <h2 className="text-2xl mb-2">Create New {projectType.toUpperCase()} Project</h2>
                    <p className="text-muted mb-8">Give your project a name and upload your data</p>

                    <div className="flex flex-col gap-4 mb-6" style={{ textAlign: 'left' }}>
                        <label style={{ fontWeight: '500', color: 'var(--text-main)' }}>Project Name</label>
                        <input
                            type="text"
                            placeholder={`e.g. My ${projectType.charAt(0).toUpperCase() + projectType.slice(1)} Analysis`}
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '2rem', marginBottom: '2rem' }}>
                        <input
                            type="file"
                            accept=".csv"
                            id="file-upload"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                            {file ? (
                                <>
                                    <FileText size={48} className="text-muted mb-2" />
                                    <span className="text-xl">{file.name}</span>
                                </>
                            ) : (
                                <>
                                    <UploadIcon size={48} className="text-muted mb-2" />
                                    <span className="text-muted">Click to select CSV file</span>
                                </>
                            )}
                        </label>
                    </div>
                    <button
                        className="btn btn-primary"
                        disabled={!file || uploading}
                        onClick={handleUpload}
                        style={{ width: '100%', padding: '1rem' }}
                    >
                        {uploading ? 'Processing...' : 'Upload & Process'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
