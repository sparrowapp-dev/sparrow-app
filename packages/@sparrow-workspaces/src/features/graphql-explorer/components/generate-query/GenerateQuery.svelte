<script lang="ts">
  import { WithSelect } from "../../../../hoc";
  import { AngleLeftIcon } from "@sparrow/library/icons";
  import { Input } from "@sparrow/library/forms";
  import { trashIcon } from "@sparrow/library/assets";

  export let schema;
  export let updateSchema;

  interface TreeNode {
    name: string;
    value: string;
    items: TreeNode[];
    id: string;
    isExpanded: boolean;
    isSelected: boolean;
    parentNodeId: string;
    parentNodeName: string;
    itemType: string;
  }

  interface ResponseQueryNode {
    name: string;
    value: string;
    items?: ResponseQueryNode[];
    id: string;
    isExpanded: boolean;
    isSelected: boolean;
    parentNodeId: string;
    parentNodeName: string;
    isLeafNode: boolean;
    itemType: string;
  }

  let querySchema: TreeNode[];
  let queryBuilder: ResponseQueryNode[][] = [];

  $: {
    if (schema) {
      try {
        querySchema = JSON.parse(schema)?.Query?.items || [];
        queryBuilder = levelOrderTraversalByLevel(querySchema, searchData);
      } catch (e) {
        querySchema = [];
        queryBuilder = [];
        console.error(e);
      }
    }
  }

  const levelOrderTraversalByLevel = (
    _data: TreeNode[],
    _searchData: string,
  ): ResponseQueryNode[][] => {
    if (!_data) return [];
    const searchedData = _data.filter((item) => {
      if (item.name.toLowerCase().includes(searchData.toLowerCase()))
        return true;
      return false;
    });
    const queue: TreeNode[] = [...searchedData]; // Initialize queue with the root nodes
    const result: ResponseQueryNode[][] = []; // To store nodes level by level

    while (queue.length > 0) {
      const levelSize = queue.length; // Number of nodes at the current level
      const currentLevel: ResponseQueryNode[] = []; // Array to store nodes of this level

      for (let i = 0; i < levelSize; i++) {
        const currentNode = queue.shift()!; // Dequeue the next node
        currentLevel.push({
          id: currentNode.id,
          name: currentNode.name,
          value: currentNode.value,
          isExpanded: currentNode.isExpanded,
          isSelected: currentNode.isSelected,
          parentNodeId: currentNode.parentNodeId,
          parentNodeName: currentNode.parentNodeName,
          isLeafNode: currentNode?.items?.length ? false : true,
          itemType: currentNode.itemType,
        }); // Add the full object to the current level array

        // Enqueue children
        if (currentNode.items && currentNode.items.length > 0) {
          if (currentNode.isExpanded) {
            currentNode.items.forEach((elem) => {
              queue.push({
                ...elem,
                parentNodeId: currentNode.id,
                parentNodeName: currentNode.name,
              });
            });
          }
        }
      }

      result.push(currentLevel); // Add the current level to the result
    }

    return result;
  };

  const expandNodeAtSameLevel = (
    _items: TreeNode[],
    _currentLevel: number,
    _id: string,
    _level: number,
    _isLeafNode: boolean,
  ): TreeNode[] => {
    if (_currentLevel === _level) {
      let isTargetLevel = false;
      _items.forEach((item) => {
        if (item.id === _id) {
          isTargetLevel = true;
        }
      });
      if (isTargetLevel) {
        if (!_isLeafNode) {
          _items.forEach((item) => {
            if (item.items.length) item.isExpanded = false;
          });
        }
        _items.forEach((item) => {
          if (item.id === _id) item.isExpanded = true;
        });
        return _items;
      }
    }

    // If we're not at the desired level, recurse into the `items` array
    return _items.map((item) => ({
      ...item,
      items: expandNodeAtSameLevel(
        item.items,
        _currentLevel + 1,
        _id,
        _level,
        _isLeafNode,
      ),
    }));
  };

  const collapseAllTheChildNodes = (
    _items: TreeNode[],
    _currentLevel: number,
    _id: string,
    _level: number,
  ): TreeNode[] => {
    if (_currentLevel === _level) {
      let isTargetLevel = false;
      _items.forEach((item) => {
        if (item.id === _id) {
          isTargetLevel = true;
        }
      });
      if (isTargetLevel) {
        _items.forEach((item) => {
          if (item.id === _id) {
            const collapseChildNodes = (item: TreeNode) => {
              item.isExpanded = false;
              for (let j = 0; j < item?.items?.length; j++) {
                collapseChildNodes(item.items[j]);
              }
            };
            collapseChildNodes(item);
          }
        });
        return _items;
      }
    }
    return _items.map((item) => ({
      ...item,
      items: collapseAllTheChildNodes(
        item.items,
        _currentLevel + 1,
        _id,
        _level,
      ),
    }));
  };

  const handleQBuilderCheckboxExpandOrCollapse = (
    _id: string,
    _level: number,
    _isExpandedNode: boolean,
    _isLeafNode: boolean,
  ) => {
    // Update the data with the modified check state

    if (_isExpandedNode) {
      querySchema = collapseAllTheChildNodes(querySchema, 0, _id, _level);
    } else {
      querySchema = expandNodeAtSameLevel(
        querySchema,
        0,
        _id,
        _level,
        _isLeafNode,
      );
    }
    const s = JSON.parse(schema);
    s.Query.items = querySchema;
    updateSchema(JSON.stringify(s));
  };

  const checksAllTheParentNodes = (_item: TreeNode, _id: string) => {
    if (_item.id === _id) {
      _item.isSelected = true;
      return true;
    }
    for (let j = 0; j < _item?.items?.length; j++) {
      if (checksAllTheParentNodes(_item.items[j], _id)) {
        _item.items[j].isSelected = true;
        return true;
      }
    }
  };

  const unchecksAllTheChildNodes = (_item: TreeNode, _id: string) => {
    if (_item.id === _id) {
      const uncheckChildNodes = (item: TreeNode) => {
        item.isSelected = false;
        item.value = "";
        for (let j = 0; j < item?.items?.length; j++) {
          uncheckChildNodes(item.items[j]);
        }
      };
      uncheckChildNodes(_item);
      return true;
    }
    for (let j = 0; j < _item?.items?.length; j++) {
      if (unchecksAllTheChildNodes(_item.items[j], _id)) {
        return true;
      }
    }
  };

  const handleQBuilderCheckboxCheckedOrUnchecked = (
    _id: string,
    _level: number,
    _isCheckedNode: boolean,
    _isLeafNode: boolean,
  ) => {
    if (_isCheckedNode) {
      // Unchecks all the child nodes.
      for (let i = 0; i < querySchema.length; i++) {
        if (unchecksAllTheChildNodes(querySchema[i], _id)) {
          break;
        }
      }
    } else {
      // Expands the current node.
      querySchema = expandNodeAtSameLevel(
        querySchema,
        0,
        _id,
        _level,
        _isLeafNode,
      );
      // Checks all the parent nodes.
      for (let i = 0; i < querySchema.length; i++) {
        if (checksAllTheParentNodes(querySchema[i], _id)) {
          querySchema[i].isSelected = true;
          break;
        }
      }
    }

    const s = JSON.parse(schema);
    s.Query.items = querySchema;
    updateSchema(JSON.stringify(s));
  };

  const handleInput = (_id: string, _value: string) => {
    const searchFieldById = (_item: TreeNode): boolean => {
      if (_item.id === _id) {
        _item.value = _value;
        return true;
      }
      for (let j = 0; j < _item?.items?.length; j++) {
        if (searchFieldById(_item.items[j])) {
          return true;
        }
      }
      return false;
    };
    for (let i = 0; i < querySchema.length; i++) {
      if (searchFieldById(querySchema[i])) {
        const s = JSON.parse(schema);
        s.Query.items = querySchema;
        updateSchema(JSON.stringify(s));
        return;
      }
    }
  };

  const handleBuilderInputboxChange = (_e: Event, _id: string) =>
    handleInput(_id, (_e.target as HTMLInputElement).value);

  let searchData = "";
</script>

<div class="d-flex flex-column h-100">
  <div
    class="d-flex"
    style="border-top:1px solid var(--border-secondary-500); border-bottom:1px solid var(--border-secondary-500);"
  >
    <div
      class="d-flex align-items-center py-3 pe-3"
      style="min-width: 272px; max-width: 272px; border-right: 1px solid var(--border-secondary-500);"
    >
      <WithSelect
        id={"hash9few99"}
        data={[
          {
            name: "Query",
            id: "Query",
          },
          {
            name: "Mutation",
            id: "Mutation",
          },
        ]}
        zIndex={499}
        titleId={"Query"}
        onclick={(id = "") => {
          // onUpdateRequestState({ requestAuthNavigation: id });
        }}
        disabled={false}
      />
      <div class="ms-2" style="margin-top: -4px;">
        <Input
          id="collectiofen-list-search"
          width={"100%"}
          height={"24px"}
          type="search"
          searchIconColor={"var(--icon-secondary-300 )"}
          bind:value={searchData}
          on:input={(e) => {}}
          defaultBorderColor="transparent"
          hoveredBorderColor="var(--border-primary-300)"
          focusedBorderColor={"var(--border-primary-300)"}
          class="text-fs-12 bg-tertiary-750 border-radius-2 ellipsis fw-normal px-2"
          placeholderColor={"var(--text-secondary-200)"}
          style="outline:none;"
          placeholder="Search"
          iconSize={"12px"}
        />
      </div>
    </div>
    <div class="py-3 ps-3 h-100 d-flex align-items-center">
      <p class="mb-0 text-secondary-200 text-fs-12">
        <!-- folder / folder / folder -->
      </p>
    </div>
  </div>
  <div class="" style="flex:1; overflow:auto;">
    <div
      class="h-100"
      style="display: flex
    ;
        flex-wrap: nowrap;"
    >
      {#each queryBuilder as r, index}
        <div
          class="fields-column h-100 ellipsis"
          style="min-width: 272px; max-width: 272px; overflow: auto; border-right:1px solid var(--border-secondary-500);
    "
        >
          <div class="d-flex flex-column h-100">
            <div class="ellipsis">
              {#if r[0]?.parentNodeName}
                <p class="mb-0 text-fs-12 ellipsis">
                  {r[0].parentNodeName}
                </p>
                <hr class="mt-2" />
              {/if}
            </div>
            <div style="flex:1; overflow:auto;">
              {#each r as t}
                <div
                  class="d-flex align-items-center attribute-row border-radius-2 py-1 px-2 justify-content-between mb-1"
                  style={t.isExpanded && !t?.isLeafNode
                    ? "background-color: var(--bg-secondary-600) !important;"
                    : ""}
                  on:click={(e) => {
                    e.preventDefault();
                    handleQBuilderCheckboxExpandOrCollapse(
                      t.id,
                      index,
                      t.isExpanded,
                      t.isLeafNode,
                    );
                  }}
                >
                  <div
                    class="d-flex align-items-center"
                    style="width:calc(100% - 20px);"
                  >
                    <div
                      style="height:14px; width:14px;"
                      class="me-2"
                      on:click={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        handleQBuilderCheckboxCheckedOrUnchecked(
                          t.id,
                          index,
                          t.isSelected,
                          t.isLeafNode,
                        );
                      }}
                    >
                      <label class="checkbox-parent">
                        <input type="checkbox" bind:checked={t.isSelected} />
                        <span class="checkmark"></span>
                      </label>
                    </div>

                    <p
                      class="d-flex align-items-center text-fs-12 mb-0 ellipsis"
                      style="width: calc(100% - 14px);"
                    >
                      <span class="ellipsis">
                        {t.name}
                      </span>
                      {#if t.isLeafNode && t.itemType === "inputField"}
                        <span class="ms-3 text-fs-8 text-primary-300">
                          ARG
                        </span>
                      {/if}
                    </p>
                  </div>
                  {#if !t.isLeafNode}
                    <span
                      class="d-flex align-items-center justify-content-center"
                    >
                      <AngleLeftIcon
                        height={"8px"}
                        width={"8px"}
                        color="var(--text-secondary-200)"
                      />
                    </span>
                  {/if}
                </div>
                {#if t.isLeafNode && t.itemType === "inputField" && t.isSelected}
                  <div class="ps-4 pe-3 mb-2 position-relative">
                    <input
                      type="text"
                      style="border:1px solid grey; outline:none;"
                      class="arg-input w-100 bg-transparent border-radius-2 px-2 pe-3 py-1 text-fs-12"
                      placeholder="Enter value"
                      value={t.value || ""}
                      on:input={(e) => {
                        handleBuilderInputboxChange(e, t?.id);
                      }}
                    />
                    {#if t?.value}
                      <span
                        class="position-absolute"
                        style="top:0px; right: 22px"
                        on:click={() => {
                          handleBuilderInputboxChange(
                            {
                              target: {
                                value: "",
                              },
                            },
                            t?.id,
                          );
                        }}
                      >
                        <img
                          src={trashIcon}
                          style="height: 100%; width: 100%;"
                          class="trashicon"
                        />
                      </span>
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      {/each}
      {#if searchData && !queryBuilder?.length}
        <div
          class="fields-column h-100 ellipsis"
          style="min-width: 272px; max-width: 272px; overflow: auto; border-right:1px solid var(--border-secondary-500);
    "
        >
          <div class="h-100 d-flex align-items-center justify-content-center">
            <p
              class="text-fs-12 text-secondary-200"
              style="text-align: center;"
            >
              No result found.
            </p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* The checkbox-parent */
  .checkbox-parent {
    display: block;
    position: relative;
    cursor: pointer;
    font-size: 22px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Hide the browser's default checkbox */
  .checkbox-parent input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    background-color: transparent;
    border: 2px solid var(--text-secondary-500);
  }

  /* Create a custom checkbox */
  .checkbox-parent .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 14px;
    width: 14px;
    border-radius: 3px;
    background-color: transparent;
    border: 2px solid var(--text-secondary-370);
  }

  /* On mouse-over, add a grey background color */
  /* .checkbox-parent:hover input ~ .checkmark {
    background-color: #ccc;
  } */

  /* When the checkbox is isExpanded, add a blue background */
  .checkbox-parent input:checked ~ .checkmark {
    border: none;
    background-color: var(--bg-primary-300);
  }

  /* Create the checkmark/indicator (hidden when not isExpanded) */
  .checkbox-parent .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when isExpanded */
  .checkbox-parent input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the checkmark/indicator */
  .checkbox-parent .checkmark:after {
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid var(--text-secondary-800);
    border-width: 0 2px 2px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  .attribute-row:hover {
    background-color: var(--bg-secondary-700);
  }
  .fields-column {
    padding: 12px;
  }
  .fields-column:first-child {
    padding-left: 0px;
  }
  /* .fields-column:last-child {
    padding-right: 0px;
    border-right: none !important;
  } */
  .arg-input {
    /* background-color: var(--bg-secondary-850) !important; */
    border: 1px solid var(--border-secondary-370) !important;
    padding-right: 25px !important;
  }
  .arg-input:hover,
  .arg-input:focus {
    background-color: var(--bg-tertiary-750) !important;
    border: 1px solid var(--border-primary-300) !important;
  }
  hr {
    height: 4px !important;
    background-color: var(--bg-secondary-600) !important;
    border: none !important;
  }
</style>
