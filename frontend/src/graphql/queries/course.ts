import { gql } from '@apollo/client';

export const GET_ALL_COURSES = gql`
    query GetAllCourses {
        getAllCourses {
            courseId
            title
            slug
            description
            price
            level
            thumbnailUrl
            totalDuration
            totalLessons
            instructor {
                fullName
                avatarUrl
            }
        }
    }
`;

export const GET_COURSE_RATING = gql`
    query GetCourseRating($courseId: UUID!) {
        getCourseAverageRating(courseId: $courseId)
    }
`;

export const GET_COURSE_BY_ID = gql`
    query GetCourseById($courseId: UUID!) {
        getCourseById(courseId: $courseId) {
            courseId
            title
            slug
            description
            price
            thumbnailUrl
            level
            totalLessons
            totalDuration
        }
    }
`;

export const GET_COURSE_BY_SLUG = gql`
    query GetCourseBySlug($slug: String!) {
        getCourseBySlug(slug: $slug) {
            courseId
            title
            slug
            description
            price
            level
            thumbnailUrl
            totalDuration
            totalLessons
            isPublished
            instructor {
                userId
                fullName
                avatarUrl
                bio
            }
            coInstructors {
                userId
                fullName
                email
                avatarUrl
                role
                addedAt
            }
            modules {
                moduleId
                title
                order
                lessons {
                    lessonId
                    title
                    videoUrl
                    content
                    durationSeconds
                    order
                    userProgress
                }
            }
        }
    }
`;

export const GET_MY_ENROLLMENTS = gql`
    query GetMyEnrollments {
        myEnrollments {
            enrollmentId
            progressPercent
            enrolledAt
            course {
                courseId
                title
                slug
                thumbnailUrl
                level
                totalDuration
                totalLessons
                instructor {
                    fullName
                }
            }
        }
    }
`;

export const GET_COURSE_WITH_LESSONS = gql`
    query GetCourseWithLessons($slug: String!) {
        getCourseBySlug(slug: $slug) {
            courseId
            title
            slug
            description
            price
            level
            thumbnailUrl
            totalDuration
            totalLessons
            isPublished
            instructor {
                userId
                fullName
                avatarUrl
                bio
            }
            modules {
                moduleId
                title
                order
                lessons {
                    lessonId
                    title
                    videoUrl
                    durationSeconds
                    order
                    userProgress
                }
            }
        }
    }
`;
