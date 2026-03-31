export const validate = (schema, target = 'body') => (req, res, next) => {
  try {
    const parsedData = schema.parse(req[target]);
    try {
      req[target] = parsedData;
    } catch (e) {
      req.validatedData = req.validatedData || {};
      req.validatedData[target] = parsedData;
    }
    next();
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};
