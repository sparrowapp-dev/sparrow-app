<script lang="ts">
    import RecentApi from "$lib/components/dashboard/recent-apis/RecentAPI.svelte";
    import RecentWorkspace from "$lib/components/dashboard/recent-workspace/RecentWorkspace.svelte";
    import Teams from "$lib/components/dashboard/teams/Teams.svelte";

    let teams = [
    {
      name: "Techdome",
      icon: "https://media.licdn.com/dms/image/C4D0BAQFfIHYVwIh9Sg/company-logo_200_200/0/1673252621612/techdome_solutions_logo?e=2147483647&v=beta&t=qtBSoQK4rWfcefg6BU4d-EiHAzyR0metwD_lHh3SWnU",
    },
    {
      name: "Microsoft",
      icon: "https://media.licdn.com/dms/image/C4D0BAQFfIHYVwIh9Sg/company-logo_200_200/0/1673252621612/techdome_solutions_logo?e=2147483647&v=beta&t=qtBSoQK4rWfcefg6BU4d-EiHAzyR0metwD_lHh3SWnU",
    },
  ];
  let workspace = ["Luxfer", "Domigo", "Kwison", "Neat Heat"];
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
    style="width:280px; ;border-right: 1px solid #313233;"
    class="sidebar d-flex flex-column bg-backgroundColor p-3">
    <Teams {teams} />
    <hr />
    <RecentApi {recentAPI}  />
    <hr />
    <RecentWorkspace {workspace} />
  </div>
  
  <style>
    .sidebar {
      position: fixed;
      top: 50px;
      left: 72px;
      height: calc(100vh - 44px);
    }
  </style>
  