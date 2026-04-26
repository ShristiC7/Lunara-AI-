// src/components/Loader.tsx
export default function Loader() {
  return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
    </div>
  );
}

const styles = {
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "5px solid #ccc",
    borderTop: "5px solid blue",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};