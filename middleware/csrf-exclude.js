const csrf = require("csurf");
const csrfProtection = csrf(); 

const exemptPaths = ["/auth/logout"];

function csrfMiddleware(req, res, next) {
  if (exemptPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  return csrfProtection(req, res, next);
}

module.exports = csrfMiddleware;
