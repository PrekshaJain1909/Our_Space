const mongoose = require('mongoose');

const MOOD_ENUM = [
    'happy',
    'romantic',
    'loved',
    'neutral',
    'calm',
    'tired',
    'sad',
    'crying',
    'angry',
    'upset'
];

const MOOD_EMOJI_MAP = {
    happy: '😊',
    romantic: '❤️',
    loved: '😍',
    neutral: '😐',
    calm: '😌',
    tired: '😴',
    sad: '😢',
    crying: '😭',
    angry: '😡',
    upset: '💔'
};

function normalizeDateValue(value) {
    if (!value) {
        throw new mongoose.Error.ValidationError(null);
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        const error = new mongoose.Error.ValidationError(null);
        error.message = 'Invalid date format.';
        throw error;
    }

    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

const moodSchema = new mongoose.Schema(
    {
        coupleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Couple',
            required: [true, 'coupleId is required'],
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'userId is required'],
            index: true,
        },
        date: {
            type: Date,
            required: [true, 'date is required'],
            set: normalizeDateValue,
        },
        mood: {
            type: String,
            required: [true, 'mood is required'],
            enum: {
                values: MOOD_ENUM,
                message: 'Mood must be one of: ' + MOOD_ENUM.join(', '),
            },
            trim: true,
            lowercase: true,
        },
        emoji: {
            type: String,
            required: [true, 'emoji is required'],
            trim: true,
            maxlength: 5,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [300, 'Description cannot exceed 300 characters'],
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

moodSchema.index({ userId: 1, date: 1 }, { unique: true });
moodSchema.index({ coupleId: 1, date: 1 });

moodSchema.set('toJSON', {
    transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.date instanceof Date) {
            ret.date = ret.date.toISOString().slice(0, 10);
        }
        return ret;
    },
});

moodSchema.statics.MOOD_ENUM = MOOD_ENUM;
moodSchema.statics.MOOD_EMOJI_MAP = MOOD_EMOJI_MAP;

module.exports = mongoose.model('Mood', moodSchema);
