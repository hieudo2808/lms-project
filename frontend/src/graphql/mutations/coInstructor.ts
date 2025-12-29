import { gql } from '@apollo/client';

export const ADD_CO_INSTRUCTOR = gql`
    mutation AddCoInstructor($courseId: UUID!, $email: String!) {
        addCoInstructor(courseId: $courseId, email: $email) {
            userId
            fullName
            email
            avatarUrl
            role
            addedAt
        }
    }
`;

export const REMOVE_CO_INSTRUCTOR = gql`
    mutation RemoveCoInstructor($courseId: UUID!, $userId: UUID!) {
        removeCoInstructor(courseId: $courseId, userId: $userId)
    }
`;
