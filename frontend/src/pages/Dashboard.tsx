// src/pages/Dashboard.tsx
import Card from "../components/Card";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    api.get("/stats")
      .then((res) => setStats(res.data))
      .catch(() => console.log("error"));
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