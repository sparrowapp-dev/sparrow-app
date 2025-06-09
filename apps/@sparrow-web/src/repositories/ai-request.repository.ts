import { RxDB, type AiRequestConversationsDocument, type CollectionDocument } from "../database/database";
import { ItemType } from "@sparrow/common/enums/item-type.enum";
import { createDeepCopy } from "@sparrow/common/utils/conversion.helper";
import type { Observable } from "rxjs";
import type { RxDocument } from "rxdb";
import type { AiModelProviderEnum } from "@sparrow/common/types/workspace/ai-request-base";



export class AiRequestRepository {
  constructor() { }


  /**
  * @description
  * Adds a new conversaiton to local db.
  */
  public addConversation = async (provider: AiModelProviderEnum, providerkey: string, conversations: any) => {
    const doc = {
      id: `${provider}-${providerkey}`,
      provider,
      apiKey: providerkey,
      conversations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    conversations.forEach((apiKeyData, index) => {
      doc.conversations.push(apiKeyData);
    });

    await RxDB.getInstance().rxdb.aiRequestConversations.upsert(doc);
    return doc;
  };


  // Get all conversations for a specific API key and provider, sorted by latest first
  public getConversationsByApiKeyAndProvider = (
    provider: string,
    apiKey: string,
  ): Observable<AiRequestConversationsDocument[]> => {
    return RxDB.getInstance().rxdb.aiRequestConversations
      .findOne({
        selector: {
          apiKey: apiKey,
          provider: provider
        },
        sort: [{ updatedAt: 'desc' }] // Latest first
      }).$;
  };

}