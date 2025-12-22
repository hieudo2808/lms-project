import { gql } from '@apollo/client';

export const GET_ME_QUERY = gql`
  query Me {
    me {
      userId
      fullName
      email
      avatarUrl
      bio
      roleName
      createdAt
      isActive
    }
  }
`;
