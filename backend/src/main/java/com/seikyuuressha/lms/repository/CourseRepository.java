ackage com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    Optional<Course> findBySlug(String slug);
    List<Course> findByIsPublishedTrue();
    
    @Query("SELECT c FROM Course c WHERE c.isPublished = true AND " +
           "(:categoryId IS NULL OR c.category.categoryId = :categoryId)")
    List<Course> findPublishedCourses(UUID categoryId);
    
    List<Course> findByInstructor_UserId(UUID instructorId);
    
    boolean existsBySlug(String slug);
    
    Page<Course> findByIsPublished(Boolean isPublished, Pageable pageable);
    long countByIsPublished(Boolean isPublished);
}