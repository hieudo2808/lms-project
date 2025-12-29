import { gql } from "@apollo/client";

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      categoryId
      name
      slug
      description
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($categoryId: UUID!, $input: UpdateCategoryInput!) {
    updateCategory(categoryId: $categoryId, input: $input) {
      categoryId
      name
      slug
      description
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($categoryId: UUID!) {
    deleteCategory(categoryId: $categoryId)
  }
`;
