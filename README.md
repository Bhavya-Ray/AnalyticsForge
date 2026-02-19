# AnalyticsForge 🚀

**AnalyticsForge** is a cutting-edge data intelligence platform designed to bridge the gap between raw data and actionable business insights. By integrating a modern React frontend with a powerful Python-based analytics engine, it provides specialized, AI-driven visualization solutions for diverse industries including Retail, Automotive (Emission), and Industrial Maintenance.

Whether you're tracking sales performance, monitoring vehicle emissions, or predicting equipment failures, AnalyticsForge automates the heavy lifting of data cleaning, processing, and visualization, allowing you to focus on decision-making.

---

## ✨ Key Features

### 1. **Multi-Domain Intelligence**
Tailored analytics experiences for specific industry needs:
*   **🛍️ Retail Analytics**: Deep dive into sales trends, inventory turnover, and customer behavior.
*   **🚗 Emission Monitoring**: Track vehicle carbon footprints, fuel efficiency, and environmental impact.
*   **⚙️ Predictive Maintenance**: Monitor equipment health, predict failures, and optimize maintenance schedules.
*   **📊 Enterprise Overview**: High-level business intelligence metrics for executives.

### 2. **🤖 Smart Data Processing**
Upload your raw CSV files and let our engine handle the rest:
*   **Auto-Cleaning**: Automatically removes nulls, duplicates, and standardizes formats.
*   **Type Inference**: Smart detection of numerical, categorical, and temporal data.
*   **Normalization**: Prepares data for accurate statistical analysis.

### 3. **📈 AI-Driven Visualization**
Our Python-powered recommendation engine (`chart_recommender.py`) analyzes your data's structure to automatically generate the most impactful charts:
*   **Trend Analysis**: Line and Area charts for time-series data.
*   **Distribution**: Histograms and Box plots for statistical spread.
*   **Correlation**: Scatter and Bubble charts to find hidden relationships.
*   **Comparison**: Bar, Column, and Radar charts for categorical comparison.

### 4. **💻 Interactive Dashboard**
*   **Dynamic Filtering**: Drill down into data by date, category, or region.
*   **KPI Cards**: Instant view of critical metrics (Total Revenue, Average Emission, Failure Rates).
*   **Responsive Design**: Optimized for desktops and large screens.

### 5. **📄 Professional Reporting**
*   **PDF Export**: generate high-quality, print-ready PDF reports of your entire dashboard with a single click.
*   **Project Management**: Save different analysis sessions and switch between them effortlessly.

---

## 🛠️ Tech Stack

### **Frontend**
*   **Framework**: React (Vite)
*   **Styling**: Plain CSS (with modern variables & utilities), Lucide React (Icons)
*   **Http Client**: Axios
*   **Routing**: React Router DOM

### **Backend**
*   **Runtime**: Node.js & Express
*   **Database**: PostgreSQL (Relational Data Storage)
*   **ORM**: Sequelize

### **Analytics Engine**
*   **Language**: Python 3.x
*   **Libraries**: Pandas (Data Manipulation), NumPy (Numerical Analysis), Scikit-learn (Basic ML utilities)
*   **Integration**: Spawns as a child process from Node.js for seamless data handoff.

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16+)
*   [Python](https://www.python.org/) (v3.8+)
*   [PostgreSQL](https://www.postgresql.org/)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Bhavya-Ray/AnalyticsForge.git
    cd AnalyticsForge
    ```

2.  **Database Setup**
    *   Create a PostgreSQL database named `analytics_forge`.
    *   Navigate to the `server` folder and create a `.env` file:
        ```env
        DB_NAME=analytics_forge
        DB_USER=your_postgres_user
        DB_PASS=your_postgres_password
        DB_HOST=localhost
        PORT=3000
        ```

3.  **Backend Setup**
    ```bash
    cd server
    npm install
    # Install Python dependencies for the analytics engine
    pip install pandas numpy scikit-learn
    ```

4.  **Frontend Setup**
    ```bash
    cd ../client
    npm install
    ```

### Running the Application

1.  **Start the Backend Server**
    ```bash
    cd server
    node index.js
    # Server will run on http://localhost:3000
    ```

2.  **Start the Frontend Client**
    ```bash
    cd client
    npm run dev
    # Client will run on http://localhost:5173
    ```

3.  **Open in Browser**
    Visit `http://localhost:5173` to start using AnalyticsForge!

---

## 📂 Project Structure

```
AnalyticsForge/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Charts)
│   │   ├── pages/          # Application pages (Dashboard, Upload, Home)
│   │   └── index.css       # Global styles
│
├── server/                 # Node.js Backend
│   ├── analytics_engine/   # Python scripts for data processing
│   │   ├── main.py         # Entry point for analysis
│   │   ├── analyzer.py     # Data cleaning & aggregation logic
│   │   └── chart_recommender.py # Chart selection logic
│   ├── controllers/        # API Controllers
│   ├── models/             # Sequelize Database Models
│   └── routes/             # API Routes
│
└── README.md               # Project Documentation
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
