import { get } from "svelte/store";
import { requestTabTestDemo, requestTabTestbStep } from "../../../stores";

const MAX_STEP = 5;

const resetTour = () => {
  requestTabTestbStep.set(0);
  requestTabTestDemo.set(false);
};

export const handleNextStep = () => {
  const currentStep = get(requestTabTestbStep);
  if (currentStep < MAX_STEP) {
    requestTabTestbStep.set(currentStep + 1);
  } else {
    resetTour();
  }
};

export const handleCloseTour = () => {
  resetTour();
};
