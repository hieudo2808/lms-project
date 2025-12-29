ackage com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {

    List<Module> findByCourse_CourseId(UUID courseId);

    List<Module> findByCourse_CourseIdOrderBySortOrderAsc(UUID courseId);
}
