import { gql } from '@apollo/client';

export const ENROLL_COURSE_MUTATION = gql`
    mutation EnrollCourse($courseId: UUID!) {
        enrollCourse(courseId: $courseId) {
            enrollmentId
            enrolledAt
        }
    }
`;

export const UPDATE_PROGRESS_MUTATION = gql`
    mutation UpdateProgress($lessonId: UUID!, $input: UpdateProgressInput!) {
        updateProgress(lessonId: $lessonId, input: $input) {
            progressId
            watchedSeconds
            progressPercent
        }
    }
`;

export const INITIATE_PAYMENT = gql`
    mutation InitiatePayment($input: InitiatePaymentInput!) {
        initiatePayment(input: $input) {
            paymentId
            transactionId
            paymentUrl
        }
    }
`;

export const VERIFY_PAYMENT = gql`
    mutation ConfirmPayment($transactionId: String!, $vnp_ResponseCode: String!) {
        confirmPayment(transactionId: $transactionId, vnp_ResponseCode: $vnp_ResponseCode) {
            paymentId
            paymentStatus
            courseId
        }
    }
`;
