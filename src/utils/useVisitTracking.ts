import { useEffect } from "react";
import { getUsername, BACKEND_URL } from "./backend";

// =================== VISIT TRACKING (hook) ===================
export function useVisitTracking() {
  useEffect(() => {
    const trackVisit = async () => {
      const username = await getUsername();
      try {
        console.log("📡 Sending visit tracking for:", username);
        await fetch(`${BACKEND_URL}/api/track-visit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
      } catch (err) {
        console.error("Visit tracking failed:", err);
      }
    };

    // Run immediately once on mount
    trackVisit();

    // Repeat every 30s to keep session alive
    const id = setInterval(trackVisit, 30000);
    return () => clearInterval(id);
  }, []);
}