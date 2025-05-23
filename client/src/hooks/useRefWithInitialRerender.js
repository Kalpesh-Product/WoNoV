// hooks/useRefWithInitialRerender.js
import { useRef, useState, useEffect } from "react";

/**
 * A custom hook that returns a ref and a boolean `hasRendered`.
 * The component will re-render once after the ref is attached to the DOM.
 */
export default function useRefWithInitialRerender() {
  const ref = useRef(null);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (ref.current && !hasRendered) {
      setHasRendered(true); // Trigger a one-time re-render
    }
  }, [ref.current]);

  return { ref, hasRendered };
}
