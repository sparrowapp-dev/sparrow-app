import { useNavigate } from "svelte-navigator";
const navigate = useNavigate();

export const navigateTo = (to: string): void => {
  navigate(to);
};
