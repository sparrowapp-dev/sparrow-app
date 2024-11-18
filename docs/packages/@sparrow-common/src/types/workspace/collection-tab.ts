export interface IdWrapper2 {
  id: string;
}
export interface Collection extends IdWrapper2 {}
export interface CollectionWrapper {
  collection: Collection;
}

export interface Property extends CollectionWrapper {}

export interface PropertyWrapper {
  property: Property;
}
