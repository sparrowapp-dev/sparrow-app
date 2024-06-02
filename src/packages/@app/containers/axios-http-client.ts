import { isLoggout, isResponseError, setUser } from "$lib/store";
import constants from "$lib/utils/constants";
import { ErrorMessages } from "$lib/utils/enums";
import { clearAuthJwt, setAuthJwt } from "$lib/utils/jwt";
import { RxDB } from "@app/database/database";
import type {
  AccessToken,
  BearerToken,
  RefreshToken,
  RequestData,
  ResponseData,
} from "@app/types";
import { notifications } from "@library/ui/toast/Toast";
import axios from "axios";

export class AxiosHttpClient {
  private apiUrl: string = constants.API_URL;
  constructor(
    private bearerToken: BearerToken,
    private accessToken: AccessToken,
    private refreshToken: RefreshToken,
  ) {}

  private createResponse = (
    type: "success" | "error",
    response: unknown,
  ): ResponseData => {
    return {
      status: type,
      isSuccessful: type === "success" ? true : false,
      data: response,
    };
  };

  private logout = async (): Promise<void> => {
    const response = await this.makeRequest({
      method: "GET",
      url: `${this.apiUrl}/api/user/logout`,
      headers: {
        ...this.bearerToken.getBearerToken(this.refreshToken.getValue()),
      },
    });
    if (response.isSuccessful) {
      setUser(null);
      await RxDB.getInstance().destroyDb();
      await RxDB.getInstance().getDb();
      isLoggout.set(true);
      isResponseError.set(false);
      clearAuthJwt();
    } else {
      notifications.error(response.message);
    }
  };

  private regenerateAuthToken = async (
    requestData: RequestData,
  ): Promise<ResponseData> => {
    const response = await this.makeRequest({
      method: "POST",
      url: `${this.apiUrl}/api/auth/refresh-token`,
      headers: {
        ...this.bearerToken.getBearerToken(this.refreshToken.getValue()),
      },
    });
    if (response.isSuccessful) {
      setAuthJwt(constants.AUTH_TOKEN, response.data.data.newAccessToken.token);
      setAuthJwt(constants.REF_TOKEN, response.data.data.newRefreshToken.token);
      if (requestData && requestData.headers) {
        requestData.headers = {
          ...this.bearerToken.getBearerToken(this.accessToken.getValue()),
        };
      }
      return await this.makeRequest(requestData);
    } else {
      throw "error refresh token";
    }
  };

  public makeRequest = async (
    requestData: RequestData,
  ): Promise<ResponseData> => {
    try {
      const response = await axios({
        method: requestData?.method,
        url: requestData?.url,
        data: requestData?.body,
        headers: requestData?.headers,
      });
      return this.createResponse("success", response.data);
    } catch (e) {
      if (
        e.response?.data?.statusCode === 401 &&
        e.response?.data?.message === ErrorMessages.ExpiredToken
      ) {
        return await this.regenerateAuthToken(requestData);
      } else if (
        e.response?.data?.statusCode === 401 &&
        e.response.data.message === ErrorMessages.Unauthorized
      ) {
        await this.logout();
        return this.createResponse("error", "Unauthorized");
      }
      if (e.code === "ERR_NETWORK") {
        return this.createResponse("error", e.message);
      } else if (e.response?.data) {
        return this.createResponse("error", e.response?.data?.message);
      }
      return this.createResponse("error", e);
    }
  };
}
