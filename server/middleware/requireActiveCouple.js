const Couple = require("../models/Couple");

exports.requireActiveCouple = async (req, res, next) => {
  const user = req.user;

  if (!user.coupleId) {
    return res.status(403).json({
      message: "Invite your partner to unlock this feature 💌"
    });
  }

  const couple = await Couple.findById(user.coupleId);

  if (!couple || !couple.isActive) {
    return res.status(403).json({
      message: "Your partner must verify to continue 💖"
    });
  }

  next();
};
