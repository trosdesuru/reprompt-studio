export const cleanNullBytes = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\0/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .trim();
};

export const cleanA1111Prefixes = (text: string): string => {
  return text.replace(/^(UNICODE|ASCII)\x00*/i, "").trim();
};

export const extractFileName = (path: string): string => {
  if (!path) return "Archivo";
  return path.split(/[\\/]/).pop() || path;
};
