<script lang="ts">
  import { onMount } from "svelte";
  import { WithSelect } from "../../../../hoc";
  import {
    AngleLeftIcon,
    AngleRightIcon,
    ArrowRightIcon,
  } from "@sparrow/library/icons";

  interface TreeNode {
    name: string;
    value: string;
    items?: TreeNode[];
    id: string;
    checked: boolean;
    parentId?: string;
  }

  let data = [
    {
      name: "asif",
      value: "",
      id: 1,
      checked: false,
      items: [
        {
          name: "q",
          value: "",
          id: 2,
          checked: false,
          items: [],
        },
        {
          name: "w",
          value: "",
          id: 3,
          checked: false,
          items: [],
        },
        {
          name: "r",
          value: "",
          id: 4,
          checked: false,
          items: [
            {
              name: "5",
              value: "",
              id: 5,
              checked: false,
              items: [],
            },
            {
              name: "6",
              value: "",
              id: 6,
              checked: false,
              items: [],
            },
            {
              name: "7",
              value: "",
              id: 7,
              checked: false,
              items: [],
            },
          ],
        },
      ],
    },
    {
      name: "var",
      value: "",
      id: 8,
      checked: false,
      items: [
        {
          name: "b",
          value: "",
          id: 9,
          checked: false,
          items: [],
        },
        {
          name: "g",
          value: "",
          id: 10,
          checked: false,
          items: [],
        },
        {
          name: "k",
          value: "",
          id: 11,
          checked: false,
          items: [],
        },
      ],
    },
    {
      name: "nj",
      value: "",
      id: 12,
      checked: false,
      items: [
        {
          name: "e",
          value: "",
          id: 13,
          checked: false,
          items: [],
        },
        {
          name: "r",
          value: "",
          id: 14,
          checked: false,
          items: [],
        },
        {
          name: "t",
          value: "",
          id: 15,
          checked: false,
          items: [],
        },
      ],
    },
  ];

  function levelOrderTraversalByLevel(data: TreeNode[]): TreeNode[][] {
    const queue: TreeNode[] = [...data]; // Initialize queue with the root nodes
    const result: TreeNode[][] = []; // To store nodes level by level

    while (queue.length > 0) {
      const levelSize = queue.length; // Number of nodes at the current level
      const currentLevel: TreeNode[] = []; // Array to store nodes of this level

      for (let i = 0; i < levelSize; i++) {
        const currentNode = queue.shift()!; // Dequeue the next node
        currentLevel.push({
          id: currentNode.id,
          name: currentNode.name,
          value: currentNode.value,
          checked: currentNode.checked,
          parentId: currentNode.parentId,
          parentName: currentNode.parentName,
        }); // Add the full object to the current level array

        // Enqueue children
        if (currentNode.items && currentNode.items.length > 0) {
          //   queue.push(...currentNode.items);
          if (currentNode.checked) {
            currentNode.items.forEach((elem) => {
              queue.push({
                ...elem,
                parentId: currentNode.id,
                parentName: currentNode.name,
              });
            });
          }
        }
      }

      result.push(currentLevel); // Add the current level to the result
      console.log("levels ", currentLevel);
    }

    return result;
  }
  let res = [];
  onMount(() => {
    res = levelOrderTraversalByLevel(data);
  });

  const handleCheck = (id: string, level: number) => {
    const toggleCheckAtLevel = (items: any[], currentLevel: number) => {
      if (currentLevel === level) {
        // If we're at the desired level, uncheck all items and check the one with the given id
        return items.map((item) => ({
          ...item,
          checked: item.id === id, // Check the item with the matching id, uncheck others
        }));
      }

      // If we're not at the desired level, recurse into the `items` array
      return items.map((item) => ({
        ...item,
        items: toggleCheckAtLevel(item.items, currentLevel + 1),
      }));
    };

    // Update the data with the modified check state
    data = toggleCheckAtLevel(data, 0); // Start at level 1 (root level)
    res = levelOrderTraversalByLevel(data);
  };
</script>

<div class="d-flex flex-column h-100">
  <div>
    <p class="text-fs-12 mb-0 py-2">Clear Query</p>
  </div>
  <div
    class="d-flex"
    style="border-top:1px solid var(--border-secondary-500); border-bottom:1px solid var(--border-secondary-500);"
  >
    <div
      class="d-flex py-3 pe-3"
      style="min-width: 272px; border-right: 1px solid var(--border-secondary-500);"
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
    </div>
    <div class="py-3 ps-3 h-100 d-flex align-items-center">
      <p class="mb-0 text-secondary-200 text-fs-12">folder / folder / folder</p>
    </div>
  </div>
  <div class="" style="flex:1; overflow:auto;">
    <div
      class="h-100"
      style="display: flex
    ;
        flex-wrap: nowrap;"
    >
      {#each res as r, index}
        <div
          class="{index === 0 ? 'p-3 ps-0' : 'p-3'} h-100"
          style="min-width: 272px; overflow: auto; border-right:1px solid var(--border-secondary-500);
    
    "
        >
          <div class="d-flex flex-column h-100">
            <div>
              {#if r[0]?.parentName}
                <p class="mb-0 text-fs-12">
                  {r[0].parentName}
                </p>
                <hr class="mt-2" />
              {/if}
            </div>
            <div style="flex:1; overflow:auto;">
              {#each r as t}
                <div
                  class="d-flex align-items-center attribute-row border-radius-2 py-1 px-2 justify-content-between mb-1"
                >
                  <div class="d-flex align-items-center">
                    <div style="height:14px; width:14px;" class="me-3">
                      <label class="checkbox-parent">
                        <input
                          type="checkbox"
                          bind:checked={t.checked}
                          on:input={() => {
                            handleCheck(t.id, index);
                          }}
                        />
                        <span class="checkmark"></span>
                      </label>
                    </div>
                    <p class="text-fs-12 mb-0">
                      {t.name}
                    </p>
                  </div>
                  <span
                    class="d-flex align-items-center justify-content-center"
                  >
                    <AngleLeftIcon
                      height={"8px"}
                      width={"8px"}
                      color="var(--text-secondary-200)"
                    />
                  </span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/each}
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
    border: 2px solid var(--text-secondary-500);
  }

  /* On mouse-over, add a grey background color */
  /* .checkbox-parent:hover input ~ .checkmark {
    background-color: #ccc;
  } */

  /* When the checkbox is checked, add a blue background */
  .checkbox-parent input:checked ~ .checkmark {
    border: none;
    background-color: var(--bg-primary-300);
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkbox-parent .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when checked */
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
    background-color: var(--bg-secondary-600);
  }
</style>
