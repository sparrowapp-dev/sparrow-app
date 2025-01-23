export enum SidebarItemPositionBaseEnum {
    PRIMARY= "primary",
    SECONDARY="secondary",
}
export interface SidebarItemBaseInfterface  {
    id: string;
    route: string;
    heading: string;
    defaultLogo: string;
    hoveredLogo?: string;
    selectedLogo?: string;
    disabled: boolean;
    position: SidebarItemPositionBaseEnum;
  };