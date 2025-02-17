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
  show: boolean;
}

export interface RecentItem {
  title: string;
  workspace: string;
  collection: string;
  url: string;
  icon?: string;
  method?: string;
}
