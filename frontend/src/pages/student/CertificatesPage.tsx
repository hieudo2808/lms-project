import { useQuery, useMutation } from '@apollo/client';
import { Layout } from '../../components/common/Layout';
import { GET_MY_CERTIFICATES } from '../../graphql/queries/certificate';
import { GENERATE_CERTIFICATE } from '../../graphql/mutations/certificate';
import { Award, Download, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface Certificate {
  certificateId: string;
  certificateCode: string;
  pdfUrl: string | null;
  finalScore: number;
  issuedAt: string;
  isValid: boolean;
  course: {
    courseId: string;
    title: string;
    thumbnailUrl: string;
  };
  user: {
    fullName: string;
  };
}

export const CertificatesPage = () => {
  const { data, loading, error, refetch } = useQuery(GET_MY_CERTIFICATES, {
    fetchPolicy: 'cache-and-network',
  });

  const [generateCertificate, { loading: isGenerating }] = useMutation(
    GENERATE_CERTIFICATE,
    {
      onCompleted: () => {
        toast.success('Chứng chỉ đã được tạo thành công!');
        refetch();
      },
      onError: (err) => {
        toast.error('Lỗi tạo chứng chỉ: ' + err.message);
      },
    }
  );

  const handleGenerateCertificate = (courseId: string) => {
    if (window.confirm('Bạn có muốn tạo chứng chỉ cho khóa học này?')) {
      generateCertificate({ variables: { courseId } });
    }
  };

  const handleDownloadCertificate = (pdfUrl: string | null, courseName: string) => {
    if (!pdfUrl) {
      toast.warning('Chứng chỉ chưa được tạo PDF');
      return;
    }
    window.open(pdfUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không thể tải chứng chỉ
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </Layout>
    );
  }

  const certificates: Certificate[] = data?.getMyCertificates || [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Award className="text-amber-500" size={36} />
            Chứng chỉ của tôi
          </h1>
          <p className="text-gray-600">
            Danh sách các chứng chỉ bạn đã đạt được sau khi hoàn thành khóa học
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Tổng chứng chỉ</p>
                <p className="text-4xl font-bold mt-2">{certificates.length}</p>
              </div>
              <Award size={48} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Chứng chỉ hợp lệ</p>
                <p className="text-4xl font-bold mt-2">
                  {certificates.filter((c) => c.isValid).length}
                </p>
              </div>
              <CheckCircle size={48} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Điểm TB</p>
                <p className="text-4xl font-bold mt-2">
                  {certificates.length > 0
                    ? (
                        certificates.reduce((sum, c) => sum + (c.finalScore || 0), 0) /
                        certificates.length
                      ).toFixed(1)
                    : '0'}
                </p>
              </div>
              <Award size={48} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
            <Award className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Chưa có chứng chỉ nào
            </h2>
            <p className="text-gray-600">
              Hoàn thành khóa học để nhận chứng chỉ của bạn!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.certificateId}
                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Award size={40} />
                      <div>
                        <h3 className="font-bold text-lg">Chứng chỉ hoàn thành</h3>
                        <p className="text-amber-100 text-sm">
                          Mã: {cert.certificateCode}
                        </p>
                      </div>
                    </div>
                    {cert.isValid && (
                      <CheckCircle className="text-green-300" size={24} />
                    )}
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={cert.course.thumbnailUrl || 'https://via.placeholder.com/120'}
                      alt={cert.course.title}
                      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-1">
                        {cert.course.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Người nhận: {cert.user.fullName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(cert.issuedAt)}
                        </div>
                        {cert.finalScore && (
                          <div className="font-semibold text-blue-600">
                            Điểm: {cert.finalScore}/100
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {cert.pdfUrl ? (
                      <button
                        onClick={() =>
                          handleDownloadCertificate(cert.pdfUrl, cert.course.title)
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                        <Download size={18} />
                        Tải về PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateCertificate(cert.course.courseId)}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium transition-colors disabled:opacity-50"
                      >
                        <Award size={18} />
                        {isGenerating ? 'Đang tạo...' : 'Tạo PDF'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
