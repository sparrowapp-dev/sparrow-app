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
  ease: [0.42, 0, 0.58, 1],
  style: { zIndex: 10 },
};

export const scaleMotionProps = {
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
    ease: [0.42, 0, 0.58, 1],
    style: { zIndex: 10 },
};
