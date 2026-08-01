const mongoose = require('mongoose');
const Mood = require('../models/Mood');
const User = require('../models/User');

const normalizeDateKey = (dateValue) => {
    if (!dateValue) return null;
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
};

const buildMoodProjection = '-__v';

const getOwnerAndPartner = async (coupleId, currentUserId) => {
    const coupleUsers = await User.find({ coupleId }).select('_id name role').lean();
    const owners = coupleUsers.reduce(
        (acc, user) => {
            if (user._id.toString() === currentUserId.toString()) acc.owner = user;
            else acc.partner = user;
            return acc;
        },
        { owner: null, partner: null }
    );
    return owners;
};

const enrichMoodItem = (mood) => ({
    id: mood._id.toString(),
    userId: mood.userId.toString(),
    coupleId: mood.coupleId.toString(),
    date: mood.date.toISOString().slice(0, 10),
    mood: mood.mood,
    emoji: mood.emoji,
    description: mood.description || '',
    createdAt: mood.createdAt,
    updatedAt: mood.updatedAt,
});

const mapMoodWithUserName = (mood, usersById) => ({
    id: mood._id.toString(),
    userId: mood.userId.toString(),
    name: usersById[mood.userId.toString()] || null,
    date: mood.date.toISOString().slice(0, 10),
    mood: mood.mood,
    emoji: mood.emoji,
    description: mood.description || '',
});

exports.createMood = async ({ coupleId, userId, date, mood, emoji, description }) => {
    const normalizedDate = normalizeDateKey(date) || normalizeDateKey(new Date());
    const existing = await Mood.findOne({ coupleId, userId, date: normalizedDate }).lean();
    if (existing) {
        const err = new Error('Mood already exists for this date.');
        err.statusCode = 409;
        throw err;
    }

    const payload = {
        coupleId,
        userId,
        date: normalizedDate,
        mood,
        emoji,
        description: description ? String(description).trim() : '',
    };

    const createdMood = await Mood.create(payload);
    return enrichMoodItem(createdMood.toObject());
};

exports.getCalendar = async ({ coupleId, userId, view, month, year }) => {
    const filter = { coupleId };
    if (view === 'my') {
        filter.userId = userId;
    } else if (view === 'partner') {
        filter.userId = { $ne: userId };
    }

    if (month && year) {
        const parsedMonth = Number(month);
        const parsedYear = Number(year);
        if (!Number.isInteger(parsedMonth) || !Number.isInteger(parsedYear)) {
            const err = new Error('Invalid month or year filter');
            err.statusCode = 400;
            throw err;
        }
        const startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1));
        const endDate = new Date(Date.UTC(parsedYear, parsedMonth, 1));
        filter.date = { $gte: startDate, $lt: endDate };
    }

    const moods = await Mood.find(filter).select(buildMoodProjection).sort({ date: 1 }).lean();
    const userIds = [...new Set(moods.map((m) => m.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select('name').lean();
    const usersById = users.reduce((acc, user) => {
        acc[user._id.toString()] = user.name;
        return acc;
    }, {});

    return moods.map((mood) => mapMoodWithUserName(mood, usersById));
};

exports.getDateDetails = async ({ coupleId, date, userId }) => {
    const normalizedDate = normalizeDateKey(date);
    if (!normalizedDate) {
        const err = new Error('Invalid date format');
        err.statusCode = 400;
        throw err;
    }

    const moods = await Mood.find({ coupleId, date: normalizedDate }).select(buildMoodProjection).lean();
    const myMood = moods.find((entry) => entry.userId.toString() === userId.toString()) || null;
    const partnerMood = moods.find((entry) => entry.userId.toString() !== userId.toString()) || null;
    return {
        myMood: myMood ? enrichMoodItem(myMood) : null,
        partnerMood: partnerMood ? enrichMoodItem(partnerMood) : null,
    };
};

exports.updateMood = async ({ id, coupleId, userId, mood, emoji, description }) => {
    const existing = await Mood.findOne({ _id: id, coupleId });
    if (!existing) {
        const err = new Error('Mood not found');
        err.statusCode = 404;
        throw err;
    }
    if (existing.userId.toString() !== userId.toString()) {
        const err = new Error('Forbidden');
        err.statusCode = 403;
        throw err;
    }

    if (mood) existing.mood = mood;
    if (emoji) existing.emoji = emoji;
    if (description !== undefined) existing.description = String(description).trim();
    await existing.save();
    return enrichMoodItem(existing.toObject());
};

exports.deleteMood = async ({ id, coupleId, userId }) => {
    const mood = await Mood.findOne({ _id: id, coupleId });
    if (!mood) {
        const err = new Error('Mood not found');
        err.statusCode = 404;
        throw err;
    }
    if (mood.userId.toString() !== userId.toString()) {
        const err = new Error('Forbidden');
        err.statusCode = 403;
        throw err;
    }
    await mood.deleteOne();
    return { id: mood._id.toString() };
};

exports.getMonthlyStats = async ({ coupleId, month, year, userId }) => {
    const now = new Date();
    const parsedMonth = Number(month || (now.getUTCMonth() + 1));
    const parsedYear = Number(year || now.getUTCFullYear());
    if (!Number.isInteger(parsedMonth) || !Number.isInteger(parsedYear)) {
        const err = new Error('Invalid month or year');
        err.statusCode = 400;
        throw err;
    }

    const startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1));
    const endDate = new Date(Date.UTC(parsedYear, parsedMonth, 1));

    const pipeline = [
        { $match: { coupleId, date: { $gte: startDate, $lt: endDate } } },
        {
            $group: {
                _id: '$mood',
                count: { $sum: 1 },
            },
        },
    ];

    const counts = await Mood.aggregate(pipeline).exec();
    const countMap = counts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, {});

    const totalLogs = Object.values(countMap).reduce((sum, value) => sum + value, 0);
    const happyDays = countMap.happy || 0;
    const sadDays = countMap.sad || 0;
    const angryDays = countMap.angry || 0;
    const romanticDays = countMap.romantic || 0;
    const cryingDays = countMap.crying || 0;
    const neutralDays = countMap.neutral || 0;

    const moodScore = totalLogs
        ? Math.round(
            ((happyDays + romanticDays + (countMap.loved || 0) + (countMap.calm || 0)) / totalLogs) * 100
        )
        : 0;

    const streak = await exports.calculateStreak({ coupleId, userId, startDate, endDate });

    return {
        happyDays,
        sadDays,
        angryDays,
        romanticDays,
        cryingDays,
        neutralDays,
        averageMood: moodScore,
        entries: totalLogs,
        streak,
        mostCommonMood: Object.keys(countMap).sort((a, b) => countMap[b] - countMap[a])[0] || null,
    };
};

exports.getSummary = async ({ coupleId, month, year }) => {
    const stats = await exports.getMonthlyStats({ coupleId, month, year });
    const positive = (stats.happyDays + stats.romanticDays + (stats.mostCommonMood === 'loved' ? 1 : 0) + (stats.mostCommonMood === 'calm' ? 1 : 0));
    const total = stats.entries;

    let summary = 'No mood activity has been logged yet.';

    if (total === 0) {
        summary = 'No mood logs yet. Encourage your partner to share how they feel today.';
    } else if (stats.happyDays / total >= 0.7) {
        summary = "You've both shared many happy moments this month ❤️";
    } else if (stats.sadDays > stats.happyDays) {
        summary = 'Sad entries are higher than happy ones. Try spending quality time together this week.';
    } else if (stats.angryDays >= 2) {
        summary = 'There are signs of tension. Communication needs a little more attention.';
    } else if (stats.mostCommonMood === 'happy' && stats.streak >= 3) {
        summary = 'You both seem emotionally connected and enjoying a strong mood streak.';
    } else {
        summary = 'Mood is varied. Keep checking in daily and keep the conversation open.';
    }

    return { summary };
};

exports.getTrend = async ({ coupleId, month, year, userId }) => {
    const now = new Date();
    const parsedMonth = Number(month || (now.getUTCMonth() + 1));
    const parsedYear = Number(year || now.getUTCFullYear());
    const startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1));
    const endDate = new Date(Date.UTC(parsedYear, parsedMonth, 1));

    const moods = await Mood.find({ coupleId, date: { $gte: startDate, $lt: endDate } })
        .select('userId date mood')
        .sort({ date: 1 })
        .lean();

    const grouped = moods.reduce((acc, entry) => {
        const key = entry.date.toISOString().slice(0, 10);
        if (!acc[key]) acc[key] = {};
        if (entry.userId.toString() === userId.toString()) acc[key].myMood = entry.mood;
        else acc[key].partnerMood = entry.mood;
        return acc;
    }, {});

    return Object.entries(grouped).map(([date, values]) => ({ date, myMood: values.myMood || null, partnerMood: values.partnerMood || null }));
};

exports.getDistribution = async ({ coupleId, userId }) => {
    const moods = await Mood.find({ coupleId }).select('mood').lean();
    const distribution = moods.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
    }, {});
    return distribution;
};

exports.getComparison = async ({ coupleId, userId }) => {
    const moods = await Mood.find({ coupleId }).select('mood userId').lean();
    const summary = {
        me: { happy: 0, sad: 0, angry: 0, score: 0 },
        partner: { happy: 0, sad: 0, angry: 0, score: 0 },
    };

    moods.forEach((entry) => {
        const side = entry.userId.toString() === userId.toString() ? 'me' : 'partner';
        if (entry.mood === 'happy') summary[side].happy += 1;
        if (entry.mood === 'sad') summary[side].sad += 1;
        if (entry.mood === 'angry') summary[side].angry += 1;
    });

    const scoreFor = (counts) => {
        const total = counts.happy + counts.sad + counts.angry;
        if (total === 0) return 0;
        return Math.round(((counts.happy + 1) / (total + 3)) * 100);
    };

    summary.me.score = scoreFor(summary.me);
    summary.partner.score = scoreFor(summary.partner);
    return summary;
};

exports.calculateStreak = async ({ coupleId, userId, startDate, endDate }) => {
    const filter = { coupleId, userId, date: { $gte: startDate, $lt: endDate } };
    const entries = await Mood.find(filter).select('date').sort({ date: -1 }).lean();
    if (!entries.length) return 0;

    let streak = 0;
    let current = new Date(entries[0].date);
    current.setUTCHours(0, 0, 0, 0);

    const entryDates = new Set(entries.map((entry) => entry.date.toISOString().slice(0, 10)));

    while (entryDates.has(current.toISOString().slice(0, 10))) {
        streak += 1;
        current.setUTCDate(current.getUTCDate() - 1);
    }

    return streak;
};

exports.getRecentActivity = async ({ coupleId, limit = 7 }) => {
    const recent = await Mood.find({ coupleId })
        .select('userId date mood emoji description')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    return recent.map((entry) => enrichMoodItem(entry));
};
