// src/pages/Chat.tsx
import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Insight {
  id: string;
  type: string;
  content: string;
  severity: string;
  generatedAt: string;
}

export default function Chat() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get("/insights");
      setInsights(res.data.data);
    } catch (err) {
      console.error("Error fetching insights", err);
    }
    setLoading(false);
  };

  const triggerAnalysis = async () => {
    setTriggering(true);
    try {
      await api.post("/insights/trigger");
      alert("Analysis triggered! Check back in a few moments.");
      fetchInsights();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to trigger analysis");
    }
    setTriggering(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>AI Insights</h2>
        <button 
          onClick={triggerAnalysis} 
          disabled={triggering}
          style={styles.button}
        >
          {triggering ? "Analyzing..." : "Trigger New Analysis"}
        </button>
      </div>

      {loading ? (
        <p>Loading insights...</p>
      ) : (
        <div style={styles.insightList}>
          {insights.length === 0 ? (
            <p>No insights generated yet. Log some symptoms and trigger an analysis!</p>
          ) : (
            insights.map((insight) => (
              <div key={insight.id} style={{ ...styles.insightCard, borderLeft: `5px solid ${insight.severity === 'HIGH' ? 'red' : insight.severity === 'MEDIUM' ? 'orange' : 'blue'}` }}>
                <div style={styles.insightHeader}>
                  <span style={styles.type}>{insight.type}</span>
                  <span style={styles.date}>{new Date(insight.generatedAt).toLocaleDateString()}</span>
                </div>
                <p style={styles.content}>{insight.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  insightList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  insightCard: {
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  insightHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  type: {
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  date: {
    fontSize: '12px',
    color: '#666',
  },
  content: {
    margin: 0,
    lineHeight: '1.5',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};