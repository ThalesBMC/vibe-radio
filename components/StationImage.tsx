import { useState } from "react";
import Image from "next/image";

interface StationImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const defaultImage = "/radio-default.svg"; // Coloque uma imagem default no diretório public

export const StationImage: React.FC<StationImageProps> = ({
  src,
  alt,
  width = 48,
  height = 48,
  className = "",
}) => {
  const [imgSrc, setImgSrc] = useState(src || defaultImage);
  const [isError, setIsError] = useState(false);

  const handleError = () => {
    if (!isError) {
      setIsError(true);
      setImgSrc(defaultImage);
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden  ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className="object-contain"
        onError={handleError}
        loading="lazy"
        unoptimized
      />
    </div>
  );
};

export default StationImage;
