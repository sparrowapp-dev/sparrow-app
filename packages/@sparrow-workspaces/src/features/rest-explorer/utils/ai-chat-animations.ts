export const chatbotOpenAnimation = {
  x: 0,
  opacity: 1,
  scale: 1,
};

export const chatbotClosedAnimation = {
  x: "60%",
  opacity: 0.01,
  scale: 0.98,
};

export const chatbotOpenTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1], // "ease-in-out"
};

export const chatbotCloseTransition = {
  duration: 0.24,
  ease: [0.42, 0, 1, 1], // ease-in (slightly springy)
};
