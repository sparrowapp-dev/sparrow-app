<script lang="ts">
  import { WithSelect } from "../../../../hoc";
  import { AngleLeftIcon, ThreeDotIcon } from "@sparrow/library/icons";
  import { Search, Checkbox } from "@sparrow/library/forms";

  import { trashIcon } from "@sparrow/library/assets";
  import { Dropdown } from "@sparrow/library/ui";
  import { GraphqlRequestOperationTabEnum } from "@sparrow/common/types/workspace/graphql-request-tab";
  import { Breadcrumbs } from "@sparrow/library/ui";

  export let schema;
  export let updateSchema;
  export let requestOperationSection;
  export let onUpdateRequestState;
  export let operationSearch = "";
  export let updateOperationSearch;

  interface QuerySchema {
    name: string;
    value: string;
    items: QuerySchema[];
    id: string;
    isExpanded: boolean;
    isSelected: boolean;
    parentNodeId: string;
    parentNodeName: string;
    itemType: string;
  }

  interface QueryBuilder {
    name: string;
    value: string;
    items?: QueryBuilder[];
    id: string;
    isExpanded: boolean;
    isSelected: boolean;
    parentNodeId: string;
    parentNodeName: string;
    isLeafNode: boolean;
    itemType: string;
  }

  interface Breadcrum {
    id: string;
    name: String;
  }

  let querySchema: QuerySchema[] = [];
  let queryBuilder: QueryBuilder[][] = [];
  let breadcrum: Breadcrum[][] = [];
  let isBreadcrumDropdownVisible: boolean = false;
  let isBreadcrumDropdownHovered: boolean = false;
  let isQueryInputFocused: boolean = false;

  $: {
    try {
      if (requestOperationSection) {
        if (requestOperationSection === GraphqlRequestOperationTabEnum.QUERY) {
          querySchema = JSON.parse(schema)?.Query?.items || [];
        } else if (
          requestOperationSection === GraphqlRequestOperationTabEnum.MUTATION
        ) {
          querySchema = JSON.parse(schema)?.Mutation?.items || [];
        }
        queryBuilder = calculateQueryBuilder(querySchema, operationSearch);
        breadcrum = calculateBreadcrumPath(queryBuilder, 5);
      }
    } catch (e) {
      querySchema = [];
      queryBuilder = [];
      breadcrum = [];
      console.error(e);
    }
  }

  /**
   * Saves Query and Mutation to database.
   */
  const saveSchemaToDatabase = () => {
    const s = JSON.parse(schema);
    if (requestOperationSection === GraphqlRequestOperationTabEnum.QUERY) {
      s.Query.items = querySchema;
    } else if (
      requestOperationSection === GraphqlRequestOperationTabEnum.MUTATION
    ) {
      s.Mutation.items = querySchema;
    }
    updateSchema(JSON.stringify(s));
  };

  /**
   * Calculates the breadcrumb path from the query builder's data structure.
   * The function iterates over the query builder and extracts the parent node
   * name and ID for each level, creating breadcrumb elements to represent the
   * path through the query structure.
   *
   * @param _queryBuilder - A 2D array of QueryBuilder elements representing
   *                        the levels of a query structure. Defaults to an
   *                        empty array if not provided.
   * @param _breadcrumMaxWrapper - Max size at which breadcrum wraps.
   * @returns An array of `Breadcrum` objects, each containing a `name` and `id`
   *          representing the breadcrumb path.
   */
  const calculateBreadcrumPath = (
    _queryBuilder: QueryBuilder[][] = [],
    _breadcrumMaxWrapper: number = 3,
  ): Breadcrum[][] => {
    let result: Breadcrum[][] = [];
    if (_queryBuilder?.length < 2) {
      return result;
    }

    if (_queryBuilder.length - 1 <= _breadcrumMaxWrapper) {
      result.push([]);
      for (let i = 1; i < _queryBuilder.length; i++) {
        result[0].push({
          name: _queryBuilder[i][0].parentNodeName,
          id: _queryBuilder[i][0].parentNodeId,
        });
      }
    } else {
      result.push([], [], []);
      for (let i = 1; i < _queryBuilder.length; i++) {
        if (i === 1) {
          result[0].push({
            name: _queryBuilder[i][0].parentNodeName,
            id: _queryBuilder[i][0].parentNodeId,
          });
        } else if (
          i === _queryBuilder.length - 1 ||
          i === _queryBuilder.length - 2
        ) {
          result[2].push({
            name: _queryBuilder[i][0].parentNodeName,
            id: _queryBuilder[i][0].parentNodeId,
          });
        } else {
          result[1].push({
            name: _queryBuilder[i][0].parentNodeName,
            id: _queryBuilder[i][0].parentNodeId,
          });
        }
      }
    }
    return result;
  };

  /**
   * Performs a level-order traversal on the tree structure and returns nodes grouped by level.
   * @param _data - Array of tree nodes to traverse.
   * @param _searchData - Search term for filtering nodes.
   * @returns An array of arrays, where each inner array represents a tree level.
   */
  const calculateQueryBuilder = (
    _data: QuerySchema[],
    _searchData: string,
  ): QueryBuilder[][] => {
    const result: QueryBuilder[][] = []; // To store nodes level by level
    if (!_data) return result;
    const searchedData = _data.filter((item) => {
      if (item.name.toLowerCase().includes(_searchData.toLowerCase()))
        return true;
      return false;
    });
    const queue: QuerySchema[] = [...searchedData]; // Initialize queue with the root nodes

    while (queue.length > 0) {
      const levelSize = queue.length; // Number of nodes at the current level
      const currentLevel: QueryBuilder[] = []; // Array to store nodes of this level

      for (let i = 0; i < levelSize; i++) {
        const currentNode = queue.shift()!; // Dequeue the next node
        const {
          id,
          name,
          value,
          isExpanded,
          isSelected,
          parentNodeId,
          parentNodeName,
          items,
          itemType,
        } = currentNode;

        currentLevel.push({
          id: id,
          name: name,
          value: value,
          isExpanded: isExpanded,
          isSelected: isSelected,
          parentNodeId: parentNodeId,
          parentNodeName: parentNodeName,
          isLeafNode: items?.length ? false : true,
          itemType: itemType,
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

  /**
   * Toggles node expansion and collapse, ensuring only one node per level is expanded.
   * @param _items - Array of tree nodes to modify.
   * @param _currentLevel - Current depth level of the tree.
   * @param _id - ID of the target node to expand.
   * @param _level - The target depth level.
   * @param _isLeafNode - Whether the target node is a leaf node.
   * @returns Modified array of tree nodes.
   */
  const expandNodeAtSameLevel = (
    _items: QuerySchema[],
    _currentLevel: number,
    _id: string,
    _level: number,
    _isLeafNode: boolean,
  ): QuerySchema[] => {
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

  /**
   * Collapses all child nodes recursively for a given parent node.
   * @param _items - Array of tree nodes to modify.
   * @param _currentLevel - Current depth level of the tree.
   * @param _id - ID of the target node.
   * @param _level - The target depth level.
   * @returns Modified array of tree nodes.
   */
  const collapseAllTheChildNodes = (
    _items: QuerySchema[],
    _currentLevel: number,
    _id: string,
    _level: number,
  ): QuerySchema[] => {
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
            const collapseChildNodes = (item: QuerySchema) => {
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

  /**
   * Handles expand/collapse toggling of a query builder node.
   * @param _id - ID of the target node.
   * @param _level - Depth level of the target node.
   * @param _isExpandedNode - Whether the target node is currently expanded.
   * @param _isLeafNode - Whether the target node is a leaf node.
   */
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
    saveSchemaToDatabase();
  };

  /**
   * Marks the target node and all its parent nodes as selected in a tree structure.
   * @param _item - The current tree node being traversed.
   * @param _id - The ID of the target node to find and mark as selected.
   * @returns `true` if the target node or its parent nodes are found and selected; otherwise, `false`.
   */
  const checksAllTheParentNodes = (_item: QuerySchema, _id: string) => {
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

  /**
   * Unselects the specified node and all its child nodes in a tree structure.
   * Also clears their `value` property.
   * @param _item - The current tree node being traversed.
   * @param _id - The ID of the target node to find and unselect along with its child nodes.
   * @returns `true` if the target node is found and processed; otherwise, `false`.
   */
  const unchecksAllTheChildNodes = (_item: QuerySchema, _id: string) => {
    if (_item.id === _id) {
      const uncheckChildNodes = (item: QuerySchema) => {
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

  /**
   * Handles the logic when a checkbox is checked or unchecked in a query builder.
   * It updates the tree structure accordingly by expanding or collapsing nodes
   * and marking their selection state.
   *
   * @param _id - The ID of the node being checked or unchecked.
   * @param _level - The level of the node in the tree.
   * @param _isCheckedNode - Boolean indicating whether the node is checked or unchecked.
   * @param _isLeafNode - Boolean indicating whether the node is a leaf (has no children).
   */
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

    saveSchemaToDatabase();
  };

  /**
   * Naigates the query builder to the qunique column id.
   * @param _id - id of the column.
   */
  const navigateToBreadcrumPath = (_id: string): void => {
    const searchFieldById = (_item: QuerySchema): boolean => {
      if (_item.id === _id) {
        _item.items.forEach((item) => {
          item.isExpanded = false;
        });
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
        saveSchemaToDatabase();
        return;
      }
    }
  };

  /**
   * Handles input change by updating the value of a specific field in the tree structure
   * based on the provided ID. It searches the tree recursively for the node with the matching ID
   * and updates its value. Once updated, it updates the schema with the new value.
   *
   * @param _id - The ID of the node whose value is being updated.
   * @param _value - The new value to be set for the node with the specified ID.
   */
  const updateAttributeInputData = (_id: string, _value: string) => {
    const searchFieldById = (_item: QuerySchema): boolean => {
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
        saveSchemaToDatabase();
        return;
      }
    }
  };

  /**
   * Handles input box change event by invoking the `updateAttributeInputData` function to update
   * the value of the node in the tree structure. The value from the event target
   * (input box) is passed along with the node ID to update the corresponding node.
   *
   * @param _e - The event object that contains the input value from the input box.
   * @param _id - The ID of the node to be updated.
   */
  const handleQBuilderInputboxChange = (_e: Event, _id: string) =>
    updateAttributeInputData(_id, (_e.target as HTMLInputElement).value);
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
            id: GraphqlRequestOperationTabEnum.QUERY,
          },
          {
            name: "Mutation",
            id: GraphqlRequestOperationTabEnum.MUTATION,
          },
        ]}
        zIndex={499}
        titleId={requestOperationSection}
        onclick={(id = "") => {
          onUpdateRequestState({ operationNavigation: id });
        }}
        disabled={false}
      />
      <div class="ms-2" style="margin-top: -4px;">
        <Search
          id="graphql-query-search"
          customWidth={"100%"}
          variant="primary"
          bind:value={operationSearch}
          on:input={() => {
            updateOperationSearch(operationSearch);
          }}
          placeholder="Search"
        />
      </div>
    </div>
    <Breadcrumbs breadcrumbs={breadcrum} onNavigate={navigateToBreadcrumPath} />
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
                      <!-- <label class="checkbox-parent"> -->

                      <Checkbox bind:checked={t.isSelected} />
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
                  <div class="input-parent ps-4 pe-3 mb-2 position-relative">
                    <input
                      type="text"
                      style="border:1px solid grey; outline:none;"
                      class="arg-input w-100 bg-transparent border-radius-2 px-2 pe-3 py-1 text-fs-12"
                      placeholder="Enter value"
                      value={t.value || ""}
                      on:input={(e) => {
                        handleQBuilderInputboxChange(e, t?.id);
                      }}
                      on:focus={() => {
                        isQueryInputFocused = true;
                      }}
                      on:blur={() => {
                        setTimeout(() => {
                          isQueryInputFocused = false;
                        }, 400);
                      }}
                    />
                    {#if t?.value && isQueryInputFocused}
                      <span
                        role="button"
                        class="trash-container position-absolute"
                        style="top:0px; right: 22px"
                        on:click={() => {
                          updateAttributeInputData(t?.id, "");
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
      {#if operationSearch && !queryBuilder?.length}
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
  .attribute-row {
    height: 28px;
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

  .arg-input {
    border: 1px solid var(--border-secondary-370) !important;
    padding-right: 25px !important;
  }

  .arg-input:focus {
    background-color: var(--bg-tertiary-750) !important;
    border: 1px solid var(--border-primary-300) !important;
  }
  hr {
    height: 4px !important;
    background-color: var(--bg-secondary-600) !important;
    border: none !important;
  }
  .bread-parent {
    background-color: var(--bg-tertiary-300) !important;
  }
  .bread-item-active {
    cursor: pointer;
    color: var(--text-secondary-100) !important;
  }
  .bread-item {
    cursor: pointer;
    color: var(--text-secondary-550) !important;
  }
</style>
