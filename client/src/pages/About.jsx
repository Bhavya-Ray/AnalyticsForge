import React from 'react';
import { Shield, Zap, BarChart, Database, Cpu, Layout, BarChart3 } from 'lucide-react';

const About = () => {
    const features = [
        {
            icon: <Cpu className="text-blue-500" size={32} />,
            title: "AI-Powered Insights",
            description: "Our advanced Python engine automatically recommends the most relevant visualizations for your dataset using smart heuristics."
        },
        {
            icon: <Zap className="text-amber-500" size={32} />,
            title: "Instant Processing",
            description: "Upload your CSV and get a professional dashboard in seconds. No complex configuration required."
        },
        {
            icon: <Layout className="text-emerald-500" size={32} />,
            title: "Premium Dashboards",
            description: "Experience high-fidelity, interactive charts with a unified 6-column grid system designed for maximum readability."
        },
        {
            icon: <Database className="text-purple-500" size={32} />,
            title: "Data Cleaning",
            description: "Automatic normalization of currencies, dates, and types ensures your data is always ready for analysis."
        },
        {
            icon: <Shield className="text-rose-500" size={32} />,
            title: "Project Management",
            description: "Keep your work organized with custom project naming and unique ID-based routing for every analysis."
        },
        {
            icon: <BarChart className="text-indigo-500" size={32} />,
            title: "Multi-Domain Support",
            description: "Specialized analysis modes for Retail, Emission, and Enterprise data, with generic fallbacks for anything else."
        }
    ];

    return (
        <div className="animation-fade-in py-12">
            <div className="container" style={{ maxWidth: '1000px' }}>
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #2563eb, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>
                        Transform Data into Intelligence
                    </h1>
                    <p className="text-xl text-muted mx-auto" style={{ maxWidth: '700px', lineHeight: '1.6' }}>
                        AnalyticsForge is a next-generation data visualization platform that leverages artificial intelligence to bridge the gap between raw data and actionable business insights.
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-2 gap-12 mb-20">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                        <p className="text-lg text-muted mb-4" style={{ lineHeight: '1.7' }}>
                            We believe that data should be accessible, understandable, and beautiful. AnalyticsForge was built to empower professionals to analyze complex datasets without needing a degree in data science.
                        </p>
                        <p className="text-lg text-muted" style={{ lineHeight: '1.7' }}>
                            By combining the power of a Python-driven analytical core with a lightning-fast React frontend, we provide a seamless experience from file upload to final PDF export.
                        </p>
                    </div>
                    <div className="card aspect-square flex items-center justify-center gap-6" style={{ backgroundColor: '#eff6ff', borderRadius: '2rem' }}>
                        <BarChart3 className="text-primary" size={100} strokeWidth={1.5} />
                        <span className="text-primary font-bold tracking-tight" style={{ fontSize: '2.5rem' }}>AnalyticsForge</span>
                    </div>
                </div>

                {/* Features Grid */}
                <h2 className="text-3xl font-bold text-center mb-12">Core Capabilities</h2>
                <div className="grid grid-cols-3 gap-8 mb-24">
                    {features.map((feature, index) => (
                        <div key={index} className="card hover:border-primary transition-all duration-300" style={{ padding: '2rem' }}>
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Technology Stack */}
                <div className="card" style={{ padding: '3rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h2 className="text-2xl font-bold mb-8 text-center">Built with Modern Technology</h2>
                    <div className="flex justify-center flex-wrap gap-8 opacity-75">
                        <div className="flex items-center gap-2 font-semibold text-lg">
                            <span style={{ color: '#61DAFB' }}>React</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-lg">
                            <span style={{ color: '#3178C6' }}>TypeScript</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-lg">
                            <span style={{ color: '#3776AB' }}>Python</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-lg">
                            <span style={{ color: '#336791' }}>PostgreSQL</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-lg">
                            <span style={{ color: '#00D632' }}>Node.js</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-lg">
                            <span style={{ color: '#06B6D4' }}>Tailwind CSS</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
