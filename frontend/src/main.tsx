import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// 1. Các Provider có sẵn của bạn
import { AuthProvider } from './contexts/AuthContext'; // Nếu bạn đang dùng Context (hoặc có thể bỏ nếu dùng full Zustand)
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './graphql/client';

// === 2. THÊM PHẦN NÀY (BẮT BUỘC CHO TOASTIFY) ===
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// =================================================

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <App />
        
        {/* Đặt ToastContainer ở đây để nó nằm đè lên mọi thứ */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>
);