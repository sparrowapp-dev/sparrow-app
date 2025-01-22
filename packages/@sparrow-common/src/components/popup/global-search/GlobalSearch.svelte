<script lang="ts">
import { SearchBar } from '.';
import { SearchSuggestions } from '.';
import type { SearchSuggestion } from './types';
import { useTree } from './CollectionList';
import { CollectionRepository } from "../../../../../../apps/@sparrow-desktop/src/repositories/collection.repository";
import { WorkspaceRepository} from "../../../../../../apps/@sparrow-desktop/src/repositories/workspace.repository";
 import { RxDB } from "../../../../../../apps/@sparrow-desktop/src/database/database";
import type { CollectionDocument } from "../database/database";
import { Observable } from "rxjs";
  import { onMount } from 'svelte';

// Initialize collection repository
const collectionRepository = new CollectionRepository();
const workspaceRepository = new WorkspaceRepository();

// Helper function to transform collection document
const getCollectionDocument = (elem: CollectionDocument) => {
  return {
    id: elem.id,
    name: elem.name,
    totalRequests: elem.totalRequests,
    items: elem.items,
    activeSync: elem.activeSync,
    activeSyncUrl: elem.activeSyncUrl,
    createdBy: elem.createdBy,
    createdAt: elem.createdAt,
    updatedBy: elem.updatedBy,
    updatedAt: elem.updatedAt,
    branches: elem.branches,
    primaryBranch: elem.primaryBranch,
    currentBranch: elem.currentBranch,
    localRepositoryPath: elem.localRepositoryPath,
  };
};

// const getWorkspaces =()=>{
//  try{
  
//  }
// }

let searchQuery = "";
let filteredCollection = [];
let filteredFolder = [];
let filteredRequest = [];
let collectionsData = [];


const recentRequests: RecentItem[] = [
    {
      title: "Pet Hospitality",
      workspace: "techdome",
      collection: "my workspace / new collection",
      url: "https://strapi.techdome.io/api/getPetHospitality",
      method: "GET",
    },
    {
      title: "Pet Hospitality",
      workspace: "techdome",
      collection: "domigo / new collection",
      url: "https://strapi.techdome.io/graphql",
    },
    {
      title: "New Socket.io",
      workspace: "techdome",
      collection: "domigo / new collection",
      url: "https://strapi.techdome.io/graphql",
    },
  ];

// Get collection observable
const collection: Observable<CollectionDocument[]> = collectionRepository.getCollection();

// Subscribe to collection changes
collection.subscribe((value) => {
  if (value) {
    const collectionArr = value.map((collectionDocument: CollectionDocument) => {
      const collectionObj = getCollectionDocument(collectionDocument);
      return collectionObj;
    });
    collectionsData = collectionArr;
  }
});

const [, , searchNode] = useTree();

// Function to handle search
function handleSearch() {
  console.log("searching DB");
  // Clear previous results

  filteredCollection.length = 0;
  filteredFolder.length = 0;
  filteredRequest.length = 0;
    
  // Call the searchNode function to filter the data
  searchNode(searchQuery, filteredCollection, filteredFolder, filteredRequest, collectionsData);
}

export let onClose = () => {};

const suggestions: SearchSuggestion[] = [
  { type: 'workspace', label: 'Workspaces', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/c9e3b8ce930d2dde3842ed5ca04a75616e392bff32f0d062f8ea194b68597baa?apiKey=805a55f7a8524d998fb01daccbae8123&' },
  { type: 'collection', label: 'Collections', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/afb77cd264163df7720a2d6d41977ef9e65b4da234a3c2ecaf095ab73b397e70?apiKey=805a55f7a8524d998fb01daccbae8123&' },
  { type: 'environment', label: 'Environments', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/d749757d20491cf75dce82fc076608be2c33ed3044c8934a024bda514273bedd?apiKey=805a55f7a8524d998fb01daccbae8123&' },
  { type: 'folder', label: 'Folders', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/7ed585cdfc58f8bf624f7ed9a88d6358c7550331973aa367d9df659846f62051?apiKey=805a55f7a8524d998fb01daccbae8123&' },
  { type: 'flow', label: 'Flows', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/b5bf609da28a0bcc9c1ae1656bbb0d70223c82b087fb0e8eb8c1fbeae7efb1c6?apiKey=805a55f7a8524d998fb01daccbae8123&' },
  { type: 'request', label: 'Requests', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/3d87c1f2e0499f61cde146056befef358aa5cb6930d8d8f0bde4bd8034304014?apiKey=805a55f7a8524d998fb01daccbae8123&' }
];
onMount(() => {
   handleSearch();
   
});

</script>

<div class="search-container">
  <SearchBar bind:searchQuery {handleSearch}/>
  <SearchSuggestions {suggestions} {searchQuery} {filteredCollection} {filteredFolder} {filteredRequest} />
</div>

<style>
  .search-container {
    border-radius: var(--padding-padding-12, 12px);
    border: 1px solid var(--Surface-100, #31353f);
    box-shadow: 0px 16px 32px 0px rgba(0, 0, 0, 0.4);
    display: flex;
    max-width: 630px;
    width:630px;
    max-height: 540px;
    height:540px;
    flex-direction: column;
    overflow: hidden;
    background-color: #14181F;
  }

  @media (max-width: 991px) {
    .search-container {
      max-width: 100%;
    }
  }
</style>