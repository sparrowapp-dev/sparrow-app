export interface SearchSuggestion {
  type:
    | "workspace"
    | "collection"
    | "environment"
    | "folder"
    | "flow"
    | "request";
  label: string;
  icon: string;
}

export interface RecentItem {
  title: string;
  workspace: string;
  collection: string;
  url: string;
  icon?: string;
  method?: string;
}
export interface SearchItemData {
  name: string;
  path?: string;
  url?: string;
  type:
    | "workspace"
    | "folder"
    | "collection"
    | "request"
    | "environment"
    | "flow";
  originalData: any;
}

export interface SearchConfig {
  
  icon: any;
  getItemData: (item: any) => SearchItemData;
  handleNavigation: (data: any) => void;
}