import type { CurrentTeam } from "$lib/utils/interfaces/team.interface";
import { writable } from "svelte/store";
export const isTeamCreatedFirstTime = writable(false);
const currentTeam = writable<CurrentTeam>({
  name: "",
  id: "",
  base64String: {},
});

const openedTeam = writable<CurrentTeam>({
  name: "",
  id: "",
  base64String: {},
});

/**
 * Sets the current team with the provided id and name (force over writes)..
 */

const setCurrentTeam = (
  teamId: string,
  teamName: string,
  teamBase64String: object,
): void => {
  currentTeam.set({
    id: teamId,
    name: teamName,
    base64String: teamBase64String,
  });
};

/**
 * Sets the opened team with the provided id and name (force over writes)..
 */

const setOpenedTeam = (
  teamId: string,
  teamName: string,
  teamBase64String: object,
): void => {
  openedTeam.set({
    id: teamId,
    name: teamName,
    base64String: teamBase64String,
  });
};

export { setCurrentTeam, currentTeam, openedTeam, setOpenedTeam };
