export const getImageRef = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
};
// Usage
const setImageSize = async () => {
  const img = await getImageRef(src);
  return { width: img?.width || 0, height: img?.height || 0 };
};
