import { makeRequest, getAuthHeaders } from "src/containers/api/api.common";

export class PlanService {
  constructor() {}

  public getPlanById = async (planId: string, baseUrl: string) => {
    const plan = await makeRequest("GET", `${baseUrl}/api/plan/${planId}`, {
      headers: getAuthHeaders(),
    });
    return plan;
  };

  public getPlansByIds = async (planIds: string[], baseUrl: string) => {
    const plans = await Promise.all(
      planIds.map(async (planId) => {
        return await makeRequest("GET", `${baseUrl}/api/plan/${planId}`, {
          headers: getAuthHeaders(),
        });
      }),
    );

    return plans.filter((plan) => plan !== null);
  };
}
