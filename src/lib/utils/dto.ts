//------- register Interface ------------//
export interface registerUserPostBody {
  email: string;
  username: string;
  name: string;
  password: string;
}

//------- login Interface ------------//
export interface loginUserPostBody {
  email: string;
  password: string;
}
