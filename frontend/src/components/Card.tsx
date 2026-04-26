// src/components/Card.tsx
import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
}

export default function Card({ title, children }: CardProps) {
  return (
    <div style={styles.card}>
      {title && <h3 style={styles.title}>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
    width: "300px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    margin: "10px",
  },
  title: {
    marginBottom: "10px",
  },
};