export enum SidebarItemPositionBaseEnum {
    PRIMARY = "primary",
    SECONDARY = "secondary",
  }
export enum SidebarItemIdEnum {
  HOME = "Home",
  WORKSPACE = "Workspace",
  COMMUNITY = "Community",
  SETTING = "Setting",
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
  
  export interface SidebarItemBaseAllIconInterface extends SidebarItemBaseInterface {
    defaultLogo: string;
    hoveredLogo?: string;
    selectedLogo?: string;
  }
  