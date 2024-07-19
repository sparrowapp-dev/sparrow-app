interface NameWrapper {
  name: string;
}
interface IdWrapper {
  id: string;
}
interface CheckedWrapper {
  checked: boolean;
}

export interface Data extends NameWrapper, IdWrapper, CheckedWrapper {}
