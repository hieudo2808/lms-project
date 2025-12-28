export const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">LMS Platform</h3>
                        <p className="text-gray-400">Nền tảng học trực tuyến hàng đầu tại Việt Nam</p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Khóa học</h4>
                        <ul className="text-gray-400 space-y-2">
                            <li>
                                <a href="#" className="hover:text-white">
                                    Lập trình
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    Thiết kế
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    Marketing
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Công ty</h4>
                        <ul className="text-gray-400 space-y-2">
                            <li>
                                <a href="#" className="hover:text-white">
                                    Về chúng tôi
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    Tuyển dụng
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Hỗ trợ</h4>
                        <ul className="text-gray-400 space-y-2">
                            <li>
                                <a href="#" className="hover:text-white">
                                    Trợ giúp
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    Liên hệ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    Chính sách
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 EduNova. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
