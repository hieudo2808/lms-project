import { gql } from '@apollo/client';

export const GET_MY_CERTIFICATES = gql`
  query GetMyCertificates {
    getMyCertificates {
      certificateId
      certificateCode
      pdfUrl
      finalScore
      issuedAt
      isValid
      course {
        courseId
        title
        thumbnailUrl
      }
      user {
        fullName
      }
    }
  }
`;

export const GET_CERTIFICATE_BY_COURSE = gql`
  query GetCertificateByCourse($courseId: UUID!) {
    getCertificateByCourse(courseId: $courseId) {
      certificateId
      certificateCode
      pdfUrl
      finalScore
      issuedAt
      isValid
      course {
        courseId
        title
      }
    }
  }
`;
