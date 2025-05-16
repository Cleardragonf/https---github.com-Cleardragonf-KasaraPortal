import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const moveElement = (element: HTMLDivElement) => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;

      // Ensure the element stays fully within the container bounds
      const maxX = Math.max(0, containerWidth - elementWidth);
      const maxY = Math.max(0, containerHeight - elementHeight);

      const randomX = Math.random() * maxX;
      const randomY = Math.random() * maxY;

      element.style.transform = `translate(${randomX}px, ${randomY}px)`;

      setTimeout(() => moveElement(element), 3000); // Move every 3 seconds
    };

    const resizeHandler = () => {
      elementsRef.current.forEach((element) => {
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;

        const containerWidth = containerRef.current?.clientWidth || 0;
        const containerHeight = containerRef.current?.clientHeight || 0;

        const maxX = Math.max(0, containerWidth - elementWidth);
        const maxY = Math.max(0, containerHeight - elementHeight);

        const currentTransform = element.style.transform.match(/translate\(([^,]+)px, ([^,]+)px\)/);
        if (currentTransform) {
          const currentX = Math.min(parseFloat(currentTransform[1]), maxX);
          const currentY = Math.min(parseFloat(currentTransform[2]), maxY);
          element.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
      });
    };

    elementsRef.current.forEach((element) => {
      moveElement(element);
    });

    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  return (
    <div className="animated-background" ref={containerRef}>
      <div className="bouncing-text" ref={addToRefs}>
        MMIS
      </div>
      <div className="bouncing-text" ref={addToRefs}>
        X12
      </div>
      <div className="rotating-icon nebraska-icon" ref={addToRefs}></div>
    </div>
  );
};

export default AnimatedBackground;
