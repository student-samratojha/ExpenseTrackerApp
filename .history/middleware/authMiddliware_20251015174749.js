const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }

  try {
    const userData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = userData;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}function isAdmin(req, res, next) {
 
  if (req.user && req.user.) {
    return res.redirect("/login");
  }

  try {
    const userData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = userData;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}




module.exports = { isLoggedIn };
