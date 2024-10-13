import { verifyEmail } from "@app/services/auth.service";
import { errorMessageText } from "$lib/store/auth.store";
import type { verifyPostbody } from "$lib/utils/dto";
import { notifications } from "@library/ui/toast/Toast";
export const isSuccessfulResponse = writable(false);

import { navigate } from "svelte-navigator";
import { writable } from "svelte/store";

export const handleVerifyEmail = async (
  verifyCodeCredential: verifyPostbody,
) => {
  const response = await verifyEmail(verifyCodeCredential);
  if (response.isSuccessful) {
    notifications.success("Email verified successfully.");
    navigate("/reset/password");
  } else {
    isSuccessfulResponse.set(true);
    if (response.message === "verificationCode should not be empty") {
      errorMessageText.set("Please enter the 6-digit verification code.");
    }

    if (response.message === "unauthorized") {
      errorMessageText.set(
        "You have entered wrong code, please check your email.",
      );
    }
  }
};
