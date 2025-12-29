ackage com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.*;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.entity.Module;
import com.seikyuuressha.lms.mapper.UserMapper;
import com.seikyuuressha.lms.repository.*;
import com.seikyuuressha.lms.service.common.CourseResponseMapper;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InstructorService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final CourseInstructorRepository courseInstructorRepository;
    private final SecurityContextService securityContextService;
    private final CourseResponseMapper courseResponseMapper;
    private final UserMapper userMapper;

    
    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request) {
        Users instructor = securityContextService.getCurrentInstructor();

        if (courseRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Course slug already exists");
        }

        Categories category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .level(request.getLevel())
                .price(request.getPrice())
                .category(category)
                .instructor(instructor)
                .isPublished(false)
                .build();

        course = courseRepository.save(course);
        log.info("Course created. CourseId: {}, Instructor: {}", course.getCourseId(), instructor.getEmail());

        return courseResponseMapper.toCourseResponseForInstructor(course);
    }

    
    @Transactional
    public CourseResponse updateCourse(UUID courseId, UpdateCourseRequest request) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        if (request.getTitle() != null) {
            course.setTitle(request.getTitle());
        }
        if (request.getSlug() != null) {
            if (!course.getSlug().equals(request.getSlug()) && courseRepository.existsBySlug(request.getSlug())) {
                throw new RuntimeException("Course slug already exists");
            }
            course.setSlug(request.getSlug());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if (request.getThumbnailUrl() != null) {
            course.setThumbnailUrl(request.getThumbnailUrl());
        }
        if (request.getLevel() != null) {
            course.setLevel(request.getLevel());
        }
        if (request.getPrice() != null) {
            course.setPrice(request.getPrice());
        }
        if (request.getCategoryId() != null) {
            Categories category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            course.setCategory(category);
        }

        course.setUpdatedAt(OffsetDateTime.now());
        course = courseRepository.save(course);

        return courseResponseMapper.toCourseResponseForInstructor(course);
    }

    
    @Transactional
    public Boolean deleteCourse(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        if (enrollmentRepository.existsByCourse_CourseId(courseId)) {
            throw new RuntimeException("Cannot delete course with existing enrollments");
        }

        courseRepository.delete(course);
        log.info("Course deleted. CourseId: {}", courseId);
        return true;
    }

    
    @Transactional
    public CourseResponse publishCourse(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        if (course.getModules().isEmpty()) {
            throw new RuntimeException("Cannot publish course without modules");
        }

        boolean hasContent = course.getModules().stream()
                .anyMatch(module -> !module.getLessons().isEmpty());

        if (!hasContent) {
            throw new RuntimeException("Cannot publish course without lessons");
        }

        course.setPublished(true);
        course.setUpdatedAt(OffsetDateTime.now());
        course = courseRepository.save(course);

        log.info("Course published. CourseId: {}", courseId);
        return courseResponseMapper.toCourseResponseForInstructor(course);
    }

    
    @Transactional
    public CourseResponse unpublishCourse(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        course.setPublished(false);
        course.setUpdatedAt(OffsetDateTime.now());
        course = courseRepository.save(course);

        log.info("Course unpublished. CourseId: {}", courseId);
        return courseResponseMapper.toCourseResponseForInstructor(course);
    }

    
    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses() {
        Users instructor = securityContextService.getCurrentInstructor();
        UUID userId = instructor.getUserId();
        
        List<Course> ownedCourses = courseRepository.findByInstructor_UserId(userId);
        
        List<CourseInstructor> coInstructorEntries = courseInstructorRepository.findByUserId(userId);
        List<Course> coInstructorCourses = coInstructorEntries.stream()
                .map(ci -> courseRepository.findById(ci.getCourseId()).orElse(null))
                .filter(course -> course != null)
                .collect(Collectors.toList());
        
        Set<UUID> seenIds = new HashSet<>();
        List<Course> allCourses = new ArrayList<>();
        
        for (Course course : ownedCourses) {
            if (seenIds.add(course.getCourseId())) {
                allCourses.add(course);
            }
        }
        for (Course course : coInstructorCourses) {
            if (seenIds.add(course.getCourseId())) {
                allCourses.add(course);
            }
        }

        return allCourses.stream()
                .map(courseResponseMapper::toCourseResponseForInstructor)
                .collect(Collectors.toList());
    }

    
    @Transactional
    public CoInstructorResponse addCoInstructor(UUID courseId, String email) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);
        Users currentUser = securityContextService.getCurrentInstructor();

        if (!course.getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Chỉ chủ khóa học mới có thể thêm giảng viên phụ");
        }

        Users coInstructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        if (!"INSTRUCTOR".equals(coInstructor.getRole().getRoleName()) &&
            !"ADMIN".equals(coInstructor.getRole().getRoleName())) {
            throw new RuntimeException("Người dùng không phải là giảng viên");
        }

        if (courseInstructorRepository.existsByCourseIdAndUserId(courseId, coInstructor.getUserId())) {
            throw new RuntimeException("Người dùng đã là giảng viên của khóa học này");
        }

        if (coInstructor.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Không thể thêm chính mình làm giảng viên phụ");
        }

        CourseInstructor courseInstructor = CourseInstructor.builder()
                .courseId(courseId)
                .userId(coInstructor.getUserId())
                .userRole(CourseInstructor.InstructorRole.CO_INSTRUCTOR)
                .addedAt(OffsetDateTime.now())
                .build();

        courseInstructorRepository.save(courseInstructor);
        log.info("Co-instructor added. CourseId: {}, CoInstructor: {}", courseId, email);

        return mapToCoInstructorResponse(courseInstructor, coInstructor);
    }

    
    @Transactional
    public boolean removeCoInstructor(UUID courseId, UUID userId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);
        Users currentUser = securityContextService.getCurrentInstructor();

        if (!course.getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Chỉ chủ khóa học mới có thể xóa giảng viên phụ");
        }

        if (course.getInstructor().getUserId().equals(userId)) {
            throw new RuntimeException("Không thể xóa chủ khóa học");
        }

        CourseInstructor ci = courseInstructorRepository.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại trong khóa học này"));

        courseInstructorRepository.delete(ci);
        log.info("Co-instructor removed. CourseId: {}, UserId: {}", courseId, userId);

        return true;
    }

    
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getCourseEnrollments(UUID courseId) {
        getCourseByIdAndVerifyOwnership(courseId);

        List<Enrollment> enrollments = enrollmentRepository.findByCourse_CourseId(courseId);
        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    
    @Transactional
    public boolean removeStudentFromCourse(UUID courseId, UUID userId) {
        getCourseByIdAndVerifyOwnership(courseId);
        
        Enrollment enrollment = enrollmentRepository.findByUser_UserIdAndCourse_CourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Student is not enrolled in this course"));
        
        progressRepository.deleteByUser_UserIdAndLesson_Module_Course_CourseId(userId, courseId);
        enrollmentRepository.delete(enrollment);
        
        log.info("Student {} removed from course {} by instructor", userId, courseId);
        return true;
    }

    public Course getCourseByIdAndVerifyOwnership(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Users currentUser = securityContextService.getCurrentInstructor();
        UUID userId = currentUser.getUserId();
        
        boolean isPrimaryInstructor = course.getInstructor().getUserId().equals(userId);
        boolean isCoInstructor = courseInstructorRepository.existsByCourseIdAndUserId(courseId, userId);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().getRoleName());
        
        if (!isPrimaryInstructor && !isCoInstructor && !isAdmin) {
            throw new RuntimeException("You are not the instructor of this course");
        }

        return course;
    }

    private CoInstructorResponse mapToCoInstructorResponse(CourseInstructor ci, Users user) {
        return CoInstructorResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(ci.getUserRole().name())
                .addedAt(ci.getAddedAt())
                .build();
    }

    private EnrollmentResponse mapToEnrollmentResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .course(courseResponseMapper.toCourseResponseWithoutModules(enrollment.getCourse()))
                .enrolledAt(enrollment.getEnrolledAt())
                .progressPercent(enrollment.getProgressPercent())
                .build();
    }
}
