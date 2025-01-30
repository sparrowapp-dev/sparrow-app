
import {
    Sidebar
<<<<<<< HEAD
  } from "@sparrow/common/components";
=======
  } from "@sparrow/common/features";
 
  import {
    SidebarItemPositionBaseEnum,
    SidebarItemIdEnum,
  } from "@sparrow/common/types/sidebar/sidebar-base";  

>>>>>>> ad3ac3319d0871edac1fd0ab71b90d2766c3a599

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
            id :SidebarItemIdEnum.HOME,
            disabled: false,
            position: SidebarItemPositionBaseEnum.PRIMARY,
          },
          {
            route: true ? "/app/collections" : "/guest/collections",
            id:SidebarItemIdEnum.WORKSPACE,
        heading: "Workspace",
        disabled: false,
        position: SidebarItemPositionBaseEnum.PRIMARY,
          },
          {
            route: "/app/help",
            id:SidebarItemIdEnum.COMMUNITY,
            heading: "Community",
            disabled: false,
            position: SidebarItemPositionBaseEnum.SECONDARY,
          },
          {
            route: "/app/setting",
            id:SidebarItemIdEnum.SETTING,
           heading: "Setting",
           disabled: false,
           position: SidebarItemPositionBaseEnum.SECONDARY,
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
          id:SidebarItemIdEnum.HOME,
          disabled: true,
          position: SidebarItemPositionBaseEnum.PRIMARY,
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
          heading: "Workspace",
          id:SidebarItemIdEnum.WORKSPACE,
          disabled: true,
          position:SidebarItemPositionBaseEnum.PRIMARY ,
        },
        {
          route: "/app/help",
          heading: "Community",
          id: SidebarItemIdEnum.COMMUNITY,
          disabled: true,
          position: SidebarItemPositionBaseEnum.SECONDARY,
        },
        {
          route: "/app/setting",
         heading: "Setting",
         id:      SidebarItemIdEnum.SETTING,
         disabled: true,
         position: SidebarItemPositionBaseEnum.SECONDARY,
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
          id: SidebarItemIdEnum.HOME,
          disabled: false,
          position: SidebarItemPositionBaseEnum.PRIMARY,
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
          heading: "Workspace",
          id:  SidebarItemIdEnum.WORKSPACE,
          disabled: false,
          position: SidebarItemPositionBaseEnum.PRIMARY,
        },
        {
          route: "/app/help",
          heading: "Community",
          id: SidebarItemIdEnum.COMMUNITY,
          disabled: true,
          position: SidebarItemPositionBaseEnum.SECONDARY,
        },
        {
          route: "/app/setting",
          heading: "Setting",
          id: SidebarItemIdEnum.SETTING,
          disabled: true,
          position: SidebarItemPositionBaseEnum.SECONDARY,
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
          id: SidebarItemIdEnum.HOME,
          disabled: true,
          position: SidebarItemPositionBaseEnum.PRIMARY,
        },
        {
          route: true ? "/app/collections" : "/guest/collections",
          heading: "Workspace",
          id: SidebarItemIdEnum.WORKSPACE,
          disabled: true,
          position: SidebarItemPositionBaseEnum.PRIMARY,
        },
        {
          route: "/app/help",
          heading: "Community",
          id: SidebarItemIdEnum.COMMUNITY,
          disabled: false,
          position: SidebarItemPositionBaseEnum.SECONDARY,
        },
        {
          route: "/app/setting",
          heading: "Setting",
          id: SidebarItemIdEnum.SETTING,
          disabled: false,
          position: SidebarItemPositionBaseEnum.SECONDARY,
         },
      ]
  }
}

