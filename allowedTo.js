module.exports = (...roles) => {
  console.log(roles);
  return (req, res, next) => {
    if (!roles.includes(req.currentUser.role)) {
      return next(res.status(401).json("this role is not authorized"));
    }
    next();
  };
};
