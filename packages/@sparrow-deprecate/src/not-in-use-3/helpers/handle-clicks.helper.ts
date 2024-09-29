// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { isFolderCreatedFirstTime } from "@app/store/auth.store/collection";
// import { CollectionsViewModel } from "../../../pages/Collections/Collections.ViewModel.old";
// import { ItemType } from "../enums/item-type.enum";
// import type { Path } from "../interfaces/request.interface";
// import { generateSampleCollection } from "../sample/collection.sample";
// import { generateSampleFolder } from "../sample/folder.sample";
// import { generateSampleRequest } from "../sample/request.sample";
// import { moveNavigation } from "./navigation";
// const _collectionMethods = new CollectionsViewModel();
// export const handleCollectionClick = (
//   collection: any,
//   currentWorkspaceId: string,
//   collectionId: string,
// ) => {
//   let totalFolder: number = 0;
//   let totalRequest: number = 0;
//   collection.items.map((item) => {
//     if (item.type === ItemType.REQUEST) {
//       totalRequest++;
//     } else {
//       totalFolder++;
//       totalRequest += item.items.length;
//     }
//   });

//   const path = {
//     workspaceId: currentWorkspaceId,
//     collectionId,
//   };

//   const sampleCollection = generateSampleCollection(
//     collectionId,
//     new Date().toString(),
//   );

//   sampleCollection.id = collectionId;
//   sampleCollection.path = path;
//   sampleCollection.name = collection.name;
//   sampleCollection.property.collection.requestCount = totalRequest;
//   sampleCollection.property.collection.folderCount = totalFolder;
//   sampleCollection.save = true;
//   _collectionMethods.handleCreateTab(sampleCollection);
//   moveNavigation("right");
// };

// export const handleRequestClick = (req: any, path: any, activeSync) => {
//   const request = generateSampleRequest(req.id, new Date().toString());
//   request.path = path;
//   request.name = req.name;
//   if (req.description) request.description = req.description;
//   if (req.request.url) request.property.request.url = req.request.url;
//   if (req.request.body) request.property.request.body = req.request.body;
//   if (req.request.method) request.property.request.method = req.request.method;
//   if (req.request.queryParams)
//     request.property.request.queryParams = req.request.queryParams;
//   if (req.request.auth) request.property.request.auth = req.request.auth;
//   if (req.request.headers)
//     request.property.request.headers = req.request.headers;
//   request.activeSync = activeSync;
//   request.isDeleted = req.isDeleted;
//   request.source = req.source;
//   request.save = true;
//   _collectionMethods.handleCreateTab(request);
//   moveNavigation("right");
// };

// export const handleFolderClick = (
//   folder: any,
//   currentWorkspaceId: string,
//   collectionId: string,
//   activeSync,
// ) => {
//   isFolderCreatedFirstTime.set(false);
//   const path: Path = {
//     workspaceId: currentWorkspaceId,
//     collectionId: collectionId,
//     folderId: folder.id,
//     folderName: folder.name,
//   };

//   const sampleFolder = generateSampleFolder(folder.id, new Date().toString());

//   sampleFolder.id = folder.id;
//   sampleFolder.path = path;
//   sampleFolder.name = folder.name;
//   sampleFolder.save = true;
//   sampleFolder.activeSync = activeSync;
//   sampleFolder.source = !folder?.source ? "SPEC" : folder?.source;
//   sampleFolder.isDeleted = folder?.isDeleted;

//   _collectionMethods.handleCreateTab(sampleFolder);
//   moveNavigation("right");
// };
