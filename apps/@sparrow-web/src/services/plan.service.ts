import constants from "src/constants/constants";
import { makeRequest, getAuthHeaders } from "src/containers/api/api.common";
const apiUrl: string = constants.API_URL;
export class PlanService {
  constructor() {}

  public getPlanById = async (planId: string) => {
    const plan = await makeRequest("GET", `${apiUrl}/api/plan/${planId}`, {
      headers: getAuthHeaders(),
    });
    return plan;
  };

  public getPlansByIds = async (planIds: string[]) => {
    const plans = await makeRequest("POST", `${apiUrl}/api/plan/details`, {
      headers: getAuthHeaders(),
      body: { planIds: planIds },
    });
    return plans;
  };
}
