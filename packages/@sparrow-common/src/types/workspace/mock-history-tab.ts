export interface IdWrapper2 {}
export interface MockHistory extends IdWrapper2 {}

export interface MockHistoryWrapper {
  mockHistory: MockHistory;
}

export interface Property extends MockHistoryWrapper {}

export interface PropertyWrapper {
  property: Property;
}
