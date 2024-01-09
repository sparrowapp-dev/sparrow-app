import type { CurrentTeam } from "$lib/utils/interfaces/team.interface";
import { writable } from "svelte/store";

const currentTeam = writable<CurrentTeam>({
  name: "",
  id: "",
});

const openedTeam = writable<CurrentTeam>({
  name: "",
  id: "",
});

/**
 * Sets the current team with the provided id and name (force over writes)..
 */

const setCurrentTeam = (teamId: string, teamName: string): void => {
  currentTeam.set({ id: teamId, name: teamName });
};

/**
 * Sets the opened team with the provided id and name (force over writes)..
 */

const setOpenedTeam = (teamId: string, teamName: string): void => {
  openedTeam.set({ id: teamId, name: teamName });
};

export { setCurrentTeam, currentTeam, openedTeam, setOpenedTeam };
