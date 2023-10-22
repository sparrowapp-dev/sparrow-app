<script lang="ts">
  import doubleangleLeft from "$lib/assets/doubleangleLeft.svg";
  import searchIcon from "$lib/assets/search.svg";
  import filterIcon from "$lib/assets/filter.svg";
  import plusIcon from "$lib/assets/plus.svg";
  import Folder from "./Folder.svelte";
  import { fetchCollection, insertCollection } from "$lib/services/collection";
  import {
    collectionList,
    setCollectionList,
    currentWorkspaceId,
  } from "$lib/store/collection";
  import {useTree} from './collectionList';
  import type { CreateCollectionPostBody } from "$lib/utils/dto";
  const [,insertHead] = useTree();
  let collection: any;
  let workspaceId : string ="";

  let getCollectionData = async (id: string) => {
    const res = await fetchCollection(id);
    if (res.isSuccessful) {
      setCollectionList(res.data.data);
    }
  };

  collectionList.subscribe((value) => {
    collection = value;
  });

  currentWorkspaceId.subscribe((value) => {
    workspaceId = value;
    getCollectionData(value);
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
const getNextCollection: (list: any[], name: string) => any = (
  list,
  name,
) => {
  const isNameAvailable: (proposedName: string) => boolean = (proposedName) => {
    return list.some((element) => {
      return element.name === proposedName;
    });
  };

  if (!isNameAvailable(name)) {
    return name;
  }

  for (let i = 2; i < list.length + 10; i++) {
    const proposedName: string = `${name}${i}`;
    if (!isNameAvailable(proposedName)) {
      return proposedName;
    }
  }

  return null;
};

  const handleCreateCollection = async ()=> {
    const newCollection : CreateCollectionPostBody = {
      name: getNextCollection(collection, "New collection"),
      workspaceId
    }
    const res = await insertCollection(newCollection);
    if(res.isSuccessful){
        insertHead(newCollection.name, JSON.stringify(new Date()));
    }
  }

</script>

<div
  style="width:280px; height: calc(100vh - 50px); overflow:auto; border-right: 1px solid #313233;padding:0px, 24px, 8px, 8px "
  class="d-flex flex-column bg-backgroundColor"
>
  <div
    class="d-flex justify-content-between align-items-center align-self-stretch ps-3 pe-3 pt-3"
  >
    <p class="mb-0 text-whiteColor" style="font-size: 18px;">Domigo</p>
    <button class="bg-backgroundColor border-0">
      <img src={doubleangleLeft} alt="" />
    </button>
  </div>
  <div
    class="d-flex align-items-center justify-content-between ps-3 pe-3 pt-3 gap-2"
  >
    <div
      style="height:32px; width:180px "
      class="inputField bg-blackColor ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
    >
      <img src={searchIcon} alt="" />
      <input
        type="search"
        style="  font-size: 12px;font-weight:500;"
        class="inputField border-0 w-100 h-100 bg-blackColor"
        placeholder="Search APIs in Domigo"
      />
    </div>

    <div class="d-flex align-items-center justify-content-center">
      <button
        class="btn btn-blackColor d-flex align-items-center justify-content-center"
        style="width: 32px; height:32px;"
      >
        <img src={filterIcon} alt="" />
      </button>
    </div>
    <div class="d-flex align-items-center justify-content-center">
      <button
        class="btn btn-blackColor p-0 d-flex align-items-center justify-content-center"
        style="width: 32px; height:32px;" on:click={handleCreateCollection}
      >
        <img src={plusIcon} alt="" />
      </button>
    </div>
  </div>

  <div class="d-flex flex-column pt-3">
    <div class="d-flex flex-column justify-content-center">
      {#each collection as col}
        <Folder collection={col} title={col.name} />
      {/each}
    </div>
  </div>
</div>

<style>
  .inputField {
    outline: none;
  }
</style>
