const callbacks = new Map();

let resizeObserver = null;

export const register = (element, callback) => {
  if (!resizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      // batch updates once per frame
      requestAnimationFrame(() => {
        const updated = new Set();
        entries.forEach((entry) => {
          const cb = callbacks.get(entry.target);
          if (cb && !updated.has(cb)) {
            cb();
            updated.add(cb); // prevent duplicate calls
          }
        });
      });
    });
  }

  resizeObserver.observe(element);
  callbacks.set(element, callback);
};

export const unregister = (element) => {
  if (resizeObserver) {
    resizeObserver.unobserve(element);
  }
  callbacks.delete(element);
};
