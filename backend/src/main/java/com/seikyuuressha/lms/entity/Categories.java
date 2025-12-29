ackage com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Categories")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Categories {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID categoryId;

    @Column(nullable = false, length = 100)
    String name;

    @Column(nullable = false, unique = true, length = 100)
    String slug;

    @Column(length = 255)
    String description;

    @OneToMany(mappedBy = "category")
    List<Course> courses;
}
