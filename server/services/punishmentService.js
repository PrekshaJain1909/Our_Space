const PunishmentTemplate = require('../models/PunishmentTemplate');
const PunishmentHistory = require('../models/PunishmentHistory');

const DEFAULT_TEMPLATES = [
  { name: 'Sweet chore', text: 'Give your partner a 15-minute loving massage 💆‍♂️', difficulty: 'low', tags: ['physical','cute'] },
  { name: 'Cuddle time', text: '30 minutes of uninterrupted cuddle time and compliments ❤️', difficulty: 'low', tags: ['affection'] },
  { name: 'Breakfast in bed', text: 'Make your partner breakfast in bed 🥞', difficulty: 'medium', tags: ['service'] },
  { name: 'Fun dare', text: 'Do a silly dance and send a video to your partner 💃', difficulty: 'low', tags: ['fun'] },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generate({ coupleId, generatedBy, mood = 'cute', level = 'low', tags = [] } = {}) {
  // Try to pick from user-defined templates first
  const query = { difficulty: level };
  if (tags.length) query.tags = { $in: tags };

  let templates = await PunishmentTemplate.find(query).lean().limit(50);
  if (!templates || templates.length === 0) {
    templates = DEFAULT_TEMPLATES.filter(t => t.difficulty === level);
  }

  const picked = templates.length ? pickRandom(templates) : pickRandom(DEFAULT_TEMPLATES);

  // Simple personalization: append mood emoji
  const moodEmoji = mood === 'cute' ? ' 🥰' : mood === 'serious' ? ' 🤝' : ' 😊';
  const generatedText = `${picked.text}${moodEmoji}`;

  return { template: picked, text: generatedText };
}

async function generateAndSave({ coupleId, generatedBy, level, mood, tags, entryId }, opts = {}) {
  const { text, template } = await generate({ coupleId, generatedBy, level, mood, tags });

  const history = await PunishmentHistory.create({
    coupleId,
    entryId: entryId || null,
    generatedText: text,
    generatedBy: generatedBy || null,
  });

  return { history, text, template };
}

module.exports = { generate, generateAndSave };
