<script lang="ts">
  import RecentApi from "$lib/components/dashboard/recent-apis/RecentAPI.svelte";
  import RecentWorkspace from "$lib/components/dashboard/recent-workspace/RecentWorkspace.svelte";
  export let data: any;
  let recentAPI = [
    {
      type: "DEL",
      title: "Cancel Booking wdmnahdsvcc csdabc cshb",
      endpoint: "Domigo/bookings (book) dcbjh cdbcdbcc eeej",
    },
    {
      type: "ARC",
      title: "Cancel Booking",
      endpoint: "Domigo/bookings (book)",
    },
    {
      type: "POST",
      title: "Cancel Booking",
      endpoint: "Domigo/bookings (book)",
    },
    {
      type: "PUT",
      title: "Cancel Booking",
      endpoint: "Domigo/bookings (book)",
    },
  ];
</script>

<div
  style="border-right: 1px solid #313233; overflow: auto;"
  class="sidebar d-flex flex-column bg-backgroundColor p-3"
>
  <RecentApi {recentAPI} />
  <hr />
  <RecentWorkspace {data} />
</div>

<style>
  .sidebar {
    width: 280px;
    position: fixed;
    top: 44px;
    left: 72px;
    height: calc(100vh - 44px);
  }
</style>
