import { writable } from "svelte/store";

const collectionList = writable([]);
const currentWorkspaceId = writable("652e7b59316b7a99d203db3a");

export { collectionList, currentWorkspaceId };
