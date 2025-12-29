import { type RefCallback, useCallback, useState } from "react";

interface ContentRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useContentRect(): [RefCallback<HTMLElement>, ContentRect] {
  const [contentRect, setContentRect] = useState<ContentRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const refCallback = useCallback((element: HTMLElement | null) => {
    if (element == null) return;

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setContentRect(entry.contentRect);
      });
    });
    resizeObserver.observe(element);
    return () => {
      resizeObserver.unobserve(element);
    };
  }, []);

  return [refCallback, contentRect];
}
