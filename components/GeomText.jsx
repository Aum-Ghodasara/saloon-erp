"use client";

import React from "react";
import { motion } from "framer-motion";

// Map of letters to their SVG paths
// ViewBox is 0 0 100 100 for all letters
const LETTER_PATHS = {
  R: [
    { d: "M 15 10 L 15 90", key: "r-stem" },
    { d: "M 15 10 L 80 10 L 15 50", key: "r-loop" },
    { d: "M 15 50 L 80 90", key: "r-leg" }
  ],
  I: [
    { d: "M 50 10 L 50 90", key: "i-stem" }
  ],
  F: [
    { d: "M 20 10 L 20 90", key: "f-stem" },
    { d: "M 20 10 L 80 10", key: "f-top" },
    { d: "M 20 50 L 75 75", key: "f-mid" }
  ],
  T: [
    { d: "M 10 10 L 90 10", key: "t-top" },
    { d: "M 50 10 L 50 90", key: "t-stem" }
  ],
  S: [
    { d: "M 80 10 L 20 10 L 20 45 L 80 55 L 80 90 L 20 90", key: "s-spine" }
  ],
  H: [
    { d: "M 15 10 L 15 90", key: "h-left" },
    { d: "M 85 10 L 85 90", key: "h-right" },
    { d: "M 15 50 L 85 50", key: "h-mid" }
  ],
  E: [
    { d: "M 20 10 L 20 90", key: "e-stem" },
    { d: "M 20 10 L 80 10", key: "e-top" },
    { d: "M 20 50 L 70 50", key: "e-mid" },
    { d: "M 20 90 L 80 90", key: "e-bot" }
  ],
  A: [
    { d: "M 50 10 L 15 90", key: "a-left" },
    { d: "M 50 10 L 85 90", key: "a-right" },
    { d: "M 78.4 75 L 0 75", key: "a-cross" }
  ],
  "&": [
    { d: "M 25 10 L 25 90", key: "amp-stem" },
    { d: "M 25 10 L 60 10", key: "amp-top" },
    { d: "M 25 90 L 60 90", key: "amp-bot" },
    { d: "M 25 50 L 80 50", key: "amp-mid" },
    { d: "M 65 30 L 65 80", key: "amp-cross" }
  ],
  U: [
  { d: "M 20 10 L 20 75", key: "u-left" },
  { d: "M 20 75 L 35 90", key: "u-bottom-left" },
  { d: "M 35 90 L 65 90", key: "u-bottom" },
  { d: "M 65 90 L 80 75", key: "u-bottom-right" },
  { d: "M 80 75 L 80 10", key: "u-right" }
],
  G: [
    { d: "M 80 10 L 20 10 L 20 90 L 80 90 L 80 50 L 50 50", key: "g-path" }
  ],
  D: [
    { d: "M 20 10 L 20 90", key: "d-stem" },
    { d: "M 20 10 L 55 10 L 80 35 L 80 65 L 55 90 L 20 90", key: "d-curve" }
  ],
  Y: [
    { d: "M 20 10 L 50 45", key: "y-left" },
    { d: "M 80 10 L 50 45", key: "y-right" },
    { d: "M 50 45 L 50 90", key: "y-stem" }
  ],
  O: [
    { d: "M 20 10 L 80 10 L 80 90 L 20 90 L 20 10", key: "o-path" }
  ],
  N: [
    { d: "M 20 10 L 20 90", key: "n-left" },
    { d: "M 20 10 L 80 90", key: "n-diag" },
    { d: "M 80 10 L 80 90", key: "n-right" }
  ],
  M: [
    { d: "M 15 10 L 15 90", key: "m-left" },
    { d: "M 15 10 L 50 55", key: "m-diag-left" },
    { d: "M 85 10 L 50 55", key: "m-diag-right" },
    { d: "M 85 10 L 85 90", key: "m-right" }
  ],
  B: [
    { d: "M 20 10 L 20 90", key: "b-stem" },
    { d: "M 20 10 L 55 10 L 70 25 L 70 50 L 20 50", key: "b-top-loop" },
    { d: "M 20 50 L 60 50 L 75 65 L 75 90 L 20 90", key: "b-bot-loop" }
  ],
  L: [
    { d: "M 25 10 L 25 90", key: "l-stem" },
    { d: "M 25 90 L 75 90", key: "l-foot" }
  ]
};

const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: i * 0.1, type: "tween", duration: 1.2, ease: "easeInOut" },
      opacity: { delay: i * 0.1, duration: 0.15 }
    }
  })
};

export default function GeomText({ text, size = "1em", strokeWidth = 6, color = "currentColor", animate = true, className }) {
  const letters = text.toUpperCase().split("");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <motion.div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.15em",
        fontSize: size
      }}
      variants={containerVariants}
      initial={animate ? "hidden" : "visible"}
      animate="visible"
    >
      {letters.map((char, charIdx) => {
        const paths = LETTER_PATHS[char];
        if (!paths) return <div key={charIdx} style={{ width: "0.6em" }} />;

        return (
          <svg
            key={charIdx}
            viewBox="0 0 100 100"
            fill="none"
            style={{ 
              display: "block", 
              overflow: "visible",
              width: "1em",
              height: "1em"
            }}
          >
            {paths.map((path, pathIdx) => (
              <motion.path
                key={path.key}
                d={path.d}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="square"
                strokeLinejoin="miter"
                variants={animate ? pathVariants : {}}
                custom={charIdx}
              />
            ))}
          </svg>
        );
      })}
    </motion.div>
  );
}
