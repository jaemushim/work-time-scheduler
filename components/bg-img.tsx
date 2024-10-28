import { useEffect, useState } from "react";
import { getImageRef } from "./img.js";
function BgImg({ className, layout, src, ...props }: any) {
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const setImageSize = async () => {
      const img = await getImageRef(src);

      setImgSize({ width: img?.width || 0, height: img?.height || 0 });
    };
    setImageSize();
  }, []);
  const ratio = imgSize.width / 200;

  return (
    <div
      style={{
        height: `${Math.round(imgSize.height / ratio) * 4}px`,
        backgroundImage: `url(${src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "400% 100%",
        backgroundPosition: "left-center",
      }}
      className={className}
    ></div>
  );
}

export default BgImg;
