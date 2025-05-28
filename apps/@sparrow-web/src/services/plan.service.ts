import { makeRequest, getAuthHeaders } from "src/containers/api/api.common";

export class PlanService {
  constructor() {}

  public getPlanById = async (planId: string, baseUrl: string) => {
    const plan = await await makeRequest(
      "GET",
      `${baseUrl}/api/plan/${planId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return plan;
  };
}
