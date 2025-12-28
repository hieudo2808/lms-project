import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            token
            refreshToken
            user {
                userId
                fullName
                email
                avatarUrl
                bio
                roleName
                isActive
            }
        }
    }
`;

export const REGISTER_MUTATION = gql`
    mutation Register($input: RegisterInput!) {
        register(input: $input) {
            token
            refreshToken
            user {
                userId
                fullName
                email
                avatarUrl
                bio
                roleName
                isActive
            }
        }
    }
`;

export const GOOGLE_LOGIN_MUTATION = gql`
    mutation GoogleLogin($idToken: String!) {
        googleLogin(idToken: $idToken) {
            token
            refreshToken
            user {
                userId
                fullName
                email
                avatarUrl
                bio
                roleName
                isActive
            }
        }
    }
`;

export const REQUEST_PASSWORD_RESET = gql`
    mutation RequestPasswordReset($email: String!) {
        requestPasswordReset(email: $email)
    }
`;

export const RESET_PASSWORD = gql`
    mutation ResetPassword($resetCode: String!, $newPassword: String!) {
        resetPassword(resetCode: $resetCode, newPassword: $newPassword)
    }
`;

export const REFRESH_ACCESS_TOKEN = gql`
    mutation RefreshAccessToken($refreshToken: String!) {
        refreshAccessToken(refreshToken: $refreshToken) {
            token
            refreshToken
            user {
                userId
                fullName
                email
                avatarUrl
                bio
                roleName
                isActive
            }
        }
    }
`;

export const LOGOUT_MUTATION = gql`
    mutation Logout($refreshToken: String!) {
        logout(refreshToken: $refreshToken)
    }
`;
