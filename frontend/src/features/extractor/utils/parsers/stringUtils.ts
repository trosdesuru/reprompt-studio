export const cleanNullBytes = (text: string): string => {
  return text.replace(/\0/g, "").trim();
};

export const cleanA1111Prefixes = (text: string): string => {
  return text
    .replace(/^UNICODE\x00/, "")
    .replace(/^ASCII\x00\x00\x00/, "")
    .trim();
};

export const extractFileName = (path: string): string => {
  return path.split("/").pop() || path;
};
