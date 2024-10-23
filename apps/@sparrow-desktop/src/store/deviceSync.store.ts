import { writable } from 'svelte/store';

export interface UserValidationState {
  isValid: boolean;
  checked: boolean;
}

export const userValidationStore = writable<UserValidationState>({
  isValid: true,
  checked: false
});