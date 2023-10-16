import constants from "$lib/utils/constants";
import { jwtDecode } from "$lib/utils/jwt";
import { writable } from "svelte/store";

export const authStore = writable({
  user: null,
});

const setUser = (user) => {
  authStore.update((currentValue) => {
    return {
      ...currentValue,
      user,
    };
  });
  if (user?.token) {
    localStorage.setItem(constants.AUTH_TOKEN, user.token);
    localStorage.setItem("WORKSPACE", JSON.stringify(jwtDecode(user.token)));
  }
};

const checkAuthStatus = () => {
  const token = localStorage.getItem(constants.AUTH_TOKEN);
  if (token) {
    const userData = JSON.parse(atob(token.split(".")[1]));
    setUser(userData);
  }
};

export const authActions = {
  setUser,
  checkAuthStatus,
};
