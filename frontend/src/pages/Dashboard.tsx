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
    <div style={{ display: "flex", gap: "20px" }}>
      <Card title="Predictions">
        <p>{stats.predictions || 0}</p>
      </Card>

      <Card title="Anomalies">
        <p>{stats.anomalies || 0}</p>
      </Card>

      <Card title="Alerts">
        <p>{stats.alerts || 0}</p>
      </Card>
    </div>
  );
}