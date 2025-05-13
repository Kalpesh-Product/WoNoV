import { useEffect, useRef, useState } from "react";

export default function useResponsiveChart(debounceMs = 300) {
  const containerRef = useRef(null);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    let debounceTimeout = null;

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        setChartKey((prev) => prev + 1);
      }, debounceMs); // wait before triggering re-render
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      clearTimeout(debounceTimeout);
      resizeObserver.disconnect();
    };
  }, [debounceMs]);

  return { containerRef, chartKey };
}
