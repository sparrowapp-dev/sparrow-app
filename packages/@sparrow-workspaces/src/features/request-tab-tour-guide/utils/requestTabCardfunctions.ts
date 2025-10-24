import { get } from "svelte/store";
import {
  requestTabTestDemo,
  requestTabTestNoCodeStep,
  requestTabTestScriptDemo,
  requestTabTestScriptStep,
  requestTabAssertionsDemo,
  requestTabAssertionsStep,
} from "../../../stores";

const MAX_STEP = 5;
const MAX_PRE_SCRIPT_STEP = 4;

const resetNoCodeTour = () => {
  requestTabTestNoCodeStep.set(0);
  requestTabTestDemo.set(false);
};

const resetScriptTour = () => {
  requestTabTestScriptStep.set(0);
  requestTabTestScriptDemo.set(false);
};

const resetAssertionsTour = () => {
  requestTabAssertionsStep.set(0);
  requestTabAssertionsDemo.set(false);
};

export const handleNextStep = () => {
  // Check if No Code tour is active
  if (get(requestTabTestDemo)) {
    const currentStep = get(requestTabTestNoCodeStep);
    if (currentStep < MAX_PRE_SCRIPT_STEP) {
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

  // Check if Assertions tour is active
  if (get(requestTabAssertionsDemo)) {
    const currentStep = get(requestTabAssertionsStep);
    if (currentStep < MAX_STEP) {
      requestTabAssertionsStep.set(currentStep + 1);
    } else {
      resetAssertionsTour();
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

  if (get(requestTabAssertionsDemo)) {
    resetAssertionsTour();
  }
};
