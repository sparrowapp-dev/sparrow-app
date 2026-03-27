import { writable } from "svelte/store";

/**
 * Stores highlighted teams (hubs)
 */
export const highlightedTeams = writable<Set<string>>(new Set());

/**
 * Stores highlighted workspaces
 */
export const highlightedWorkspaces = writable<Set<string>>(new Set());

/**
 * Highlight a team for 1 minute
 */
export function highlightTeam(teamId: string) {
  highlightedTeams.update((set) => new Set(set).add(teamId));

  setTimeout(() => {
    highlightedTeams.update((set) => {
      const newSet = new Set(set);
      newSet.delete(teamId);
      return newSet;
    });
  }, 60000);
}

/**
 * Highlight a workspace for 1 minute
 */
export function highlightWorkspace(workspaceId: string) {
  highlightedWorkspaces.update((set) => new Set(set).add(workspaceId));

  setTimeout(() => {
    highlightedWorkspaces.update((set) => {
      const newSet = new Set(set);
      newSet.delete(workspaceId);
      return newSet;
    });
  }, 60000);
}
