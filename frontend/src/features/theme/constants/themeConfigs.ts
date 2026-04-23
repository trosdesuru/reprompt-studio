export type ThemeOption = "light" | "dark" | string;

export interface ThemeColors {
  wrapper: string;
  header: string;
  dots: string;
  lines: string;
  sidebar: string;
  content: string;
  primaryLine: string;
  contentLines: string;
}

export const THEME_CONFIGS: Record<
  ThemeOption,
  { title: string; description: string; colors: ThemeColors }
> = {
  light: {
    title: "Tema Claro",
    description: "Un aspecto limpio y luminoso, ideal para trabajar de día.",
    colors: {
      wrapper: "bg-[#f6f8fa]",
      header: "bg-white border-gray-200",
      dots: "bg-gray-300",
      lines: "bg-gray-200",
      sidebar: "bg-white border-gray-200",
      content: "bg-white border-gray-200",
      primaryLine: "bg-primary/40",
      contentLines: "bg-gray-100",
    },
  },
  dark: {
    title: "Tema Oscuro",
    description: "El tema oscuro original de reprompt.",
    colors: {
      wrapper: "bg-[#0d1117]",
      header: "bg-[#161b22] border-gray-800",
      dots: "bg-gray-600",
      lines: "bg-gray-700",
      sidebar: "bg-[#161b22] border-transparent",
      content: "bg-[#010409] border-gray-800",
      primaryLine: "bg-primary/50",
      contentLines: "bg-gray-800",
    },
  },
};
