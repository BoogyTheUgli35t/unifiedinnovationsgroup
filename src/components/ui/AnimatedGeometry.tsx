import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

export function AnimatedGeometry() {
  const shouldReduceMotion = useReducedMotion();

  const shapes = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: 200 + Math.random() * 300,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      delay: i * 0.5,
    }));
  }, []);

  if (shouldReduceMotion) {
    return (
      <div className="absolute inset-0 opacity-20">
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className="absolute border border-gold/30"
            style={{
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              transform: `rotate(${shape.rotation}deg)`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 opacity-20">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute"
          initial={{
            x: `${shape.x}%`,
            y: `${shape.y}%`,
            rotate: shape.rotation,
            opacity: 0,
          }}
          animate={{
            x: [`${shape.x}%`, `${shape.x + 10}%`, `${shape.x}%`],
            y: [`${shape.y}%`, `${shape.y - 10}%`, `${shape.y}%`],
            rotate: [shape.rotation, shape.rotation + 90, shape.rotation],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 20 + shape.delay * 2,
            repeat: Infinity,
            ease: "linear",
            delay: shape.delay,
          }}
          style={{ width: shape.size, height: shape.size }}
        >
          {/* Tesseract-inspired nested squares */}
          <div className="relative w-full h-full">
            <div className="absolute inset-0 border border-gold/30 rotate-0" />
            <div className="absolute inset-[15%] border border-gold/20 rotate-12" />
            <div className="absolute inset-[30%] border border-gold/10 rotate-24" />
            {/* Connecting lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <line x1="0" y1="0" x2="15" y2="15" stroke="hsl(43 74% 49% / 0.2)" strokeWidth="0.5" />
              <line x1="100" y1="0" x2="85" y2="15" stroke="hsl(43 74% 49% / 0.2)" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="15" y2="85" stroke="hsl(43 74% 49% / 0.2)" strokeWidth="0.5" />
              <line x1="100" y1="100" x2="85" y2="85" stroke="hsl(43 74% 49% / 0.2)" strokeWidth="0.5" />
            </svg>
          </div>
        </motion.div>
      ))}

      {/* Floating particles */}
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-gold/40"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: 0,
          }}
          animate={{
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}