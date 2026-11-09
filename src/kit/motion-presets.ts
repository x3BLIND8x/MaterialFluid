/** Owner-selected remaining motion defaults. Stagger/layout is intentionally excluded. */
export const savedMotionPresets = {
  "menu": {
    "engine": "physics",
    "ease": "easeOut",
    "values": {
      "stiffness": 460,
      "damping": 20,
      "mass": 1,
      "velocity": 0,
      "restDelta": 0.2,
      "restSpeed": 4,
      "duration": 0.4,
      "bounce": 0.25,
      "delay": 0,
      "x": 0,
      "y": -10,
      "scale": 0.95,
      "rotate": 0,
      "opacity": 0,
      "blur": 5
    }
  },
  "toast": {
    "engine": "physics",
    "ease": "easeOut",
    "values": {
      "stiffness": 460,
      "damping": 20,
      "mass": 1,
      "velocity": 0,
      "restDelta": 0.2,
      "restSpeed": 4,
      "duration": 0.4,
      "bounce": 0.25,
      "delay": 0,
      "x": 0,
      "y": -18,
      "scale": 0.94,
      "rotate": 0,
      "opacity": 0,
      "blur": 5
    }
  },
  "drag": {
    "engine": "physics",
    "ease": "easeOut",
    "values": {
      "stiffness": 460,
      "damping": 20,
      "mass": 1,
      "velocity": 0,
      "restDelta": 0.2,
      "restSpeed": 4,
      "duration": 0.4,
      "bounce": 0.25,
      "delay": 0,
      "x": 0,
      "y": 18,
      "scale": 0.94,
      "rotate": 0,
      "opacity": 0,
      "blur": 5,
      "elastic": 0.2,
      "returnStiffness": 460,
      "returnDamping": 26
    }
  },
  "reveal": {
    "engine": "physics",
    "ease": "easeOut",
    "values": {
      "stiffness": 460,
      "damping": 20,
      "mass": 1,
      "velocity": 0,
      "restDelta": 0.2,
      "restSpeed": 4,
      "duration": 0.4,
      "bounce": 0.25,
      "delay": 0,
      "x": 0,
      "y": 18,
      "scale": 0.94,
      "rotate": 0,
      "opacity": 0,
      "blur": 5,
      "stagger": 0.07
    }
  }
} as const;
