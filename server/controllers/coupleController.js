const Couple = require("../models/Couple");
const User = require("../models/User");

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

const allowedFields = [
  "coupleName",
  "aboutUs",
  "startDate",
  "anniversaryDate",
  "photoUrl",
];

exports.createCouple = async (req, res, next) => {
  try {
    const {
      coupleName,
      aboutUs,
      startDate,
      anniversaryDate,
      photoUrl,
    } = req.body;

    if (!coupleName) {
      return sendError(res, 400, "Couple name is required.");
    }

    let couple = null;
    if (req.user?.coupleId) {
      couple = await Couple.findById(req.user.coupleId);
    }

    if (couple) {
      couple.coupleName = coupleName;
      couple.aboutUs = aboutUs || couple.aboutUs;
      couple.startDate = startDate || couple.startDate;
      couple.anniversaryDate = anniversaryDate || couple.anniversaryDate;
      couple.photoUrl = photoUrl || couple.photoUrl;
      await couple.save();

      return res.json({
        success: true,
        message: "Couple profile updated successfully.",
        data: couple,
      });
    }

    couple = await Couple.create({
      coupleName,
      aboutUs: aboutUs || "",
      startDate: startDate || null,
      anniversaryDate: anniversaryDate || null,
      photoUrl: photoUrl || null,
      partnerA: req.user._id,
    });

    req.user.coupleId = couple._id;
    await req.user.save();

    return res.status(201).json({
      success: true,
      message: "Couple profile created successfully.",
      data: couple,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCouple = async (req, res, next) => {
  try {
    if (!req.user?.coupleId) {
      return sendError(res, 404, "Couple profile not found.");
    }

    const couple = await Couple.findById(req.user.coupleId)
      .populate("partnerA", "name email role coupleId isVerified")
      .populate("partnerB", "name email role coupleId isVerified");

    if (!couple) {
      return sendError(res, 404, "Couple profile not found.");
    }

    return res.json({ success: true, message: "Couple profile loaded.", data: couple });
  } catch (err) {
    next(err);
  }
};

exports.updateCouple = async (req, res, next) => {
  try {
    if (!req.user?.coupleId) {
      return sendError(res, 404, "Couple profile not found.");
    }

    const couple = await Couple.findById(req.user.coupleId);
    if (!couple) {
      return sendError(res, 404, "Couple profile not found.");
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        couple[field] = req.body[field];
      }
    });

    await couple.save();
    return res.json({ success: true, message: "Couple profile updated.", data: couple });
  } catch (err) {
    next(err);
  }
};

exports.patchCouple = async (req, res, next) => {
  try {
    const { field, value } = req.body;

    if (!field || !allowedFields.includes(field)) {
      return sendError(res, 400, "Invalid field for update.");
    }

    if (!req.user?.coupleId) {
      return sendError(res, 404, "Couple profile not found.");
    }

    const couple = await Couple.findById(req.user.coupleId);
    if (!couple) {
      return sendError(res, 404, "Couple profile not found.");
    }

    couple[field] = value;
    await couple.save();

    return res.json({ success: true, message: "Couple field updated.", data: couple });
  } catch (err) {
    next(err);
  }
};

exports.updatePhoto = async (req, res, next) => {
  try {
    const photoUrl = req.body.photoUrl || req.body.photo;

    if (!photoUrl) {
      return sendError(res, 400, "photoUrl is required.");
    }

    if (!req.user?.coupleId) {
      return sendError(res, 404, "Couple profile not found.");
    }

    const couple = await Couple.findById(req.user.coupleId);
    if (!couple) {
      return sendError(res, 404, "Couple profile not found.");
    }

    couple.photoUrl = photoUrl;
    await couple.save();

    return res.json({ success: true, message: "Couple photo updated.", data: couple });
  } catch (err) {
    next(err);
  }
};

exports.deleteCouple = async (req, res, next) => {
  try {
    if (!req.user?.coupleId) {
      return sendError(res, 404, "Couple profile not found.");
    }

    const couple = await Couple.findById(req.user.coupleId);
    if (!couple) {
      return sendError(res, 404, "Couple profile not found.");
    }

    const partnerIds = [couple.partnerA, couple.partnerB].filter(Boolean);
    await User.updateMany({ _id: { $in: partnerIds } }, { $unset: { coupleId: "" } });

    await couple.remove();

    return res.json({ success: true, message: "Couple profile deleted." });
  } catch (err) {
    next(err);
  }
};

exports.getPartners = async (req, res, next) => {
  try {
    if (!req.user?.coupleId) return sendError(res, 404, 'Couple profile not found.');
    const couple = await Couple.findById(req.user.coupleId).populate('partnerA','name').populate('partnerB','name');
    if (!couple) return sendError(res, 404, 'Couple profile not found.');

    const partnerOne = couple.partnerA ? (couple.partnerA.name || '') : '';
    const partnerTwo = couple.partnerB ? (couple.partnerB.name || '') : '';

    return res.json({ success: true, data: { partnerOne, partnerTwo } });
  } catch (err) { next(err); }
};
