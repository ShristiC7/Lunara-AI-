// src/pages/Reports.tsx
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    api.get("/reports")
      .then((res) => setReports(res.data))
      .catch(() => console.log("Error fetching reports"));
  }, []);

  return (
    <div className="container">
      <h2>Reports</h2>

      {reports.map((r, i) => (
        <div key={i} className="box">
          <a href={r.url} target="_blank">
            {r.name}
          </a>
        </div>
      ))}
    </div>
  );
}