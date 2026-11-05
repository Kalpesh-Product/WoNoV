import { useLayoutEffect, useRef, useState } from "react";

const useBannerMenuAlignment = () => {
  const headingRef = useRef(null);
  const navigationRef = useRef(null);
  const [navigationWidth, setNavigationWidth] = useState(null);

  useLayoutEffect(() => {
    const wideViewport = window.matchMedia("(min-width: 1700px)");
    let active = true;

    const updateWidth = () => {
      if (!active) return;
      if (!wideViewport.matches) {
        setNavigationWidth(null);
        return;
      }

      const heading = headingRef.current;
      const navigation = navigationRef.current;
      if (!heading || !navigation) return;

      const headingEnd = heading.getBoundingClientRect().right;
      const navigationStart = navigation.getBoundingClientRect().left;
      const rightPadding = parseFloat(getComputedStyle(navigation).paddingRight) || 0;
      const width = Math.ceil(headingEnd - navigationStart + rightPadding);
      setNavigationWidth(width > 0 ? width : null);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (headingRef.current) observer.observe(headingRef.current);
    window.addEventListener("resize", updateWidth);
    wideViewport.addEventListener("change", updateWidth);
    document.fonts?.ready.then(updateWidth);

    return () => {
      active = false;
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
      wideViewport.removeEventListener("change", updateWidth);
    };
  }, []);

  return {
    headingRef,
    navigationRef,
    navigationStyle:
      navigationWidth === null
        ? undefined
        : { width: navigationWidth, maxWidth: "none" },
  };
};

export default useBannerMenuAlignment;
