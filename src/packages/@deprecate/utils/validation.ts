import * as yup from "yup";

//----------------------------- Check Validation ---------------------//
export const checkValidation = async (validationSchema, val) => {
  let validationErrors = {};
  try {
    await validationSchema.validate(val, { abortEarly: false });
    return { isError: false, errorObject: {} };
  } catch (err) {
    validationErrors = err.inner.reduce((acc, err) => {
      return { ...acc, [err.path]: err.message };
    }, {});

    return { isError: true, errorObject: validationErrors };
  }
};

//------------------------------ registration schema ------------------------------//
export const registrationSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required("Please enter an email")
    .matches(
      /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})$/,
      "Must be a valid email address",
    ),
  name: yup.string().required("Please enter your full name"),
  password: yup
    .string()
    .required()
    .min(8, "Password must be at least 8 characters")
    .matches(/(?=.*[0-9])/, "Password must contain a number")
    .matches(/(?=.*[!@#$%^&*])/, "Password must contain a special character"),
  tnsCheckbox: yup
    .boolean()
    .required("Please accept the terms and conditions")
    .oneOf([true], "Please accept the terms and conditions"),
});

//------------------- login Schema ---------------------------//
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required("Please enter an email")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email ID.",
    ),
  password: yup.string().required("Please enter a password"),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required("Please enter an email")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email ID.",
    ),
});

export const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required()
    .min(8, "Password must be at least 8 characters")
    .matches(/(?=.*[0-9])/, "Password must contain a number")
    .matches(/(?=.*[!@#$%^&*])/, "Password must contain a special character"),
});

export const updatePasswordSchema = yup.object().shape({});
