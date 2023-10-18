//------- register Interface ------------//
export interface registerUserPostBody {
  email: string;
  name: string;
  password: string;
}

//------- login Interface ------------//
export interface loginUserPostBody {
  email: string;
  password: string;
}

export interface EmailPostBody {
  email: string;
}
//i will create different interface here
