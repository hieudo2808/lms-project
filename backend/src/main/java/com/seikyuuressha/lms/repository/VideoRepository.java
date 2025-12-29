ackage com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VideoRepository extends JpaRepository<Video, UUID> {

    Optional<Video> findByLesson_LessonId(UUID lessonId);

    List<Video> findByProcessingStatus(Video.ProcessingStatus status);

    @Query("SELECT v FROM Video v WHERE v.lesson.module.course.instructor.userId = :instructorId")
    List<Video> findByInstructorId(@Param("instructorId") UUID instructorId);

    @Query("SELECT v FROM Video v WHERE v.lesson.module.course.courseId = :courseId")
    List<Video> findByCourseId(@Param("courseId") UUID courseId);

    boolean existsByLesson_LessonId(UUID lessonId);
}
