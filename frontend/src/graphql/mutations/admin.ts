import { gql } from "@apollo/client";

/**
 * Admin: Khóa user
 */
export const LOCK_USER = gql`
  mutation LockUser($userId: UUID!, $reason: String!) {
    lockUser(userId: $userId, reason: $reason)
  }
`;

/**
 * Admin: Mở khóa user
 */
export const UNLOCK_USER = gql`
  mutation UnlockUser($userId: UUID!) {
    unlockUser(userId: $userId)
  }
`;

/**
 * Admin: Cập nhật role của user
 */
export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: UUID!, $roleId: UUID!) {
    updateUserRole(userId: $userId, roleId: $roleId) {
      userId
      fullName
      roleName
    }
  }
`;

/**
 * Admin: Xóa user
 */
export const DELETE_USER = gql`
  mutation DeleteUser($userId: UUID!) {
    deleteUser(userId: $userId)
  }
`;

/**
 * Admin: Duyệt khóa học
 */
export const APPROVE_COURSE = gql`
  mutation ApproveCourse($courseId: UUID!) {
    approveCourse(courseId: $courseId) {
      courseId
      title
      isPublished
    }
  }
`;

/**
 * Admin: Từ chối khóa học
 */
export const REJECT_COURSE = gql`
  mutation RejectCourse($courseId: UUID!, $reason: String!) {
    rejectCourse(courseId: $courseId, reason: $reason) {
      courseId
      title
      isPublished
    }
  }
`;

/**
 * Admin: Xóa khóa học
 */
export const DELETE_COURSE_ADMIN = gql`
  mutation DeleteCourseAdmin($courseId: UUID!) {
    deleteCourseAdmin(courseId: $courseId)
  }
`;
