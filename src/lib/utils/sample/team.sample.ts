import { TeamDefault } from "../enums/request.enum";

const generateSamepleTeam = (name: string, description: string) => {
  return {
    name: name ? name : TeamDefault.NAME,
    description: description,
  };
};

export { generateSamepleTeam };
