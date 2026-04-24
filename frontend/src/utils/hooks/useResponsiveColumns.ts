import { useState, useEffect, useMemo } from "react";

export function useResponsiveColumns<T>(items: T[]) {
  const [columnCount, setColumnCount] = useState(5);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumnCount(1);
      else if (window.innerWidth < 768) setColumnCount(2);
      else if (window.innerWidth < 1024) setColumnCount(3);
      else if (window.innerWidth < 1280) setColumnCount(4);
      else setColumnCount(5);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const columns = useMemo(() => {
    const cols: T[][] = Array.from({ length: columnCount }, () => []);
    items.forEach((item, index) => {
      cols[index % columnCount].push(item);
    });
    return cols;
  }, [items, columnCount]);

  return { columns, columnCount };
}
