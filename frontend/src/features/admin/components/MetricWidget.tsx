"use client";

import React from "react";

interface MetricWidgetProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export function MetricWidget({ title, value, icon }: Readonly<MetricWidgetProps>) {
  return (
    <div className="p-6 bg-background border border-border rounded-xl shadow-sm flex items-center gap-4">
      <div className="p-3 bg-accent/10 text-accent rounded-lg">{icon}</div>
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{title}</p>
        <p className="text-2xl font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}
