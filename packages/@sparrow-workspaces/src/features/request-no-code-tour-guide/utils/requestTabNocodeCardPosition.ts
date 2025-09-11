export const requestTabNocodeCardPosition = (currentStep: number) => {
  const step = currentStep;
  let finalResult;
  switch (step) {
    case 1:
      finalResult = {
        top: 44,
        left: 70,
        placement: "left" as const,
      };
      break;
    case 2:
      finalResult = {
        top: 0,
        right: 20,
        placement: "right" as const,
      };
      break;
    case 3:
      finalResult = {
        top: -2,
        left: 15,
        placement: "left" as const,
      };
      break;
    case 4:
      finalResult = {
        top: 0,
        right: 40,
        placement: "right" as const,
      };
      break;
    case 5:
      finalResult = {
        top: 10,
        left: 220,
        placement: "left" as const,
      };
      break;
    default:
      finalResult = {
        top: 0,
        left: 0,
        placement: "left" as const,
      };
  }
  return finalResult;
};
