import React, { useEffect } from "react";
import "./App.css";
import NotesPage from "./pages/NotesPage";
import { useLocalStorage } from "./hooks/useLocalStorage";

// PUBLIC_INTERFACE
function App() {
  /** Retro theme supports two modes for a bit of flair. */
  const [theme, setTheme] = useLocalStorage("theme", "dark");

  useEffect(() => {
    // Apply theme via React effect (no direct DOM querying needed).
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="App">
      <div className="topRightControls">
        <button
          type="button"
          className="btn btnSmall btnGhost"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
      <NotesPage />
    </div>
  );
}

export default App;
