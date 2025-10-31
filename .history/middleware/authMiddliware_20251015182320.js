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
}
function isAdmin(req, res, next) {
  try {
    if (req.user && req.user.role==="") {
      console.log("Welcome Admin");
      next();
    } else {
      res.redirect("/login");
      console.log("Admin not found");
    }
  } catch (err) {
    return res.redirect("/login");
  }
}

module.exports = { isLoggedIn, isAdmin };
