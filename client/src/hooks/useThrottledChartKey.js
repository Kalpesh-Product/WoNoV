import { useState, useEffect } from "react";

const useThrottledChartKey = (delay = 100) => {
  const [chartKey, setChartKey] = useState(Date.now());

  useEffect(() => {
    let throttleTimeout = null;

    const handleResize = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          setChartKey(Date.now()); // force re-render
          throttleTimeout = null;
        }, delay);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [delay]);

  return chartKey;
};

export default useThrottledChartKey;
