export async function optimizeAvatar(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const size = 256;

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject(new Error("No canvas context"));

      const scale = Math.max(size / img.width, size / img.height);
      const x = (size / scale - img.width) / 2;
      const y = (size / scale - img.height) / 2;

      ctx.drawImage(img, x * scale, y * scale, img.width * scale, img.height * scale);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newName = `avatar_${Date.now()}.webp`;
            resolve(new File([blob], newName, { type: "image/webp" }));
          } else {
            reject(new Error("Fallo al crear Blob de avatar"));
          }
        },
        "image/webp",
        0.8,
      );
    };
    img.onerror = () => reject(new Error("Fallo al cargar imagen"));
    img.src = url;
  });
}
