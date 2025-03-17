const verifyAdmin = (req, res, next) => {
    try {
      if (req.role !== "admin") {
        return res.status(403).send({
          success: false,
          message: "You are not authorized to perform this action",
        });
      }
      next();
    } catch (error) {
      console.error("Error in verifyAdmin middleware:", error);
      res.status(500).send({ success: false, message: "Authorization failed" });
    }
  };
  
  module.exports = verifyAdmin;
  