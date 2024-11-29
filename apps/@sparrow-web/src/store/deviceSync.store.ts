import { writable } from 'svelte/store';

export interface UserValidationState {
  isValid: boolean;
}

export const userValidationStore = writable<UserValidationState>({
  isValid: true,
});