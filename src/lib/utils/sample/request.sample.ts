import { AuthType } from "../enums/authorization.enum";
import { ItemType } from "../enums/item-type.enum";
import {
  RequestDataset,
  RequestDefault,
  RequestType,
} from "../enums/request.enum";

const createSampleRequest = (id: string) => {
  return {
    id,
    name: RequestDefault.NAME,
    type: ItemType.REQUEST,
    request: {
      method: RequestDefault.METHOD,
      body: {
        raw: "",
        urlencoded: [
          {
            key: "",
            value: "",
            checked: false,
          },
        ],
        formdata: {
          text: [
            {
              key: "",
              value: "",
              checked: false,
            },
          ],
          file: [
            {
              key: "",
              value: "",
              checked: false,
              base: "",
            },
          ],
        },
      },
      url: "",
      headers: [],
      queryParams: [
        {
          name: "",
          description: "",
          checked: false,
        },
      ],
      state: {
        raw: RequestType.Text,
        dataset: RequestDataset.NONE,
        auth: AuthType.NO_AUTH,
      },
    },
    save: false,
    requestInProgress: false,
    path: null,
  };
};
export { createSampleRequest };
