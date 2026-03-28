// frontend/src/components/layout/Header/Header.types.ts
export interface HeaderProps {
  variant?: "default" | "viewer";
  title?: string;
  onCloseViewer?: () => void;
}
