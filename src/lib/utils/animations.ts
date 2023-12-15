export const scaleComponent = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0 },
  transition: {
    type: "spring",
    duration: 0.1,
    stiffness: 300,
    damping: 35,
  },
};

export const smallMotionProps = {
  initial: { x: "360px" },
  animate: { x: 0 },
  exit: { x: "360px" },
  style: { width: "360px" },
  transition: {
    type: "spring",
    duration: 0.5,
    stiffness: 200,
    damping: 25,
  },
};

export const mediumMotionProps = {
  initial: { x: "25rem" },
  animate: { x: 0 },
  exit: { x: "25rem" },
  style: { width: "25rem" },
  transition: {
    type: "spring",
    duration: 0.5,
    stiffness: 200,
    damping: 25,
  },
};

export const largeMotionProps = {
  initial: { x: "30rem" },
  animate: { x: 0 },
  exit: { x: "30rem" },
  style: { width: "30rem" },
  transition: {
    type: "spring",
    duration: 0.5,
    stiffness: 200,
    damping: 25,
  },
};

export const scaleMotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  style: { zIndex: 10 },
};

export const scaleMotionProps2 = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleMotionProps3 = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0 },
  transition: {
    type: "spring",
    duration: 0.1,
    stiffness: 300,
    damping: 35,
  },
};
