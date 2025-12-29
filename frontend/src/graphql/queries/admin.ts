import { gql } from '@apollo/client';

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

export const GET_ALL_ROLES = gql`
    query GetAllRoles {
        getAllRoles {
            roleId
            roleName
        }
    }
`;

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
