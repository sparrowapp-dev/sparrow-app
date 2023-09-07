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
};

export const authActions = {
  setUser,
};
