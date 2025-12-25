import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Star,
  Play,
  ArrowRight,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== NAVBAR ===== */}
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20 lg:py-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Nền tảng học trực tuyến hàng đầu</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Học từ những{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  chuyên gia
                </span>{' '}
                tốt nhất
              </h1>
              
              <p className="text-xl text-gray-200 leading-relaxed">
                Nâng cao kỹ năng của bạn với hàng nghìn khóa học chất lượng cao 
                từ những giảng viên hàng đầu trong ngành. Học mọi lúc, mọi nơi với LMS Platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5" />
                  <span>Khám phá khóa học</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-purple-600 transition-all"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Bắt đầu học ngay</span>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold text-blue-400">10,000+</div>
                  <div className="text-sm text-gray-300">Học viên</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">500+</div>
                  <div className="text-sm text-gray-300">Khóa học</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pink-400">100+</div>
                  <div className="text-sm text-gray-300">Giảng viên</div>
                </div>
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px] flex items-center justify-center">
                {/* Floating cards animation */}
                <div className="absolute inset-0">
                  <div className="absolute top-10 right-10 w-64 h-40 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-float">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
                      <div>
                        <div className="h-3 w-24 bg-white/40 rounded"></div>
                        <div className="h-2 w-16 bg-white/20 rounded mt-2"></div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded mb-2"></div>
                    <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                  </div>
                  
                  <div className="absolute bottom-20 left-10 w-56 h-32 bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 animate-float-delayed">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-6 h-6 text-yellow-400" />
                      <div className="h-3 w-20 bg-white/40 rounded"></div>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded"></div>
                  </div>
                </div>
                
                {/* Center icon */}
                <div className="relative z-10 w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
                  <BookOpen className="w-24 h-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Tại sao chọn LMS Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cung cấp trải nghiệm học tập toàn diện với những tính năng vượt trội
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Khóa học đa dạng
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Hơn 500+ khóa học từ cơ bản đến nâng cao trong nhiều lĩnh vực khác nhau
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Giảng viên chuyên nghiệp
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Học từ những chuyên gia hàng đầu với kinh nghiệm thực tế phong phú
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Chứng chỉ uy tín
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Nhận chứng chỉ hoàn thành được công nhận sau mỗi khóa học
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Theo dõi tiến độ
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Quản lý và theo dõi tiến độ học tập của bạn một cách chi tiết
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chỉ với 3 bước đơn giản để bắt đầu hành trình học tập của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Đăng ký tài khoản</h3>
              <p className="text-gray-600 leading-relaxed">
                Tạo tài khoản miễn phí chỉ trong vài giây với email của bạn
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Chọn khóa học</h3>
              <p className="text-gray-600 leading-relaxed">
                Duyệt qua hàng trăm khóa học và tìm khóa học phù hợp nhất với bạn
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Bắt đầu học</h3>
              <p className="text-gray-600 leading-relaxed">
                Học theo tốc độ của bạn và nhận chứng chỉ khi hoàn thành
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Tham gia cùng hàng nghìn học viên đã nâng cao kỹ năng và phát triển sự nghiệp của họ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-lg"
            >
              <GraduationCap className="w-6 h-6" />
              <span>Đăng ký miễn phí</span>
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-purple-600 transition-all text-lg"
            >
              <BookOpen className="w-6 h-6" />
              <span>Xem khóa học</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  🎓 LMS
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nền tảng học trực tuyến hàng đầu, mang đến trải nghiệm học tập chất lượng cao cho mọi người.
              </p>
            </div>

            {/* Links columns */}
            <div>
              <h3 className="font-bold mb-4">Về chúng tôi</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/courses" className="hover:text-white transition-colors">Khóa học</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Trở thành học viên</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Đăng nhập</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: support@lms.com</li>
                <li>Hotline: 1900 xxxx</li>
                <li>Địa chỉ: Hà Nội, Việt Nam</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 LMS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ===== FLOATING ANIMATION STYLES ===== */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
};
