const PeriodSettings = require("../models/PeriodSettings");
const PeriodCycle = require("../models/PeriodCycle");
const PeriodLog = require("../models/PeriodLog");
const PeriodSurprise = require("../models/PeriodSurprise");
const User = require("../models/User");

const DEFAULT_PHASES = [
  { key: "period", emoji: "🩸", name: "Period Days", desc: "Rest and hydration", color: "#FCA5A5", enabled: true, order: 0, isCustom: false },
  { key: "freshStart", emoji: "✨", name: "Fresh Start", desc: "Recovery and renewed energy", color: "#86EFAC", enabled: true, order: 1, isCustom: false },
  { key: "bestDays", emoji: "🌟", name: "Best Days", desc: "Energetic and confident", color: "#FDE047", enabled: true, order: 2, isCustom: false },
  { key: "calmDays", emoji: "🌿", name: "Calm Days", desc: "Balanced phase", color: "#A7F3D0", enabled: true, order: 3, isCustom: false },
  { key: "takeCare", emoji: "☁️", name: "Take Care Days", desc: "Period may be approaching; cravings or bloating possible", color: "#FDBA74", enabled: true, order: 4, isCustom: false },
];

function sanitizePhase(phase, index) {
  return {
    key: phase.key || `custom_${Date.now()}_${index}`,
    emoji: phase.emoji || "✨",
    name: phase.name || "Phase",
    desc: phase.desc || "",
    color: phase.color || "#FCA5A5",
    enabled: phase.enabled !== false,
    order: Number(phase.order) || index,
    isCustom: phase.isCustom !== false,
  };
}

function buildPhaseSchedule(phases = [], cycleLength = 28, periodLength = 5) {
  const activePhases = Array.isArray(phases) && phases.length > 0 ? phases : DEFAULT_PHASES;
  const sortedPhases = [...activePhases]
    .filter((phase) => phase.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const periodPhase = sortedPhases.find((phase) => phase.key === "period");
  const nonPeriodPhases = sortedPhases.filter((phase) => phase.key !== "period");
  const effectivePeriodLength = periodPhase ? Math.min(periodLength, cycleLength) : 0;
  const remainingDays = Math.max(0, cycleLength - effectivePeriodLength);

  const weights = nonPeriodPhases.map((phase) => {
    switch (phase.key) {
      case "freshStart":
        return 5;
      case "bestDays":
        return 6;
      case "calmDays":
        return 7;
      case "takeCare":
        return 5;
      default:
        return 1;
    }
  });

  const totalWeight = weights.reduce((sum, item) => sum + item, 0) || 1;
  let durations = weights.map((weight) => Math.max(0, Math.round((weight / totalWeight) * remainingDays)));

  let totalDuration = durations.reduce((sum, item) => sum + item, 0);
  let delta = remainingDays - totalDuration;
  for (let idx = nonPeriodPhases.length - 1; idx >= 0 && delta !== 0; idx -= 1) {
    durations[idx] += delta > 0 ? 1 : -1;
    if (durations[idx] < 0) {
      delta += -durations[idx];
      durations[idx] = 0;
    } else {
      delta += delta > 0 ? -1 : 1;
    }
  }

  const scheduled = [];
  let cursor = 1;
  if (periodPhase) {
    scheduled.push({
      ...periodPhase,
      startDay: cursor,
      endDay: cursor + effectivePeriodLength - 1,
    });
    cursor += effectivePeriodLength;
  }

  nonPeriodPhases.forEach((phase, index) => {
    const phaseLength = Math.max(0, durations[index] || 0);
    if (phaseLength <= 0) return;
    scheduled.push({
      ...phase,
      startDay: cursor,
      endDay: cursor + phaseLength - 1,
    });
    cursor += phaseLength;
  });

  if (cursor <= cycleLength) {
    const lastPhase = scheduled[scheduled.length - 1];
    if (lastPhase) {
      lastPhase.endDay = cycleLength;
    }
  }

  return scheduled;
}

/**
 * Phase Helper Function:
 * Given a cycle start date, target date, cycleLength, and periodLength,
 * returns phase key & details based on saved/default phases.
 */
function calculateDayPhase(targetDate, cycleStartDate, cycleLength = 28, periodLength = 5, phases = null) {
  const t = new Date(targetDate);
  t.setHours(0, 0, 0, 0);

  const start = new Date(cycleStartDate);
  start.setHours(0, 0, 0, 0);

  const diffTime = t.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let cyclePos = diffDays % cycleLength;
  if (cyclePos < 0) cyclePos += cycleLength;
  const dayInCycle = cyclePos + 1; // 1-indexed

  const phaseSchedule = buildPhaseSchedule(phases, cycleLength, periodLength);
  const matchedPhase = phaseSchedule.find((p) => dayInCycle >= p.startDay && dayInCycle <= p.endDay);

  if (matchedPhase) {
    return {
      phaseKey: matchedPhase.key,
      dayInCycle,
      name: matchedPhase.name,
      description: matchedPhase.desc,
      color: matchedPhase.color,
      emoji: matchedPhase.emoji,
      isCustom: matchedPhase.isCustom,
      startDay: matchedPhase.startDay,
      endDay: matchedPhase.endDay,
    };
  }

  if (dayInCycle <= periodLength) {
    return { phaseKey: "period", dayInCycle, name: "Period Days", description: "Rest and hydration", color: "#FCA5A5" };
  }
  return { phaseKey: "calmDays", dayInCycle, name: "Calm Days", description: "Balanced phase", color: "#A7F3D0" };
}

// 1. Get Period Settings & User Role/Gender
exports.getSettings = async (req, res) => {
  try {
    const coupleId = req.user.coupleId;
    if (!coupleId) {
      return res.status(400).json({ success: false, message: "Couple relationship not found." });
    }

    let settings = await PeriodSettings.findOne({ coupleId });
    if (settings && (!settings.phases || settings.phases.length === 0)) {
      settings.phases = DEFAULT_PHASES;
      await settings.save();
    }
    
    // Update user gender if provided in query or user object
    const userGender = req.user.gender || null;

    res.status(200).json({
      success: true,
      settings: settings || null,
      userGender,
      userRole: req.user.role,
      userId: req.user._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Save / Setup Period Settings (Both Male and Female partners permitted)
exports.saveSettings = async (req, res) => {
  try {
    const coupleId = req.user.coupleId;
    if (!coupleId) {
      return res.status(400).json({ success: false, message: "Couple relationship not found." });
    }

    const { lastPeriodStart, cycleLength, periodLength, customColors, gender, phases } = req.body;

    if (gender && ["female", "male", "other"].includes(gender)) {
      await User.findByIdAndUpdate(req.user._id, { gender });
      req.user.gender = gender;
    }

    let settings = await PeriodSettings.findOne({ coupleId });

    const updatedData = {
      coupleId,
      lastPeriodStart: lastPeriodStart ? new Date(lastPeriodStart) : settings?.lastPeriodStart || new Date(),
      cycleLength: Number(cycleLength) || settings?.cycleLength || 28,
      periodLength: Number(periodLength) || settings?.periodLength || 5,
    };

    if (Array.isArray(phases) && phases.length > 0) {
      updatedData.phases = phases.map((phase, index) => sanitizePhase(phase, index));
    } else if (!settings?.phases || settings.phases.length === 0) {
      updatedData.phases = DEFAULT_PHASES;
    }

    if (customColors) {
      updatedData.customColors = { ...settings?.customColors, ...customColors };
    }

    if (gender === "female") {
      updatedData.femalePartnerId = req.user._id;
    } else if (gender === "male") {
      updatedData.malePartnerId = req.user._id;
    }

    if (!settings) {
      settings = await PeriodSettings.create(updatedData);
    } else {
      settings = await PeriodSettings.findOneAndUpdate({ coupleId }, updatedData, { new: true });
    }

    // Ensure a PeriodCycle entry exists for initial start date
    if (updatedData.lastPeriodStart) {
      const existingCycle = await PeriodCycle.findOne({
        coupleId,
        startDate: updatedData.lastPeriodStart,
      });

      if (!existingCycle) {
        await PeriodCycle.create({
          coupleId,
          startDate: updatedData.lastPeriodStart,
          isConfirmed: true,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      settings,
      userGender: req.user.gender,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Calendar Data for Month / Year
exports.getCalendarData = async (req, res) => {
  try {
    const coupleId = req.user.coupleId;
    if (!coupleId) {
      return res.status(400).json({ success: false, message: "Couple relationship not found." });
    }

    const settings = await PeriodSettings.findOne({ coupleId });
    if (!settings) {
      return res.status(200).json({
        success: true,
        isConfigured: false,
        settings: null,
      });
    }

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1; // 1-indexed

    // Calculate latest confirmed cycle start date or base date
    const cycles = await PeriodCycle.find({ coupleId, isConfirmed: true }).sort({ startDate: -1 });
    const baseStartDate = cycles.length > 0 ? cycles[0].startDate : settings.lastPeriodStart;

    // Fetch daily logs for the month
    const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
    const logs = await PeriodLog.find({
      coupleId,
      date: { $regex: `^${monthPrefix}` },
    });

    // Fetch surprises
    const surpriseQuery = { coupleId };
    if (req.user.gender === "female") {
      surpriseQuery.isRevealed = true; // Female sees only revealed
    }
    const surprises = await PeriodSurprise.find(surpriseQuery).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      isConfigured: true,
      settings,
      baseStartDate,
      cycles,
      logs,
      surprises,
      userGender: req.user.gender,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Confirm "Today is My Period"
exports.confirmTodayPeriod = async (req, res) => {
  try {
    const coupleId = req.user.coupleId;
    if (!coupleId) {
      return res.status(400).json({ success: false, message: "Couple relationship not found." });
    }

    // Girlfriend/Female permissions check
    if (req.user.gender === "male") {
      return res.status(403).json({
        success: false,
        message: "Only the female partner can confirm menstrual cycle dates.",
      });
    }

    const { date, notes } = req.body;
    const confirmDate = date ? new Date(date) : new Date();
    confirmDate.setHours(0, 0, 0, 0);

    // Save cycle record
    let cycle = await PeriodCycle.findOne({ coupleId, startDate: confirmDate });
    if (!cycle) {
      cycle = await PeriodCycle.create({
        coupleId,
        startDate: confirmDate,
        isConfirmed: true,
        notes: notes || "Confirmed period start",
      });
    } else {
      cycle.isConfirmed = true;
      if (notes) cycle.notes = notes;
      await cycle.save();
    }

    // Update settings lastPeriodStart
    await PeriodSettings.findOneAndUpdate(
      { coupleId },
      { lastPeriodStart: confirmDate },
      { new: true }
    );

    // REVEAL HIDDEN SURPRISES!
    const unrevealedSurprises = await PeriodSurprise.find({ coupleId, isRevealed: false });
    if (unrevealedSurprises.length > 0) {
      await PeriodSurprise.updateMany(
        { coupleId, isRevealed: false },
        { isRevealed: true, revealedAt: new Date() }
      );
    }

    res.status(200).json({
      success: true,
      message: "Period confirmed! Predictions updated and surprises revealed! 💖",
      cycle,
      revealedSurprisesCount: unrevealedSurprises.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Save Daily Log (Moods & Symptoms)
exports.saveDailyLog = async (req, res) => {
  try {
    const coupleId = req.user.coupleId;
    if (!coupleId) {
      return res.status(400).json({ success: false, message: "Couple relationship not found." });
    }

    const { date, moods, symptoms, notes } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required (YYYY-MM-DD)." });
    }

    let log = await PeriodLog.findOne({ coupleId, date });
    if (!log) {
      log = await PeriodLog.create({
        coupleId,
        date,
        moods: moods || [],
        symptoms: symptoms || [],
        notes: notes || "",
        loggedBy: req.user._id,
      });
    } else {
      log.moods = moods || log.moods;
      log.symptoms = symptoms || log.symptoms;
      log.notes = notes !== undefined ? notes : log.notes;
      log.loggedBy = req.user._id;
      await log.save();
    }

    res.status(200).json({
      success: true,
      message: "Daily log saved",
      log,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get Surprises
exports.getSurprises = async (req, res) => {
  try {
    const coupleId = req.user.coupleId;
    if (!coupleId) {
      return res.status(400).json({ success: false, message: "Couple relationship not found." });
    }

    const isFemale = req.user.gender === "female";
    const filter = { coupleId };

    // Girlfriend only sees revealed surprises
    if (isFemale) {
      filter.isRevealed = true;
    }

    const surprises = await PeriodSurprise.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      surprises,
      isFemale,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Create Male-Only Surprise Planner
exports.createSurprise = async (req, res) => {
  try {
    const coupleId = req.user.coupleId;
    if (!coupleId) {
      return res.status(400).json({ success: false, message: "Couple relationship not found." });
    }

    if (req.user.gender === "female") {
      return res.status(403).json({
        success: false,
        message: "Only the male partner can create hidden surprises.",
      });
    }

    const { title, type, content } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required." });
    }

    const surprise = await PeriodSurprise.create({
      coupleId,
      createdBy: req.user._id,
      title,
      type: type || "gift",
      content: content || "",
      isRevealed: false,
    });

    res.status(201).json({
      success: true,
      message: "Secret surprise created! It will remain hidden until your partner confirms her period. 🎁",
      surprise,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Delete Surprise (Male only before revealed)
exports.deleteSurprise = async (req, res) => {
  try {
    const { id } = req.params;
    const surprise = await PeriodSurprise.findById(id);

    if (!surprise) {
      return res.status(404).json({ success: false, message: "Surprise not found." });
    }

    if (surprise.coupleId.toString() !== req.user.coupleId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    await PeriodSurprise.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Surprise deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Statistics Endpoint
exports.getStatistics = async (req, res) => {
  try {
    const coupleId = req.user.coupleId;
    if (!coupleId) {
      return res.status(400).json({ success: false, message: "Couple relationship not found." });
    }

    const settings = await PeriodSettings.findOne({ coupleId });
    const cycles = await PeriodCycle.find({ coupleId, isConfirmed: true }).sort({ startDate: 1 });

    const totalCycles = cycles.length;
    let cycleLengths = [];
    
    for (let i = 1; i < cycles.length; i++) {
      const diffTime = Math.abs(cycles[i].startDate - cycles[i - 1].startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 20 && diffDays <= 45) {
        cycleLengths.push(diffDays);
      }
    }

    const avgCycleLength = cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : settings?.cycleLength || 28;

    const minCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : settings?.cycleLength || 28;
    const maxCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : settings?.cycleLength || 28;

    const predictionDiffs = [];
    const earlyStarts = [];
    for (let i = 1; i < cycles.length; i++) {
      const predicted = new Date(cycles[i - 1].startDate);
      predicted.setDate(predicted.getDate() + (settings?.cycleLength || 28));
      predicted.setHours(0, 0, 0, 0);

      const actual = new Date(cycles[i].startDate);
      actual.setHours(0, 0, 0, 0);

      const diff = Math.round((actual.getTime() - predicted.getTime()) / (1000 * 60 * 60 * 24));
      predictionDiffs.push(Math.abs(diff));
      if (diff < 0) {
        earlyStarts.push(Math.abs(diff));
      }
    }

    const avgAbsDelay = predictionDiffs.length > 0 ? Math.round(predictionDiffs.reduce((a, b) => a + b, 0) / predictionDiffs.length) : 0;
    const predictionAccuracy = Math.max(0, 100 - avgAbsDelay * 10);
    const regularity = Math.max(0, 100 - ((maxCycle - minCycle) / avgCycleLength) * 100);
    const averageEarlyStart = earlyStarts.length > 0 ? Math.round(earlyStarts.reduce((a, b) => a + b, 0) / earlyStarts.length) : 0;

    // Current cycle day count
    const lastStart = settings?.lastPeriodStart || (cycles.length > 0 ? cycles[cycles.length - 1].startDate : new Date());
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(lastStart);
    start.setHours(0, 0, 0, 0);
    const diffDaysCurrent = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    res.status(200).json({
      success: true,
      stats: {
        avgCycleLength,
        avgPeriodLength: settings?.periodLength || 5,
        shortestCycle: minCycle,
        longestCycle: maxCycle,
        currentCycleDay: Math.max(1, diffDaysCurrent),
        totalCyclesTracked: totalCycles,
        predictionAccuracy,
        regularity: Math.round(regularity),
        averageDelay: avgAbsDelay,
        averageEarlyStart,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
