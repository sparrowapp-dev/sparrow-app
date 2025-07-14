import { makeRequest, getAuthHeaders } from "@app/containers/api/api.common";

export class PlanService {
  constructor() {}

  public getPlanById = async (planId: string, baseUrl: string) => {
    const plan = await makeRequest("GET", `${baseUrl}/api/plan/${planId}`, {
      headers: getAuthHeaders(),
    });
    return plan;
  };

  public getPlansByIds = async (planIds: string[], baseUrl: string) => {
    const plans = await makeRequest("POST", `${baseUrl}/api/plan/details`, {
      headers: getAuthHeaders(),
      body: { planIds: planIds },
    });
    return plans;
  };
}
