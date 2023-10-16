const jwtDecode = (jwt: string) => {
  return JSON.parse(window.atob(jwt.split(".")[1]));
};
export { jwtDecode };
