import Link from "next/link";
import { IconChevronRight, IconHome } from "@tabler/icons-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
}

export function Breadcrumbs({ items, homeHref = "/" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1 text-xs md:text-sm font-mono text-muted-foreground overflow-x-auto pb-2 scrollbar-none"
    >
      <Link href={homeHref} className="hover:text-accent-foreground transition-colors flex items-center">
        <IconHome size={16} stroke={1.5} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center space-x-1 whitespace-nowrap">
            <IconChevronRight size={14} className="opacity-50" stroke={1.5} />
            {isLast || !item.href ? (
              <span
                className="font-bold text-foreground tracking-widest uppercase truncate max-w-150px sm:max-w-300px"
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-(--accent-color) transition-colors tracking-widest uppercase truncate max-w-150px sm:max-w-200px"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
