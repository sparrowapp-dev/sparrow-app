import { ItemType } from "../enums/item-type.enum";
import {
  RequestDataset,
  RequestDefault,
  RequestType,
} from "../enums/request.enum";
import type { NewTab } from "../interfaces/request.interface";

const createSampleRequest = (id: string): NewTab => {
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
      additions: {
        raw: RequestType.Text,
        dataset: RequestDataset.NONE,
      },
    },
    save: false,
    requestInProgress: false,
    path: null,
  };
};
export { createSampleRequest };
