export const getAuthUserToken = () => {
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    return authToken;
  } else {
    return null;
  }
};
