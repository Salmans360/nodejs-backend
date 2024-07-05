module.exports.getResponse = (
  res,
  status = 0,
  message = [{ message: 'Something went wrong' }],
  statusCode = 400,
  data = {},
  token,
) => res.status(statusCode).send({ status, message, data, token });
