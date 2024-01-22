import { writable } from "svelte/store";

const clickTypeSidebar = writable(false);

const activeSidebarTab = writable("workspaces");

export { activeSidebarTab, clickTypeSidebar };
