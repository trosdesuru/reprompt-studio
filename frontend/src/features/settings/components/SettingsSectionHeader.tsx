interface SettingsSectionHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function SettingsSectionHeader({ title, icon }: SettingsSectionHeaderProps) {
  return (
    <div className="pb-4 border-b border-border/80 mb-6">
      <div className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <h2 className="text-xl font-mono font-medium tracking-tight">{title}</h2>
      </div>
      {/* <p className="text-sm font-mono text-muted-foreground mt-1">{description}</p> */}
    </div>
  );
}
