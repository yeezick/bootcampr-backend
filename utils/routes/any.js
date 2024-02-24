/**
 * Builds an object to return in the response
 * @param {!function} res Pass down the res argument of the invoking controller.
 * @param {!string} message Message to return to user.
 * @param {number} httpCode (Optional) 404, 406, etc.
 * @returns javascript object with error message.
 */
export const respondWithError = (res, message, httpCode) => {
  let jsonResponse = {
    error: message,
  };
  if (httpCode) jsonResponse = { ...jsonResponse, httpCode };
  res.status(httpCode).json(jsonResponse, httpCode);
};
