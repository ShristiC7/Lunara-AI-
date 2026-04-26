// src/pages/Reports.tsx
import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Report {
  id: string;
  generatedAt: string;
  downloadUrl: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports");
      setReports(res.data.data);
    } catch (err) {
      console.error("Error fetching reports", err);
    }
    setLoading(false);
  };

  const triggerReport = async () => {
    setTriggering(true);
    try {
      await api.post("/reports/trigger", { dateRange: '3mo' });
      alert("Report generation started! It will appear here shortly.");
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to trigger report");
    }
    setTriggering(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Health Reports</h2>
        <button 
          onClick={triggerReport} 
          disabled={triggering}
          style={styles.button}
        >
          {triggering ? "Generating..." : "Generate New Report"}
        </button>
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <div style={styles.list}>
          {reports.length === 0 ? (
            <p>No reports found. Generate one to see your health summary!</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} style={styles.card}>
                <span>Report from {new Date(report.generatedAt).toLocaleDateString()}</span>
                <a 
                  href={report.downloadUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  Download PDF
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: 'bold',
  }
};