export enum SidebarItemPositionBaseEnum {
    PRIMARY = "primary",
    SECONDARY = "secondary",
  }
  
  export enum SidebarItemImgEnum {
    HOME = "Home",
    WORKSPACE = "Workspace",
    COMMUNITY = "Community",
    SETTING = "Setting",
  }
  
  export interface SidebarItemBaseInterface {
    id: string;
    route: string;
    heading: string;
    disabled: boolean;
    position: SidebarItemPositionBaseEnum;
  }
  
  export interface SidebarItemBaseAllIconInterface {
    id: string;
    route: string;
    heading: string;
    defaultLogo: string;
    hoveredLogo?: string;
    selectedLogo?: string;
    disabled: boolean;
    position: SidebarItemPositionBaseEnum;
  }
  