import { gql } from '@apollo/client';

export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      commentId
      content
      createdAt
    }
  }
`;
