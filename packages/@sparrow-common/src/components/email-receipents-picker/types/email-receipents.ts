interface NameWrapper {
  name: string;
}
interface EmailWrapper {
  email: string;
}

export interface List extends NameWrapper, EmailWrapper {}
