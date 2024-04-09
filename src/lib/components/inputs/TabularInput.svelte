<script context="module" lang="ts">
  export type TableRow = {
    id: string;
    [key: string]: string;
  };
</script>

<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import Button from "../buttons/Button.svelte";
  import trashIcon from "$lib/assets/trash-icon.svg";

  let componentClasses: string = "";
  export { componentClasses as class };

  export let columns: string[] = [];

  export let rows: TableRow[];

  const addRow = () => {
    const id = uuidv4();
    let newRow = { id };
    rows = [...rows, newRow];
  };

  const deleteRow = (id: string) => {
    if (id !== rows[rows.length - 1].id) {
      rows = rows.filter((row) => row.id !== id);
    }
  };

  // add a new row as soon as new input is added to last row
  const handleInput = (id: string) => {
    if (id === rows[rows.length - 1].id) {
      addRow();
    }
  };
</script>

<!-- TODO: customize resizable style -->

<div class={componentClasses}>
  <table class="table">
    <thead>
      <tr>
        {#each columns as column}
          <th class="input-cell resizable">{column}</th>
        {/each}
        <th class="input-cell"></th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row, index}
        <tr>
          {#each columns as column}
            <td class="input-cell resizable">
              <input
                type="text"
                class="w-100 px-1"
                bind:value={row[column]}
                on:input={() => handleInput(row.id)}
              />
            </td>
          {/each}
          <td class="input-cell">
            <!-- Show delete button for all rows except the last row -->
            {#if row.id !== rows[rows.length - 1].id}
              <Button
                type="icon"
                title=""
                buttonStartIcon={trashIcon}
                onClick={() => deleteRow(row.id)}
              />
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .input-cell {
    padding: 4px 12px;
    background-color: transparent;
    border-radius: 0;
    border: 1px solid var(--border-color);
    font-size: 13px;
  }

  .resizable {
    resize: horizontal;
    overflow: auto;
  }
</style>
