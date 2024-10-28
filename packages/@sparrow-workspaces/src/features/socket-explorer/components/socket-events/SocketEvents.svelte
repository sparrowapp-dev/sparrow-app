<script lang="ts">
  import type {
    KeyValuePair,
    KeyValuePairWithBase,
  } from "@sparrow/common/interfaces/request.interface";
  import { trashIcon } from "@sparrow/library/assets";
  import { Switch } from "@sparrow/library/forms";
  import SocketEventList from "../event-list/SocketEventList.svelte";

  // exports
  export let keyValue: KeyValuePair[] | KeyValuePairWithBase[];
  export let callback: (pairs: KeyValuePair[]) => void;
  export let readable: { key: string; value: string } = {
    key: "abc",
    value: "def",
  };

  export let isTopHeaderRequired = true;
  export let isInputBoxEditable = true;

  let pairs: KeyValuePair[] = keyValue;
  let controller: boolean = false;

  $: {
    if (keyValue) {
      identifySelectAllState();
    }
  }

  // /**
  //  * @description - calculates the select all checkbox state - weather checked or not
  //  */
  // const identifySelectAllState = () => {
  //   pairs = [];
  //   pairs = keyValue;
  //   controller = false;
  //   if (pairs.length > 1) {
  //     let isUncheckedExist: boolean = false;
  //     for (let i = 0; i < pairs.length - 1; i++) {
  //       if (pairs[i].checked === false) {
  //         isUncheckedExist = true;
  //         break;
  //       }
  //     }
  //     if (isUncheckedExist) {
  //       controller = false;
  //     } else {
  //       controller = true;
  //     }
  //   }
  // };

  // const updateParam = (index: number): void => {
  //   pairs = pairs;
  //   if (
  //     pairs.length - 1 === index &&
  //     isInputBoxEditable &&
  //     (pairs[index].key !== "" || pairs[index].value !== "")
  //   ) {
  //     pairs[pairs.length - 1].checked = true;
  //     pairs.push({ key: "", value: "", checked: false });
  //     pairs = pairs;
  //   }
  //   callback(pairs);
  // };

  // const deleteParam = (index: number): void => {
  //   if (pairs.length > 1) {
  //     let filteredKeyValue = pairs.filter((elem, i) => {
  //       if (i !== index) {
  //         return true;
  //       }
  //       return false;
  //     });
  //     pairs = filteredKeyValue;
  //   }
  //   callback(pairs);
  //   setTimeout(() => {
  //     pairs[pairs.length - 1].key = "";
  //     pairs[pairs.length - 1].value = "";
  //   }, 0);
  // };

  const handleCheckAll = (): void => {
    let flag: boolean;
    if (controller === true) {
      flag = false;
    } else {
      flag = true;
    }
    let filteredKeyValue = pairs.map((elem, i) => {
      if (i !== pairs.length - 1) {
        elem.checked = flag;
      } else if (!isInputBoxEditable) {
        elem.checked = flag;
      }
      return elem;
    });
    pairs = filteredKeyValue;
    callback(pairs);
  };

  let bulkToggle = true;
</script>

<div class="outer-section">
  <div
    class="mb-0 me-0 w-100 bg-secondary-700 py-0 border-radius-2 section-layout"
  >
    <div
      class="d-flex gap-3 py-1 mb-1 align-items-center w-100 {!isTopHeaderRequired
        ? 'd-none'
        : ''}"
      style="height:26px; "
    >
      <div
        class="ps-4  d-flex  bg-secondary-700 align-items-center w-100"
        style="font-size: 12px; font-weight: 500; background-color:#1B1B1B;">
        <p
          class="mb-0 w-50 text-secondary-200 text-fs-12 p-1"
          style="font-weight: 1000;"
        >
          Key
        </p>

        <p
          class="mb-0 w-50 text-secondary-200 text-fs-12 ps-0 ms-3"
          style="font-weight: 1000;"
        >
          Listen
        </p>

        <div class="h-75 pe-2">
          <button class=" border-0" style="width:70px;" />
        </div>
      </div>
    </div>

    <SocketEventList />
  </div>
</div>

<style>
  
  .section-layout {
    border-top: 1px solid var(--border-secondary-500);
    border-bottom: 1px solid var(--border-secondary-500);
  }


</style>
