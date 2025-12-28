CREATE DATABASE LMS;
GO

USE LMS;
GO

-- ============================================
-- 1. Roles Table
-- ============================================
CREATE TABLE Roles (
    roleId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    roleName NVARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO Roles (roleName) VALUES ('STUDENT'), ('INSTRUCTOR'), ('ADMIN');

-- ============================================
-- 2. Users Table
-- ============================================
CREATE TABLE Users (
    userId UNIQUEIDENTIFIER PRIMARY KEY,
    fullName NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    avatarUrl NVARCHAR(255),
    bio NVARCHAR(500),
    roleId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Roles(roleId) ON UPDATE CASCADE ON DELETE CASCADE,
    createdAt DATETIMEOFFSET DEFAULT GETDATE(),
    isActive BIT DEFAULT 1,
	failedLoginAttempts INT NOT NULL DEFAULT 0,
    blockUntil DATETIMEOFFSET
);

-- ============================================
-- 3. Categories Table
-- ============================================
CREATE TABLE Categories (
    categoryId UNIQUEIDENTIFIER PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    slug NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(255)
);

-- ============================================
-- 4. Courses Table
-- ============================================
CREATE TABLE Courses (
    courseId UNIQUEIDENTIFIER PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    slug NVARCHAR(150) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    thumbnailUrl NVARCHAR(255),
    level NVARCHAR(50), 
    price DECIMAL(10,2) DEFAULT 0,
    categoryId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Categories(categoryId) ON UPDATE CASCADE ON DELETE CASCADE,
    -- [SAFE] Ngắt cascade từ User
    instructorId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(userId) ON UPDATE NO ACTION ON DELETE NO ACTION,  
    createdAt DATETIMEOFFSET DEFAULT GETDATE(),
    updatedAt DATETIMEOFFSET DEFAULT GETDATE(),
    isPublished BIT DEFAULT 0
);

-- ============================================
-- 4.1 CourseInstructors Table
-- ============================================
CREATE TABLE CourseInstructors (
    courseId UNIQUEIDENTIFIER NOT NULL,
    userId UNIQUEIDENTIFIER NOT NULL,
    userRole NVARCHAR(50) NOT NULL DEFAULT 'CO_INSTRUCTOR',
    addedAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE(),
    
    PRIMARY KEY (courseId, userId),
    CONSTRAINT FK_CourseInstructors_Course FOREIGN KEY (courseId) REFERENCES Courses(courseId) ON UPDATE CASCADE ON DELETE CASCADE,
    -- [SAFE] Ngắt cascade từ User
    CONSTRAINT FK_CourseInstructors_User FOREIGN KEY (userId) REFERENCES Users(userId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT CK_CourseInstructors_Role CHECK (userRole IN ('OWNER', 'CO_INSTRUCTOR'))
);

-- ============================================
-- 5. Modules Table
-- ============================================
CREATE TABLE Modules (
    moduleId UNIQUEIDENTIFIER PRIMARY KEY,
    courseId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Courses(courseId) ON UPDATE CASCADE ON DELETE CASCADE,
    title NVARCHAR(200) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1
);

-- ============================================
-- 6. Lessons Table
-- ============================================
CREATE TABLE Lessons (
    lessonId UNIQUEIDENTIFIER PRIMARY KEY,
    moduleId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Modules(moduleId) ON UPDATE CASCADE ON DELETE CASCADE,
    title NVARCHAR(200) NOT NULL,
    content NVARCHAR(MAX),
    durationSeconds INT,
    sort_order INT NOT NULL DEFAULT 1
);

-- ============================================
-- 6.1. Videos Table
-- ============================================
CREATE TABLE Videos (
    videoId UNIQUEIDENTIFIER PRIMARY KEY,
    lessonId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Lessons(lessonId) ON UPDATE CASCADE ON DELETE CASCADE,
    s3Key NVARCHAR(500) NOT NULL,
    s3Bucket NVARCHAR(100) NOT NULL,
    originalFilename NVARCHAR(255),
    fileSize BIGINT,
    mimeType NVARCHAR(100),
    durationSeconds INT,
    processingStatus NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
    uploadedAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE()
);

-- ============================================
-- 7. LessonResources Table
-- ============================================
CREATE TABLE LessonResources (
    resourceId UNIQUEIDENTIFIER PRIMARY KEY,
	fileName NVARCHAR(255),
    lessonId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Lessons(lessonId) ON UPDATE CASCADE ON DELETE CASCADE,
    resourceUrl NVARCHAR(1000),
    resourceType NVARCHAR(50),
	s3Key NVARCHAR(1000), 
	fileSize BIGINT, 
	createdAt DATETIMEOFFSET DEFAULT GETDATE()
);

-- ============================================
-- 8. Enrollments Table
-- ============================================
CREATE TABLE Enrollments (
    enrollmentId UNIQUEIDENTIFIER PRIMARY KEY,
    -- [SAFE] Ngắt cascade từ User
    userId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(userId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    courseId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Courses(courseId) ON UPDATE CASCADE ON DELETE CASCADE,
    enrolledAt DATETIMEOFFSET DEFAULT GETDATE(),
    progressPercent FLOAT DEFAULT 0,
    UNIQUE (userId, courseId)
);

-- ============================================
-- 9. Progress Table
-- ============================================
CREATE TABLE Progress (
    progressId UNIQUEIDENTIFIER PRIMARY KEY,
    -- [SAFE] Ngắt cascade từ User
    userId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(userId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    lessonId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Lessons(lessonId) ON UPDATE CASCADE ON DELETE CASCADE,
    watchedSeconds INT DEFAULT 0,
    progressPercent FLOAT DEFAULT 0,
    lastWatchedAt DATETIMEOFFSET DEFAULT GETDATE(),
    UNIQUE (userId, lessonId)
);

-- ============================================
-- 10. Reviews Table
-- ============================================
CREATE TABLE Reviews (
    reviewId UNIQUEIDENTIFIER PRIMARY KEY,
    -- [SAFE] Ngắt cascade từ User
    userId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(userId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    courseId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Courses(courseId) ON UPDATE CASCADE ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(500),
    createdAt DATETIMEOFFSET DEFAULT GETDATE(),
    updatedAt DATETIMEOFFSET NULL,
    isActive BIT DEFAULT 1
);

-- ============================================
-- 11. Comments Table
-- ============================================
CREATE TABLE Comments (
    commentId UNIQUEIDENTIFIER PRIMARY KEY,
    lessonId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Lessons(lessonId) ON UPDATE CASCADE ON DELETE CASCADE,
    -- [SAFE] Ngắt cascade từ User
    userId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(userId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    content NVARCHAR(500) NOT NULL,
    createdAt DATETIMEOFFSET DEFAULT GETDATE(),
    updatedAt DATETIMEOFFSET NULL,
    parentId UNIQUEIDENTIFIER NULL REFERENCES Comments(commentId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    isActive BIT DEFAULT 1
);

-- ============================================
-- 12. Payments Table
-- ============================================
CREATE TABLE Payments (
    paymentId UNIQUEIDENTIFIER PRIMARY KEY,
    -- [SAFE] Ngắt cascade User và Course (vì đã đi theo Enrollment)
    userId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(userId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    courseId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Courses(courseId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    enrollmentId UNIQUEIDENTIFIER FOREIGN KEY (enrollmentId) REFERENCES Enrollments(enrollmentId) ON UPDATE CASCADE ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency NVARCHAR(10) NOT NULL DEFAULT 'VND',
    paymentMethod NVARCHAR(50), 
    paymentStatus NVARCHAR(50) DEFAULT 'PENDING',
    transactionId NVARCHAR(100) UNIQUE,
    vnpayOrderInfo NVARCHAR(500),
    vnpayResponseCode NVARCHAR(50),
    createdAt DATETIMEOFFSET DEFAULT GETDATE(),
    paidAt DATETIMEOFFSET NULL
);

-- ============================================
-- 13. Quizzes Table
-- ============================================
CREATE TABLE Quizzes (
    quizId UNIQUEIDENTIFIER PRIMARY KEY,
    courseId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Courses(courseId) ON UPDATE CASCADE ON DELETE CASCADE,
    -- [SAFE] Ngắt cascade Module/Lesson (tránh vòng lặp)
    moduleId UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Modules(moduleId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    lessonId UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Lessons(lessonId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    passingScore INT NOT NULL DEFAULT 70,
    timeLimit INT NOT NULL DEFAULT 0,
    maxAttempts INT NOT NULL DEFAULT 0,
    isPublished BIT NOT NULL DEFAULT 0,
    orderIndex INT NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0, 
    createdAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIMEOFFSET NULL
);

-- ============================================
-- 14. Questions Table
-- ============================================
CREATE TABLE Questions (
    questionId UNIQUEIDENTIFIER PRIMARY KEY,
    quizId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Quizzes(quizId) ON UPDATE CASCADE ON DELETE CASCADE,
    questionText NVARCHAR(MAX) NOT NULL,
    question_type NVARCHAR(50) NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    points INT NOT NULL DEFAULT 1,
    orderIndex INT NOT NULL DEFAULT 0,
    explanation NVARCHAR(MAX),
    version BIGINT NOT NULL DEFAULT 0, 
    CONSTRAINT CK_Questions_Type CHECK (question_type IN ('MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER'))
);

-- ============================================
-- 15. Answers Table (Đáp án đúng sai của câu hỏi)
-- ============================================
CREATE TABLE Answers (
    answerId UNIQUEIDENTIFIER PRIMARY KEY,
    questionId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Questions(questionId) ON UPDATE CASCADE ON DELETE CASCADE,
    answerText NVARCHAR(MAX) NOT NULL,
    isCorrect BIT DEFAULT 0,
    orderIndex INT NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0 
);

-- ============================================
-- 16. QuizAttempts Table (Lần thi của học viên)
-- ============================================
CREATE TABLE QuizAttempts (
    attemptId UNIQUEIDENTIFIER PRIMARY KEY,
    quizId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Quizzes(quizId) ON UPDATE CASCADE ON DELETE CASCADE,
    -- [SAFE] Ngắt cascade User
    userId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(userId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    attemptNumber INT NOT NULL,
    startedAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE(),
    submittedAt DATETIMEOFFSET NULL,
    totalScore INT NOT NULL DEFAULT 0,
    maxScore INT NOT NULL,
    percentage FLOAT NULL,
    attempt_status NVARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    passed BIT NOT NULL DEFAULT 0,
    CONSTRAINT CK_QuizAttempts_Status CHECK (attempt_status IN ('IN_PROGRESS', 'SUBMITTED', 'GRADED', 'EXPIRED'))
);

-- ============================================
-- 17. QuizAnswers Table (Câu trả lời của học viên)
-- ============================================
CREATE TABLE QuizAnswers (
    quizAnswerId UNIQUEIDENTIFIER PRIMARY KEY,
    -- ƯU TIÊN 1: Xóa Attempt thì xóa luôn câu trả lời của lần thi đó (CASCADE)
    attemptId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES QuizAttempts(attemptId) ON UPDATE CASCADE ON DELETE CASCADE,
    
    -- [SAFE] QUAN TRỌNG NHẤT: Xóa Question KHÔNG tự động xóa QuizAnswer (để tránh lỗi Diamond).
    -- Nếu xóa câu hỏi, dữ liệu lịch sử trả lời vẫn còn tham chiếu ID (nhưng cần xử lý ở App).
    questionId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Questions(questionId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    
    textAnswer NVARCHAR(MAX) NULL,
    isCorrect BIT NOT NULL DEFAULT 0,
    pointsEarned INT NOT NULL DEFAULT 0,
    answeredAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE()
);

-- ============================================
-- 18. QuizAnswerSelections Table (Chi tiết chọn đáp án trắc nghiệm)
-- ============================================
CREATE TABLE QuizAnswerSelections (
    quizAnswerId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES QuizAnswers(quizAnswerId) ON UPDATE CASCADE ON DELETE CASCADE,
    -- [SAFE] Ngắt cascade từ bảng Answers gốc. Xóa đáp án gốc không tự xóa lịch sử chọn.
    answerId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Answers(answerId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    PRIMARY KEY (quizAnswerId, answerId)
);

-- ============================================
-- 19. Certificates Table
-- ============================================
CREATE TABLE Certificates (
    certificateId UNIQUEIDENTIFIER PRIMARY KEY,
    -- [SAFE] Ngắt cascade User
    userId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(userId) ON UPDATE NO ACTION ON DELETE NO ACTION,
    courseId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Courses(courseId) ON UPDATE CASCADE ON DELETE CASCADE,
    certificateCode NVARCHAR(100) NOT NULL UNIQUE,
    pdfUrl NVARCHAR(255) NOT NULL,
    issuedAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE(),
    finalScore FLOAT NULL,
    completionNote NVARCHAR(MAX),
    isValid BIT NOT NULL DEFAULT 1,
    revokedAt DATETIMEOFFSET NULL,
    revokedReason NVARCHAR(500),
    UNIQUE (userId, courseId)
);

CREATE TABLE PasswordResetTokens (
    tokenId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    userId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(userId) ON UPDATE CASCADE ON DELETE CASCADE,
    resetCode NVARCHAR(6) NOT NULL,
    createdAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    expiresAt DATETIMEOFFSET NOT NULL,
    isUsed BIT NOT NULL DEFAULT 0,
);

CREATE TABLE InvalidatedTokens (
	tokenId VARCHAR(36) NOT NULL PRIMARY KEY,
	expiryTime DATETIMEOFFSET NOT NULL,
	invalidatedAt DATETIMEOFFSET
)

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Courses_Slug ON Courses(slug);
CREATE INDEX IX_Modules_CourseId ON Modules(courseId);
CREATE INDEX IX_Lessons_ModuleId ON Lessons(moduleId);
CREATE INDEX IX_Progress_UserLesson ON Progress(userId, lessonId);
CREATE INDEX IX_Enrollments_UserCourse ON Enrollments(userId, courseId);
CREATE INDEX IX_Quizzes_CourseId ON Quizzes(courseId);
CREATE INDEX IX_Quizzes_ModuleId ON Quizzes(moduleId);
CREATE INDEX IX_Quizzes_LessonId ON Quizzes(lessonId);
CREATE INDEX IX_QuizAttempts_UserQuiz ON QuizAttempts(userId, quizId);
CREATE INDEX IX_QuizAnswers_Attempt ON QuizAnswers(attemptId);
CREATE INDEX IX_Payments_Enrollment ON Payments(enrollmentId);
CREATE INDEX IX_Certificates_Code ON Certificates(certificateCode);
CREATE INDEX IX_CourseInstructors_UserId ON CourseInstructors(userId);
CREATE INDEX idx_invalidated_tokens_expiry ON InvalidatedTokens(expiryTime);
GO

-- ============================================
-- Views
-- ============================================
CREATE VIEW vw_CourseStats AS
SELECT 
    c.courseId,
    c.title,
    COUNT(DISTINCT e.enrollmentId) AS totalEnrollments,
    AVG(CAST(r.rating AS FLOAT)) AS avgRating
FROM Courses c
LEFT JOIN Enrollments e ON c.courseId = e.courseId
LEFT JOIN Reviews r ON c.courseId = r.courseId AND r.isActive = 1
GROUP BY c.courseId, c.title;
GO

-- ============================================
-- Stored Procedures
-- ============================================
CREATE PROCEDURE UpdateCourseProgress
    @userId UNIQUEIDENTIFIER,
    @courseId UNIQUEIDENTIFIER
AS
BEGIN
    DECLARE @totalLessons INT = (
        SELECT COUNT(*) FROM Lessons l
        JOIN Modules m ON l.moduleId = m.moduleId
        WHERE m.courseId = @courseId
    );

    DECLARE @completedLessons INT = (
        SELECT COUNT(*) FROM Progress p
        JOIN Lessons l ON p.lessonId = l.lessonId
        JOIN Modules m ON l.moduleId = m.moduleId
        WHERE m.courseId = @courseId 
            AND p.progressPercent >= 90
            AND p.userId = @userId
    );

    UPDATE Enrollments
    SET progressPercent = (100.0 * @completedLessons / NULLIF(@totalLessons, 0))
    WHERE userId = @userId AND courseId = @courseId;
END;
GO

PRINT 'Database Created Successfully - NO CYCLES!';
GO