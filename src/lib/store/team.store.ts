import type { CurrentTeam } from "$lib/utils/interfaces/team.interface";
import { writable } from "svelte/store";
export const isTeamCreatedFirstTime = writable(false);

const openedTeam = writable<CurrentTeam>({
  name: "",
  id: "",
  base64String: {},
});

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

export { openedTeam, setOpenedTeam };
