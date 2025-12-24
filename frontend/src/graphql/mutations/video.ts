import { gql } from '@apollo/client';

export const GENERATE_UPLOAD_URL_MUTATION = gql`
    mutation GenerateVideoUploadUrl($input: VideoUploadInput!) {
        generateVideoUploadUrl(input: $input) {
            uploadUrl
            videoId
            s3Key
        }
    }
`;

export const CONFIRM_UPLOAD_MUTATION = gql`
    mutation ConfirmVideoUpload($videoId: UUID!, $durationSeconds: Int) {
        confirmVideoUpload(videoId: $videoId, durationSeconds: $durationSeconds) {
            videoId
            processingStatus
            streamUrl
            durationSeconds
        }
    }
`;
