// src/pages/Dashboard.tsx
import Card from "../components/Card";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    // Fetch stats
    api.get("/cycles/stats")
      .then((res) => setStats(prev => ({ ...prev, ...res.data.data })))
      .catch(() => console.log("error fetching stats"));

    // Fetch predictions
    api.get("/cycles/prediction")
      .then((res) => setStats(prev => ({ ...prev, prediction: res.data.data })))
      .catch(() => console.log("error fetching prediction"));
  }, []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
      <Card title="Avg Cycle Length">
        <p style={styles.stat}>{stats.averageCycleLength || 0} Days</p>
      </Card>

      <Card title="Regularity Score">
        <p style={styles.stat}>{stats.regularityScore || 0}%</p>
      </Card>

      <Card title="Avg Period Length">
        <p style={styles.stat}>{stats.averagePeriodLength || 0} Days</p>
      </Card>

      <Card title="Most Common Symptoms">
        <ul style={styles.list}>
          {stats.mostCommonSymptoms?.map((s: string) => (
            <li key={s}>{s}</li>
          )) || <li>No data yet</li>}
        </ul>
      </Card>

      {stats.prediction && (
        <Card title="Next Cycle Prediction">
          <p style={styles.prediction}>
            Expected Start: {new Date(stats.prediction.predictedStartDate).toLocaleDateString()}
          </p>
        </Card>
      )}
    </div>
  );
}

const styles = {
  stat: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  list: {
    paddingLeft: '20px',
    textAlign: 'left' as const,
  },
  prediction: {
    color: '#10b981',
    fontWeight: 'bold',
  }
};