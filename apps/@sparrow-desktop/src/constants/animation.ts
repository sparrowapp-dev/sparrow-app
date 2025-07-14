export const pagesMotion = {
  initial: { opacity: 0.2 },
  animate: {
    opacity: 1,
    transition: {
      ease: "easeInOut",
      duration: 0.28, // 280ms
    },
  },
  exit: {
    opacity: 0,
    transition: {
      ease: "easeInOut",
      duration: 0.28, // 280ms
    },
  },
  style: { zIndex: 10 },
};

export const scaleMotionProps = {
    initial: { opacity: 0.2 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0 },
    style: { zIndex: 10 },
};
