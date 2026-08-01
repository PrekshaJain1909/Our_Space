module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'Together Mood API',
        version: '1.0.0',
        description: 'Mood & Upset module endpoints for Together – Your Love Journey',
    },
    servers: [
        { url: '/api/moods', description: 'Mood API server' }
    ],
    components: {
        schemas: {
            MoodEntry: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    name: { type: 'string' },
                    coupleId: { type: 'string' },
                    date: { type: 'string', example: '2026-07-25' },
                    mood: { type: 'string', example: 'happy' },
                    emoji: { type: 'string', example: '😊' },
                    description: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            MoodSummary: {
                type: 'object',
                properties: {
                    summary: { type: 'string' },
                },
            },
            MoodStats: {
                type: 'object',
                properties: {
                    happyDays: { type: 'integer' },
                    sadDays: { type: 'integer' },
                    angryDays: { type: 'integer' },
                    romanticDays: { type: 'integer' },
                    cryingDays: { type: 'integer' },
                    neutralDays: { type: 'integer' },
                    averageMood: { type: 'integer' },
                    entries: { type: 'integer' },
                    streak: { type: 'integer' },
                    mostCommonMood: { type: 'string', nullable: true },
                },
            },
            MoodTrendItem: {
                type: 'object',
                properties: {
                    date: { type: 'string' },
                    myMood: { type: 'string', nullable: true },
                    partnerMood: { type: 'string', nullable: true },
                },
            },
            MoodComparison: {
                type: 'object',
                properties: {
                    me: {
                        type: 'object',
                        properties: {
                            happy: { type: 'integer' },
                            sad: { type: 'integer' },
                            angry: { type: 'integer' },
                            score: { type: 'integer' },
                        },
                    },
                    partner: {
                        type: 'object',
                        properties: {
                            happy: { type: 'integer' },
                            sad: { type: 'integer' },
                            angry: { type: 'integer' },
                            score: { type: 'integer' },
                        },
                    },
                },
            },
        },
    },
    paths: {
        '/': {
            post: {
                summary: 'Create a mood entry',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    date: { type: 'string' },
                                    mood: { type: 'string', enum: ['happy', 'romantic', 'loved', 'neutral', 'calm', 'tired', 'sad', 'crying', 'angry', 'upset'] },
                                    emoji: { type: 'string' },
                                    description: { type: 'string', maxLength: 300 },
                                },
                                required: ['date', 'mood', 'emoji'],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Mood created successfully',
                        content: {
                            'application/json': {
                                schema: { type: 'object' },
                            },
                        },
                    },
                },
            },
            get: {
                summary: 'Get mood calendar entries',
                parameters: [
                    { name: 'view', in: 'query', schema: { type: 'string', enum: ['my', 'partner', 'both'] }, description: 'View filter' },
                    { name: 'month', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 12 }, description: 'Month filter' },
                    { name: 'year', in: 'query', schema: { type: 'integer' }, description: 'Year filter' },
                ],
                responses: {
                    200: {
                        description: 'Calendar retrieved',
                        content: {
                            'application/json': {
                                schema: { type: 'object' },
                            },
                        },
                    },
                },
            },
        },
        '/calendar': {
            get: {
                summary: 'Get shared calendar entries',
                responses: { 200: { description: 'Shared calendar retrieved' } },
            },
        },
        '/date/{date}': {
            get: {
                summary: 'Get moods for a single date',
                parameters: [{ name: 'date', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Mood date details retrieved' } },
            },
        },
        '/{id}': {
            put: {
                summary: 'Update a mood entry',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    mood: { type: 'string' },
                                    emoji: { type: 'string' },
                                    description: { type: 'string', maxLength: 300 },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: 'Mood updated' } },
            },
            delete: {
                summary: 'Delete a mood entry',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Mood deleted' } },
            },
        },
        '/stats/month': {
            get: {
                summary: 'Get monthly mood statistics',
                responses: { 200: { description: 'Monthly stats retrieved' } },
            },
        },
        '/summary': {
            get: {
                summary: 'Get AI mood summary',
                responses: { 200: { description: 'Mood summary retrieved' } },
            },
        },
        '/trend': {
            get: {
                summary: 'Get mood trend for month',
                responses: { 200: { description: 'Mood trend retrieved' } },
            },
        },
        '/distribution': {
            get: {
                summary: 'Get mood distribution counts',
                responses: { 200: { description: 'Distribution retrieved' } },
            },
        },
        '/comparison': {
            get: {
                summary: 'Get weekly comparison',
                responses: { 200: { description: 'Comparison retrieved' } },
            },
        },
        '/recent': {
            get: {
                summary: 'Get recent mood activity',
                responses: { 200: { description: 'Recent activity retrieved' } },
            },
        },
    },
};
