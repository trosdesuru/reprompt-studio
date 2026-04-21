import { IconFolderOpen } from "@tabler/icons-react";

interface DirectoryHeaderProps {
  name: string;
}

export function DirectoryHeader({ name }: DirectoryHeaderProps) {
  return (
    <div className="mb-6 pb-4 animate-in fade-in duration-500">
      <h2 className="text-2xl lg:text-xl text-foreground/50 font-medium tracking-tighter flex items-center gap-3">
        <IconFolderOpen className="text-foreground/50" size={24} />
        {name}
      </h2>
    </div>
  );
}
