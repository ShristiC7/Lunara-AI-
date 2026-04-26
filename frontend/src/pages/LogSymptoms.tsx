import React, { useState } from 'react';
import { api } from '../services/api';

export default function LogSymptoms() {
  const [painLevel, setPainLevel] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [flowIntensity, setFlowIntensity] = useState(0);
  const [mood, setMood] = useState(5);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/symptoms', {
        date: new Date().toISOString(),
        painLevel,
        energyLevel,
        flowIntensity,
        mood,
        notes,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error logging symptoms', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Log Your Symptoms</h2>
      {success && <p style={styles.success}>Symptoms logged successfully! ✨</p>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Pain Level (0-10): {painLevel}</label>
          <input 
            type="range" min="0" max="10" 
            value={painLevel} 
            onChange={(e) => setPainLevel(parseInt(e.target.value))} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Energy Level (0-10): {energyLevel}</label>
          <input 
            type="range" min="0" max="10" 
            value={energyLevel} 
            onChange={(e) => setEnergyLevel(parseInt(e.target.value))} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Flow Intensity (0-5): {flowIntensity}</label>
          <input 
            type="range" min="0" max="5" 
            value={flowIntensity} 
            onChange={(e) => setFlowIntensity(parseInt(e.target.value))} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Mood (0-10): {mood}</label>
          <input 
            type="range" min="0" max="10" 
            value={mood} 
            onChange={(e) => setMood(parseInt(e.target.value))} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Notes</label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="How are you feeling?"
            style={styles.textarea}
          />
        </div>

        <button type="submit" style={styles.button}>Log Today's Symptoms</button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  title: {
    color: '#4f46e5',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  textarea: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    minHeight: '80px',
  },
  button: {
    padding: '12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#4f46e5',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  success: {
    color: 'green',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: '#f0fff0',
    borderRadius: '4px',
    marginBottom: '20px',
  },
};
