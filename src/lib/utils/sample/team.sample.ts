import { UntrackedItems } from "../enums";
import { TeamDefault } from "../enums/request.enum";
import { v4 as uuidv4 } from "uuid";
/* eslint-disable @typescript-eslint/no-explicit-any */

const generateSamepleTeam = (
  name: string,
  description: string,
  file: any,
  userId: string,
) => {
  return {
    teamId: UntrackedItems.UNTRACKED + uuidv4(),
    name: name ? name : TeamDefault.NAME,
    description: description,
    users: [],
    admins: [],
    image: file,
    workspaces: [],
    owner: userId.toString(),
    createdAt: new Date().toISOString(),
    createdBy: userId.toString(),
    updatedAt: "",
    updatedBy: "",
  };
};

export { generateSamepleTeam };
