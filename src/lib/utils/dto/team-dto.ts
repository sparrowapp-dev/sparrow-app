//------- Team Interface ------------//
export interface TeamPostBody {
  name: string;
  description: string;
  owner: string;
  logo?: File;
  createdAt: string;
  createdBy: string;
}
