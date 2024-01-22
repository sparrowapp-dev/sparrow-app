//------- Team Interface ------------//
export interface TeamPostBody {
  name: string;
  description: string;
  owner: string;
  image?: File;
  createdAt: string;
  createdBy: string;
}
