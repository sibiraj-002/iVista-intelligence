"use client";

import { useEffect, useRef, useState } from "react";
import { ResponsiveContainer } from "recharts";

export function ResponsiveChart({ children, className, height = 288 }) {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return undefined;
    }

    const update = () => {
      const { height: measuredHeight, width } = node.getBoundingClientRect();
      setIsReady(width > 0 && measuredHeight > 0);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, [height]);

  return (
    <div
      className={className}
      ref={containerRef}
      style={{ height, minWidth: 0, width: "100%" }}
    >
      {isReady ? (
        <ResponsiveContainer height="100%" minWidth={0} width="100%">
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
