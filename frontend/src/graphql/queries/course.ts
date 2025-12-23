import { gql } from '@apollo/client';

// Lấy danh sách khóa học (cho Home Page)
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

// Lấy rating cho một khóa học
export const GET_COURSE_RATING = gql`
    query GetCourseRating($courseId: UUID!) {
        getCourseAverageRating(courseId: $courseId)
    }
`;

// Lấy chi tiết khóa học + Modules + Lessons (cho Detail & Lesson Page)

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

// Lấy khóa học đã đăng ký (cho My Courses)
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
