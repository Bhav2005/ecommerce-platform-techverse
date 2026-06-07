import React, { useState, useRef } from 'react';

export const ImageZoom = ({ src, alt }) => {
  const [showLens, setShowLens] = useState(false);
  const [lensStyle, setLensStyle] = useState({});
  const [imageStyle, setImageStyle] = useState({});
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const { left, top, width, height } = container.getBoundingClientRect();
    
    // Position of cursor relative to container bounding box
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Boundary constraints
    if (x < 0 || x > width || y < 0 || y > height) {
      setShowLens(false);
      setImageStyle({});
      return;
    }

    setShowLens(true);

    // Zoom math parameters
    const scale = 2.2;
    const px = (x / width) * 100;
    const py = (y / height) * 100;

    setLensStyle({
      left: `${x}px`,
      top: `${y}px`,
      display: 'block'
    });

    setImageStyle({
      transform: `scale(${scale})`,
      transformOrigin: `${px}% ${py}%`
    });
  };

  const handleMouseLeave = () => {
    setShowLens(false);
    setImageStyle({});
  };

  return (
    <div
      ref={containerRef}
      className="zoom-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'zoom-in',
        width: '100%',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)'
      }}
    >
      <img
        src={src}
        alt={alt}
        className="zoom-image"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          ...imageStyle,
          transition: 'transform 0.1s ease-out'
        }}
      />
      {showLens && (
        <div
          className="zoom-lens"
          style={lensStyle}
        />
      )}
    </div>
  );
};
export default ImageZoom;
