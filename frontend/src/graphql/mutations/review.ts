import { gql } from '@apollo/client';

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      reviewId
      rating
      comment
    }
  }
`;

export const UPDATE_REVIEW_MUTATION = gql`
  mutation UpdateReview($reviewId: UUID!, $input: UpdateReviewInput!) {
    updateReview(reviewId: $reviewId, input: $input) {
      reviewId
      rating
      comment
    }
  }
`;
