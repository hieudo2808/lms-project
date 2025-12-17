import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useAuthStore } from '../lib/store';

// Endpoint GraphQL backend Spring Boot
const httpLink = new HttpLink({
  uri: 'http://localhost:8080/graphql',
});

// Đính kèm token từ Zustand vào header Authorization
const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().token;

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Log lỗi GraphQL / network cho dễ debug
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      // eslint-disable-next-line no-console
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations
        )}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    // eslint-disable-next-line no-console
    console.error(`[Network error]: ${networkError}`);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});
