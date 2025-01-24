
import {
    Sidebar
  } from "@sparrow/common/components";
 

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
            id :"Home",
            defaultLogo: "home", // Replace with actual image paths
            hoveredLogo: "hoveredHome",
            selectedLogo: "selectedHome",
            disabled: false,
            position: "primary",
          },
          {
            route: true ? "/app/collections" : "/guest/collections",
            id:"Workspace",
        heading: "Workspace",
        defaultLogo: "collections",
        hoveredLogo: "hoveredCollections",
        selectedLogo: "selectedCollections",
        disabled: false,
        position: "primary",
          },
          {
            route: "/app/help",
            id:"Community",
            heading: "Community",
            defaultLogo: "help",
            hoveredLogo: "hoveredHelp",
            selectedLogo: "selectedHelp",
            disabled: false,
            position: "secondary",
          },
          {
            route: "/app/setting",
            id:"Setting",
           heading: "Setting",
           defaultLogo: "settings",
           hoveredLogo: "hoveredSettings",
           selectedLogo: "selectedSettings",
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
          id:"Home",
          defaultLogo: "home",
          hoveredLogo: "hoveredHome",
          selectedLogo: "selectedHome",
          disabled: true,
          position: "primary",
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      id:"Workspace",
      defaultLogo: "collections",
      hoveredLogo: "hoveredCollections",
      selectedLogo: "selectedCollections",
      disabled: true,
      position: "primary",
        },
        {
          route: "/app/help",
          heading: "Community",
          id: "Community",
          defaultLogo: "help",
          hoveredLogo: "hoveredHelp",
          selectedLogo: "selectedHelp",
          disabled: true,
          position: "secondary",
        },
        {
          route: "/app/setting",
         heading: "Setting",
         id:      "Setting",
         defaultLogo: "settings",
         hoveredLogo: "hoveredSettings",
         selectedLogo: "selectedSettings",
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
          id: "Home",
          defaultLogo: "home",
          hoveredLogo: "hoveredHome",
          selectedLogo: "selectedHome",
          disabled: false,
          position: "primary",
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      id:  "Workspace",
      defaultLogo: "collections",
      hoveredLogo: "hoveredCollections",
      selectedLogo: "selectedCollections",
      disabled: false,
      position: "primary",
        },
        {
          route: "/app/help",
          heading: "Community",
          id: "Community",
          defaultLogo: "help",
          hoveredLogo: "hoveredHelp",
          selectedLogo: "selectedHelp",
          disabled: true,
          position: "secondary",
        },
        {
          route: "/app/setting",
         heading: "Setting",
         id: "Setting",
         defaultLogo: "settings",
         hoveredLogo: "hoveredSettings",
         selectedLogo: "selectedSettings",
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
          id: "Home",
          defaultLogo: "home",
          hoveredLogo: "hoveredHome",
          selectedLogo: "selectedHome",
          disabled: true,
          position: "primary",
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      id: "Workspace",
      defaultLogo: "collections",
      hoveredLogo: "hoveredCollections",
      selectedLogo: "selectedCollections",
      disabled: true,
      position: "primary",
        },
        {
          route: "/app/help",
          heading: "Community",
          id: "Community",
          defaultLogo: "help",
          hoveredLogo: "hoveredHelp",
          selectedLogo: "selectedHelp",
          disabled: false,
          position: "secondary",
        },
        {
          route: "/app/setting",
         heading: "Setting",
         id: "Setting",
         defaultLogo: "settings",
         hoveredLogo: "hoveredSettings",
         selectedLogo: "selectedSettings",
         disabled: false,
         position: "secondary",
         },
      ]
  }
}

