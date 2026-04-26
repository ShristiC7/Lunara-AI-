// src/components/Navbar.tsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="box">
      <Link to="/">Dashboard</Link> |{" "}
      <Link to="/chat">Chat</Link> |{" "}
      <Link to="/reports">Reports</Link>
    </div>
  );
}