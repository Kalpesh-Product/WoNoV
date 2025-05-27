import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@mui/material";
import WidgetSection from "../WidgetSection"

const LazyDashboardWidget = ({ layout, widgets }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <WidgetSection layout={layout}>
          {widgets}
        </WidgetSection>
      ) : (
        <Skeleton variant="rectangular" height={300} />
      )}
    </div>
  );
};

export default LazyDashboardWidget;
