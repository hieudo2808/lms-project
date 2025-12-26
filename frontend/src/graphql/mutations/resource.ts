import { gql } from '@apollo/client';

export const GENERATE_RESOURCE_UPLOAD_URL = gql`
    mutation GenerateResourceUploadUrl($lessonId: UUID!, $fileName: String!, $contentType: String!) {
        generateResourceUploadUrl(lessonId: $lessonId, fileName: $fileName, contentType: $contentType) {
            uploadUrl
            s3Key
        }
    }
`;

export const CONFIRM_RESOURCE_UPLOAD = gql`
    mutation ConfirmResourceUpload(
        $lessonId: UUID!
        $s3Key: String!
        $fileName: String!
        $resourceType: String!
        $fileSize: Long!
    ) {
        confirmResourceUpload(
            lessonId: $lessonId
            s3Key: $s3Key
            fileName: $fileName
            resourceType: $resourceType
            fileSize: $fileSize
        ) {
            resourceId
            lessonId
            fileName
            resourceType
            fileSize
        }
    }
`;

export const DELETE_LESSON_RESOURCE = gql`
    mutation DeleteLessonResource($resourceId: UUID!) {
        deleteLessonResource(resourceId: $resourceId)
    }
`;
