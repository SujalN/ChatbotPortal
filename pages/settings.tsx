import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Settings() {
  const [userGroup, setUserGroup] = useState<number>(1); // default to group 1
  const [darkMode, setDarkMode] = useState<boolean>(true); // default dark mode

  useEffect(() => {
    // Load previous settings from localStorage if available
    const savedGroup = localStorage.getItem("userGroup");
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedGroup) setUserGroup(Number(savedGroup));
    if (savedDarkMode) setDarkMode(savedDarkMode === "true");
  }, []);

  useEffect(() => {
    // Save settings whenever they change
    localStorage.setItem("userGroup", String(userGroup));
    localStorage.setItem("darkMode", String(darkMode));

    // Apply theme to <html> for global styling
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [userGroup, darkMode]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", color: "white" }}>
      <h1>Settings</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>Privilege Group</h2>
        <p>Select which privilege group you belong to:</p>
        <div style={{ display: "flex", gap: "1rem" }}>
          {[1, 2, 3].map((group) => (
            <label key={group} style={{ cursor: "pointer" }}>
              <input
                type="radio"
                value={group}
                checked={userGroup === group}
                onChange={() => setUserGroup(group)}
                style={{ marginRight: "5px" }}
              />
              Group {group}
            </label>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: "20px" }}>
        <h2>Theme</h2>
        <p>Toggle between light and dark mode:</p>
        <label style={{ cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            style={{ marginRight: "5px" }}
          />
          Dark Mode
        </label>
      </div>
    </div>
  );
}
