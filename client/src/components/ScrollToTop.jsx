// components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ targetId = "scrollable-content" }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const container = document.getElementById(targetId);
    if (container) {
      container.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
