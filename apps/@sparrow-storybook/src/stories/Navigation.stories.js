// import { Navigation } from "@sparrow/library/ui";


import {
    Sidebar,
  } from "@sparrow/common/components";
  import {
    home,
    hoveredHome,
    selectedHome,
    settings,
    selectedSettings,
    hoveredSettings,
    collections,
    hoveredCollections,
    selectedCollections,
    help,
    hoveredHelp,
    selectedHelp,
  } from "../../../../packages/@sparrow-common/src/components/sidebar/common";

export default {
  title: 'Components/Navigation-rail',
  component: Sidebar,
  };
  

export const defaultIcon = {
    args:{
        sidebarItems:[
          {
            route: true ? "/app/home" : "/guest/home",
            heading: "Home",
            defaultLogo: home,
            hoveredLogo: hoveredHome,
            selectedLogo: selectedHome,
            disabled: false,
            position: "primary",
          },
          {
            route: true ? "/app/collections" : "/guest/collections",
        heading: "Workspace",
        defaultLogo: collections,
        hoveredLogo: hoveredCollections,
        selectedLogo: selectedCollections,
        disabled: false,
        position: "primary",
          },
          {
            route: "/app/help",
            heading: "Community",
            defaultLogo: help,
            hoveredLogo: hoveredHelp,
            selectedLogo: selectedHelp,
            disabled: false,
            position: "secondary",
          },
          {
            route: "/app/setting",
           heading: "Setting",
           defaultLogo: settings,
           hoveredLogo: hoveredSettings,
           selectedLogo: selectedSettings,
           disabled: false,
           position: "secondary",
           },
        ]
    }
}
export const disabledIcon = {
  args:{
      sidebarItems:[
        {
          route: true ? "/app/home" : "/guest/home",
          heading: "Home",
          defaultLogo: home,
          hoveredLogo: hoveredHome,
          selectedLogo: selectedHome,
          disabled: true,
          position: "primary",
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      defaultLogo: collections,
      hoveredLogo: hoveredCollections,
      selectedLogo: selectedCollections,
      disabled: true,
      position: "primary",
        },
        {
          route: "/app/help",
          heading: "Community",
          defaultLogo: help,
          hoveredLogo: hoveredHelp,
          selectedLogo: selectedHelp,
          disabled: true,
          position: "secondary",
        },
        {
          route: "/app/setting",
         heading: "Setting",
         defaultLogo: settings,
         hoveredLogo: hoveredSettings,
         selectedLogo: selectedSettings,
         disabled: true,
         position: "secondary",
         },
      ]
  }
}
export const semibottomUpIcon = {
  args:{
      sidebarItems:[
        {
          route: true ? "/app/home" : "/guest/home",
          heading: "Home",
          defaultLogo: home,
          hoveredLogo: hoveredHome,
          selectedLogo: selectedHome,
          disabled: false,
          position: "primary",
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      defaultLogo: collections,
      hoveredLogo: hoveredCollections,
      selectedLogo: selectedCollections,
      disabled: false,
      position: "primary",
        },
        {
          route: "/app/help",
          heading: "Community",
          defaultLogo: help,
          hoveredLogo: hoveredHelp,
          selectedLogo: selectedHelp,
          disabled: true,
          position: "secondary",
        },
        {
          route: "/app/setting",
         heading: "Setting",
         defaultLogo: settings,
         hoveredLogo: hoveredSettings,
         selectedLogo: selectedSettings,
         disabled: true,
         position: "secondary",
         },
      ]
  }
}
export const semiBottomDownIcon = {
  args:{
      sidebarItems:[
        {
          route: true ? "/app/home" : "/guest/home",
          heading: "Home",
          defaultLogo: home,
          hoveredLogo: hoveredHome,
          selectedLogo: selectedHome,
          disabled: true,
          position: "primary",
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      defaultLogo: collections,
      hoveredLogo: hoveredCollections,
      selectedLogo: selectedCollections,
      disabled: true,
      position: "primary",
        },
        {
          route: "/app/help",
          heading: "Community",
          defaultLogo: help,
          hoveredLogo: hoveredHelp,
          selectedLogo: selectedHelp,
          disabled: false,
          position: "secondary",
        },
        {
          route: "/app/setting",
         heading: "Setting",
         defaultLogo: settings,
         hoveredLogo: hoveredSettings,
         selectedLogo: selectedSettings,
         disabled: false,
         position: "secondary",
         },
      ]
  }
}

