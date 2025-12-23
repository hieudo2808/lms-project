import { gql } from '@apollo/client';

export const GENERATE_CERTIFICATE = gql`
  mutation GenerateCertificate($courseId: UUID!) {
    generateCertificate(courseId: $courseId) {
      certificateId
      certificateCode
      pdfUrl
      finalScore
      issuedAt
      isValid
    }
  }
`;
