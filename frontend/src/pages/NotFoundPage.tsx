import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';

export const NotFoundPage = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-2xl text-gray-600 mb-6">Trang không tìm thấy</p>
          <p className="text-gray-500 mb-8">
            Xin lỗi, trang bạn tìm kiếm không tồn tại
          </p>
          <Link to="/">
            <Button variant="primary">
              Quay lại trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
