# AnalyticsForge

AnalyticsForge is a comprehensive data intelligence platform designed to transform raw CSV data into actionable insights through automated processing and AI-driven visualization. Built with a robust React frontend and Node.js/Python backend, the system supports specialized analytics modules for Retail, Vehicle Emission, and Predictive Maintenance, offering features like automatic data cleaning, smart chart recommendations, interactive dashboards, and seamless PDF reporting for professional use cases.

## Prerequisites
- Node.js
- PostgreSQL
- Python 3.x

## Setup

1.  **Database**:
    - Ensure PostgreSQL is running.
    - Create a database named `analytics_forge`.
    - Update `server/.env` with your DB credentials.

2.  **Backend & Analytics Engine**:
    ```bash
    # Install server dependencies
    cd server
    npm install
    
    # Install Python dependencies
    pip install pandas numpy scikit-learn
    
    # Start the server (ensure DB is running first)
    node index.js
    ```

3.  **Frontend**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

## Features
- **Multi-Domain Analytics**: Specialized dashboards for Retail, Vehicle Emission, Predictive Maintenance, and Enterprise data.
- **Smart Data Processing**: Automatic cleaning, type inference, and normalization of raw CSV uploads.
- **AI-Powered Visualization**: Python-based engine that recommends the most relevant charts based on data characteristics.
- **Interactive Dashboards**: Dynamic charts, KPIs, and filtering options.
- **PDF Export**: Generate high-quality reports of your dashboards with a single click.
- **Project Management**: Save, view, and manage multiple analysis projects via the Dashboard List.
