import { ApolloClient, InMemoryCache, createHttpLink, from, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useAuthStore } from './store';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8080/graphql';

const httpLink = createHttpLink({
    uri: GRAPHQL_URL,
    credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
    const authStorage = localStorage.getItem('auth-store');
    let token = '';

    if (authStorage) {
        try {
            const authData = JSON.parse(authStorage);
            token = authData.state?.token || '';
        } catch {
            token = '';
        }
    }

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Token refresh logic - uses REST API with HTTP-only cookie
async function refreshAccessToken(): Promise<string | null> {
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Send cookies automatically
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();

        if (result.token && result.user) {
            // Update store with new access token
            useAuthStore.getState().setAuth(result.token, result.user);
            return result.token;
        }

        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
}

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    console.log('[ErrorLink] Called with graphQLErrors:', graphQLErrors, 'networkError:', networkError);
    if (graphQLErrors) {
        for (const err of graphQLErrors) {
            // Check for Spring Security auth errors
            const isAuthError =
                err.extensions?.classification === 'FORBIDDEN' || err.message?.includes('Access denied');

            if (isAuthError) {
                console.log('[Auth Error] Attempting token refresh for error:', err.message);
                return new Observable((observer) => {
                    refreshAccessToken()
                        .then((newToken) => {
                            console.log('[Token Refresh] Result:', newToken ? 'SUCCESS' : 'FAILED');
                            if (newToken) {
                                const oldHeaders = operation.getContext().headers;
                                operation.setContext({
                                    headers: {
                                        ...oldHeaders,
                                        authorization: `Bearer ${newToken}`,
                                    },
                                });

                                const subscriber = {
                                    next: observer.next.bind(observer),
                                    error: observer.error.bind(observer),
                                    complete: observer.complete.bind(observer),
                                };

                                forward(operation).subscribe(subscriber);
                            } else {
                                console.log('[Token Refresh] No new token, redirecting to login');
                                useAuthStore.getState().logout();
                                window.location.href = '/login';
                                observer.error(err);
                            }
                        })
                        .catch((error) => {
                            console.error('[Token Refresh] Error:', error);
                            // Don't auto-logout on network errors - might be HMR reload
                            observer.error(error);
                        });
                });
            }
        }
    }

    if (networkError) {
        console.error('[Network error]:', networkError);
    }
});

export const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
        typePolicies: {
            User: {
                keyFields: ['userId'],
            },
        },
    }),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
        },
    },
});
