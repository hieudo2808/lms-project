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