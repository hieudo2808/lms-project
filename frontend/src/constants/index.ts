export const COURSE_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
} as const;

export const COURSE_LEVEL_LABELS = {
    [COURSE_LEVELS.BEGINNER]: 'Cơ bản',
    [COURSE_LEVELS.INTERMEDIATE]: 'Trung bình',
    [COURSE_LEVELS.ADVANCED]: 'Nâng cao',
} as const;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/v1/auth/login',
        REGISTER: '/v1/auth/register',
        LOGOUT: '/v1/auth/logout',
    },

    COURSES: {
        LIST: '/v1/courses',
        DETAIL: (slug: string) => `/v1/courses/${slug}`,
        SEARCH: '/v1/courses/search',
    },

    PROGRESS: {
        GET: (lessonId: string) => `/v1/progress/${lessonId}`,
        SAVE: '/v1/progress',
    },

    USER: {
        PROFILE: '/v1/me',
        COURSES: '/v1/me/courses',
        ENROLL: '/v1/me/courses',
    },
} as const;

export const VALIDATION = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 6,
    FULLNAME_MIN_LENGTH: 2,
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
} as const;
