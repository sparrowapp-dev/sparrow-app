
import {
    Sidebar
  } from "@sparrow/common/features";
 

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
            disabled: false,
            position: "primary",
          },
          {
            route: true ? "/app/collections" : "/guest/collections",
            id:"Workspace",
        heading: "Workspace",
        disabled: false,
        position: "primary",
          },
          {
            route: "/app/help",
            id:"Community",
            heading: "Community",
            disabled: false,
            position: "secondary",
          },
          {
            route: "/app/setting",
            id:"Setting",
           heading: "Setting",
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
          disabled: true,
          position: "primary",
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      id:"Workspace",
      disabled: true,
      position: "primary",
        },
        {
          route: "/app/help",
          heading: "Community",
          id: "Community",
          disabled: true,
          position: "secondary",
        },
        {
          route: "/app/setting",
         heading: "Setting",
         id:      "Setting",
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
          disabled: false,
          position: "primary",
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      id:  "Workspace",
      disabled: false,
      position: "primary",
        },
        {
          route: "/app/help",
          heading: "Community",
          id: "Community",
          disabled: true,
          position: "secondary",
        },
        {
          route: "/app/setting",
         heading: "Setting",
         id: "Setting",
 
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
          disabled: true,
          position: "primary",
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      id: "Workspace",
      disabled: true,
      position: "primary",
        },
        {
          route: "/app/help",
          heading: "Community",
          id: "Community",
          disabled: false,
          position: "secondary",
        },
        {
          route: "/app/setting",
         heading: "Setting",
         id: "Setting",
         disabled: false,
         position: "secondary",
         },
      ]
  }
}

