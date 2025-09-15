import { get } from "svelte/store";
import {
  requestTabTestDemo,
  requestTabTestNoCodeStep,
  requestTabTestScriptDemo,
  requestTabTestScriptStep,
} from "../../../stores";

const MAX_STEP = 5;

const resetNoCodeTour = () => {
  requestTabTestNoCodeStep.set(0);
  requestTabTestDemo.set(false);
};

const resetScriptTour = () => {
  requestTabTestScriptStep.set(0);
  requestTabTestScriptDemo.set(false);
};

export const handleNextStep = () => {
  // Check if No Code tour is active
  if (get(requestTabTestDemo)) {
    const currentStep = get(requestTabTestNoCodeStep);
    if (currentStep < MAX_STEP) {
      requestTabTestNoCodeStep.set(currentStep + 1);
    } else {
      resetNoCodeTour();
    }
    return;
  }

  // Check if Script tour is active
  if (get(requestTabTestScriptDemo)) {
    const currentStep = get(requestTabTestScriptStep);
    if (currentStep < MAX_STEP) {
      requestTabTestScriptStep.set(currentStep + 1);
    } else {
      resetScriptTour();
    }
    return;
  }
};

export const handleCloseTour = () => {
  if (get(requestTabTestDemo)) {
    resetNoCodeTour();
  }
  if (get(requestTabTestScriptDemo)) {
    resetScriptTour();
  }
};
