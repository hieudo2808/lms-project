ackage com.seikyuuressha.lms.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class CourseInstructorId implements Serializable {
    private UUID courseId;
    private UUID userId;

    public CourseInstructorId() {}

    public CourseInstructorId(UUID courseId, UUID userId) {
        this.courseId = courseId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CourseInstructorId that = (CourseInstructorId) o;
        return Objects.equals(courseId, that.courseId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(courseId, userId);
    }
}
