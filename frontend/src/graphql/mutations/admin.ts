import { gql } from '@apollo/client';

export const LOCK_USER = gql`
    mutation LockUser($userId: UUID!, $reason: String!) {
        lockUser(userId: $userId, reason: $reason)
    }
`;

export const UNLOCK_USER = gql`
    mutation UnlockUser($userId: UUID!) {
        unlockUser(userId: $userId)
    }
`;

export const UPDATE_USER_ROLE = gql`
    mutation UpdateUserRole($userId: UUID!, $roleId: UUID!) {
        updateUserRole(userId: $userId, roleId: $roleId) {
            userId
            fullName
            roleName
        }
    }
`;

export const DELETE_USER = gql`
    mutation DeleteUser($userId: UUID!) {
        deleteUser(userId: $userId)
    }
`;

export const APPROVE_COURSE = gql`
    mutation ApproveCourse($courseId: UUID!) {
        approveCourse(courseId: $courseId) {
            courseId
            title
            isPublished
        }
    }
`;

export const REJECT_COURSE = gql`
    mutation RejectCourse($courseId: UUID!, $reason: String!) {
        rejectCourse(courseId: $courseId, reason: $reason) {
            courseId
            title
            isPublished
        }
    }
`;

export const DELETE_COURSE_ADMIN = gql`
    mutation DeleteCourseAdmin($courseId: UUID!) {
        deleteCourseAdmin(courseId: $courseId)
    }
`;

export const CREATE_USER = gql`
    mutation CreateUser($fullName: String!, $email: String!, $password: String!, $roleId: UUID!) {
        createUser(fullName: $fullName, email: $email, password: $password, roleId: $roleId) {
            userId
            fullName
            email
            roleName
            isActive
        }
    }
`;

export const UPDATE_USER = gql`
    mutation UpdateUser($userId: UUID!, $fullName: String, $email: String, $password: String, $roleId: UUID) {
        updateUser(userId: $userId, fullName: $fullName, email: $email, password: $password, roleId: $roleId) {
            userId
            fullName
            email
            roleName
            isActive
        }
    }
`;
