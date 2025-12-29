ackage com.seikyuuressha.lms.service.course;

import com.seikyuuressha.lms.dto.request.CreateModuleRequest;
import com.seikyuuressha.lms.dto.request.UpdateModuleRequest;
import com.seikyuuressha.lms.dto.response.LessonResponse;
import com.seikyuuressha.lms.dto.response.ModuleResponse;
import com.seikyuuressha.lms.entity.Course;
import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.Module;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.mapper.LessonMapper;
import com.seikyuuressha.lms.repository.CourseInstructorRepository;
import com.seikyuuressha.lms.repository.CourseRepository;
import com.seikyuuressha.lms.repository.ModuleRepository;
import com.seikyuuressha.lms.repository.VideoRepository;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final VideoRepository videoRepository;
    private final CourseInstructorRepository courseInstructorRepository;
    private final SecurityContextService securityContextService;
    private final LessonMapper lessonMapper;

    
    @Transactional
    public ModuleResponse createModule(CreateModuleRequest request) {
        Course course = getCourseByIdAndVerifyOwnership(request.getCourseId());

        int order = request.getOrder() != null ? request.getOrder() :
                course.getModules().size() + 1;

        Module module = Module.builder()
                .course(course)
                .title(request.getTitle())
                .sortOrder(order)
                .build();

        module = moduleRepository.save(module);
        log.info("Module created. ModuleId: {}, CourseId: {}", module.getModuleId(), course.getCourseId());

        return mapToModuleResponse(module);
    }

    
    @Transactional
    public ModuleResponse updateModule(UUID moduleId, UpdateModuleRequest request) {
        Module module = getModuleByIdAndVerifyOwnership(moduleId);

        if (request.getTitle() != null) {
            module.setTitle(request.getTitle());
        }
        if (request.getOrder() != null) {
            module.setSortOrder(request.getOrder());
        }

        module = moduleRepository.save(module);
        return mapToModuleResponse(module);
    }

    
    @Transactional
    public Boolean deleteModule(UUID moduleId) {
        Module module = getModuleByIdAndVerifyOwnership(moduleId);

        if (!module.getLessons().isEmpty()) {
            throw new RuntimeException("Cannot delete module with existing lessons");
        }

        moduleRepository.delete(module);
        log.info("Module deleted. ModuleId: {}", moduleId);
        return true;
    }

    
    @Transactional
    public List<ModuleResponse> reorderModules(UUID courseId, List<UUID> moduleIds) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        List<Module> modules = moduleRepository.findAllById(moduleIds);
        
        boolean allBelongToCourse = modules.stream()
                .allMatch(m -> m.getCourse().getCourseId().equals(courseId));
        
        if (!allBelongToCourse) {
            throw new RuntimeException("Some modules do not belong to this course");
        }

        for (int i = 0; i < moduleIds.size(); i++) {
            UUID moduleId = moduleIds.get(i);
            Module module = modules.stream()
                    .filter(m -> m.getModuleId().equals(moduleId))
                    .findFirst()
                    .orElseThrow();
            module.setSortOrder(i + 1);
        }

        moduleRepository.saveAll(modules);

        return modules.stream()
                .sorted(Comparator.comparingInt(Module::getSortOrder))
                .map(this::mapToModuleResponse)
                .collect(Collectors.toList());
    }

    
    public Module getModuleByIdAndVerifyOwnership(UUID moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        Users currentUser = securityContextService.getCurrentInstructor();
        UUID userId = currentUser.getUserId();
        UUID courseId = module.getCourse().getCourseId();
        
        boolean isPrimaryInstructor = module.getCourse().getInstructor().getUserId().equals(userId);
        boolean isCoInstructor = courseInstructorRepository.existsByCourseIdAndUserId(courseId, userId);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().getRoleName());
        
        if (!isPrimaryInstructor && !isCoInstructor && !isAdmin) {
            throw new RuntimeException("You are not the instructor of this course");
        }

        return module;
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

    
    public ModuleResponse mapToModuleResponse(Module module) {
        List<LessonResponse> lessons = module.getLessons() != null
                ? module.getLessons().stream()
                        .sorted(Comparator.comparingInt(Lesson::getSortOrder))
                        .map(lesson -> {
                            LessonResponse response = lessonMapper.toLessonResponseSimple(lesson);
                            var videoOpt = videoRepository.findByLesson_LessonId(lesson.getLessonId());
                            if (videoOpt.isPresent()) {
                                response.setVideoUrl("stream:" + lesson.getLessonId());
                            }
                            return response;
                        })
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return ModuleResponse.builder()
                .moduleId(module.getModuleId())
                .title(module.getTitle())
                .order(module.getSortOrder())
                .lessons(lessons)
                .build();
    }
}
