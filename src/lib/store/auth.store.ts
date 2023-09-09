import constants from "$lib/utils/constants";
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
  localStorage.setItem(constants.AUTH_TOKEN, user.token);
};

const checkAuthSatus = () => {
  let status = false;
  authStore.subscribe(({ user }) => {
    status = user || localStorage.getItem(constants.AUTH_TOKEN);
  });
  return status ? true : false;
};

export const authActions = {
  setUser,
  checkAuthSatus,
};
