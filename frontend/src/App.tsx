// src/App.tsx

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Reports from "./pages/Reports";

// Simple Navbar Component
function Navbar() {
  return (
    <div style={styles.navbar}>
      <h2 style={styles.logo}>Lunara AI</h2>

      <div>
        <Link style={styles.link} to="/">
          Dashboard
        </Link>
        <Link style={styles.link} to="/chat">
          Chat
        </Link>
        <Link style={styles.link} to="/reports">
          Reports
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div style={styles.container}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

// 🎨 Simple Styling
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "#4f46e5",
    color: "white",
  },
  logo: {
    margin: 0,
  },
  link: {
    color: "white",
    marginLeft: "20px",
    textDecoration: "none",
    fontWeight: "bold",
  },
  container: {
    padding: "20px",
  },
};