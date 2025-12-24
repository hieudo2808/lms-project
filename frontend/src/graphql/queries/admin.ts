import { gql } from '@apollo/client';

/**
 * Admin: Lấy thống kê hệ thống
 */
export const GET_SYSTEM_STATISTICS = gql`
    query GetSystemStatistics {
        getSystemStatistics {
            totalUsers
            totalInstructors
            totalStudents
            totalCourses
            publishedCourses
            unpublishedCourses
            totalEnrollments
            totalPayments
            totalRevenue
            completedPayments
            pendingPayments
            failedPayments
        }
    }
`;

/**
 * Admin: Lấy danh sách tất cả users
 */
export const GET_ALL_USERS = gql`
    query GetAllUsers($page: Int, $limit: Int, $roleName: String) {
        getAllUsers(page: $page, limit: $limit, roleName: $roleName) {
            userId
            fullName
            email
            avatarUrl
            roleName
            isActive
            createdAt
        }
    }
`;

/**
 * Admin: Lấy danh sách vai trò
 */
export const GET_ALL_ROLES = gql`
    query GetAllRoles {
        getAllRoles {
            roleId
            roleName
        }
    }
`;

/**
 * Admin: Lấy tất cả khóa học (bao gồm cả unpublished)
 */
export const GET_ALL_COURSES_ADMIN = gql`
    query GetAllCoursesAdmin($isPublished: Boolean, $page: Int, $limit: Int) {
        getAllCoursesAdmin(isPublished: $isPublished, page: $page, limit: $limit) {
            courseId
            title
            slug
            thumbnailUrl
            level
            price
            isPublished
            instructor {
                userId
                fullName
                email
            }
            createdAt
        }
    }
`;

/**
 * Admin: Lấy tất cả payments
 */
export const GET_ALL_PAYMENTS = gql`
    query GetAllPayments($page: Int, $limit: Int, $status: String) {
        getAllPayments(page: $page, limit: $limit, status: $status) {
            paymentId
            userId
            courseId
            amount
            paymentProvider
            transactionId
            paymentStatus
            paidAt
            createdAt
        }
    }
`;

/**
 * Admin: Lấy báo cáo doanh thu
 */
export const GET_REVENUE_REPORT = gql`
    query GetRevenueReport($startDate: DateTime, $endDate: DateTime) {
        getRevenueReport(startDate: $startDate, endDate: $endDate) {
            totalRevenue
            totalPayments
            completedPayments
            pendingPayments
            failedPayments
            averagePayment
        }
    }
`;
