import { gql } from '@apollo/client';

export const GENERATE_IMAGE_UPLOAD_URL = gql`
    mutation GenerateImageUploadUrl($fileName: String!, $contentType: String!) {
        generateImageUploadUrl(fileName: $fileName, contentType: $contentType) {
            uploadUrl
            s3Key
            publicUrl
            expiresIn
        }
    }
`;
