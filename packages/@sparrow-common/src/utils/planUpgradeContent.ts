import { TeamRole } from "../enums";

type RoleInfo = {
  title: string;
  description: string;
  buttonName: string;
};

export const planInfoByRole = (role: string): RoleInfo => {
  switch (role) {
    case TeamRole.TEAM_ADMIN:
      return {
        title: "It’s time to Upgrade Plan",
        description:
          "You’ve reached the maximum limit for your current plan. To continue using this feature, you’ll need to upgrade. We’ll now take you to the admin panel where you can upgrade the plan and complete the payment.",
        buttonName: "Go to Admin Panel",
      };
    case TeamRole.TEAM_OWNER:
      return {
        title: "It’s time to Upgrade Plan",
        description:
          "You’ve reached the maximum limit for your current plan. To continue using this feature, you’ll need to upgrade. We’ll now take you to the admin panel where you can upgrade the plan and complete the payment.",
        buttonName: "Go to Admin Panel",
      };
    case "general":
      return {
        title: "It’s time to Upgrade Plan",
        description:
          "You’ve reached the maximum limit for your current plan. To continue using this feature, you’ll need to upgrade. We’ll now take you to the admin panel where you can upgrade the plan and complete the payment.",
        buttonName: "Ok",
      };
    default:
      return {
        title: "Upgrade Needed – Contact Owner to Upgrade",
        description:
          "You’ve reached the maximum usage for your current plan. To continue using this feature, you’ll need to upgrade. Only the owner can upgrade the plan. Please contact the owner to get the plan upgraded.",
        buttonName: "Contact Owner",
      };
  }
};

export const planContentDisable = () => {
  return {
    description:
      "This feature is currently disabled for your current plan. To continue using this feature, you’ll need to upgrade. Only the owner can upgrade the plan. Please contact the owner to get the plan upgraded.",
  };
};
