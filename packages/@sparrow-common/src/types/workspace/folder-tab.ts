export interface IdWrapper2 {
  id: string;
}
export interface Folder extends IdWrapper2 {}

export interface FolderWrapper {
  folder: Folder;
}

export interface Property extends FolderWrapper {}

export interface PropertyWrapper {
  property: Property;
}