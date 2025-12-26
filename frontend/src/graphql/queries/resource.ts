import { gql } from '@apollo/client';

export const GET_LESSON_RESOURCES = gql`
    query GetLessonResources($lessonId: UUID!) {
        getLessonResources(lessonId: $lessonId) {
            resourceId
            lessonId
            fileName
            resourceType
            fileSize
            downloadUrl
            createdAt
        }
    }
`;
