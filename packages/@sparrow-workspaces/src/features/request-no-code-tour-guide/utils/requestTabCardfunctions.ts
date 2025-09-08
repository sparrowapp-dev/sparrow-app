import { get } from "svelte/store";
import { requestTabTestDemo, requestTabTestNoCodeStep } from "../../../stores";

const MAX_STEP = 5;

const resetTour = () => {
  requestTabTestNoCodeStep.set(0);
  requestTabTestDemo.set(false);
};

export const handleNextStep = () => {
  const currentStep = get(requestTabTestNoCodeStep);
  if (currentStep < MAX_STEP) {
    requestTabTestNoCodeStep.set(currentStep + 1);
  } else {
    resetTour();
  }
};

export const handleCloseTour = () => {
  resetTour();
};
