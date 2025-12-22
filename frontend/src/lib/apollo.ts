import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql', // URL Backend của bạn
});

const authLink = setContext((_, { headers }) => {
  // Lấy dữ liệu từ auth-store của Zustand
  const authStorage = localStorage.getItem('auth-store');
  let token = '';
  
  if (authStorage) {
    const authData = JSON.parse(authStorage);
    token = authData.state.token; // Lấy token từ state
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});