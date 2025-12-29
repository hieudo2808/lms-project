ackage com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Categories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Categories, UUID> {
    Optional<Categories> findBySlug(String slug);
}
