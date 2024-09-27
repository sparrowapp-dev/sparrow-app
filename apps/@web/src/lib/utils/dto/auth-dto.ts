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

export interface verifyPostbody {
  email: string;
  verificationCode: string;
}

export interface resetPasswordPostBody {
  email: string;
  newPassword: string;
  verificationCode: string;
}

export interface RegisterUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}
//i will create different interface here
