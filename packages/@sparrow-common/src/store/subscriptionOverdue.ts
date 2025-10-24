import { writable } from "svelte/store";

export const isSubscriptionOverDue = writable<boolean | null>(null);

export const isSubscriptionOverTeamId = writable<string>("");