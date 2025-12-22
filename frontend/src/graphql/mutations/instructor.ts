import { gql } from '@apollo/client';

// === 1. COURSE MUTATIONS ===

// Tạo khóa học mới (Dùng trong CreateCoursePage)
export const CREATE_COURSE_MUTATION = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      courseId
      title
      slug
      price
      level
      isPublished
    }
  }
`;

// Cập nhật thông tin chung khóa học
export const UPDATE_COURSE_MUTATION = gql`
  mutation UpdateCourse($courseId: UUID!, $input: UpdateCourseInput!) {
    updateCourse(courseId: $courseId, input: $input) {
      courseId
      title
      slug
      description
      price
      level
      thumbnailUrl
      isPublished
    }
  }
`;

// Xóa khóa học (Dùng trong MyCoursesPage)
export const DELETE_COURSE_MUTATION = gql`
  mutation DeleteCourse($courseId: UUID!) {
    deleteCourse(courseId: $courseId)
  }
`;

// Xuất bản khóa học (Public)
export const PUBLISH_COURSE_MUTATION = gql`
  mutation PublishCourse($courseId: UUID!) {
    publishCourse(courseId: $courseId) {
      courseId
      isPublished
    }
  }
`;

// Gỡ khóa học (Unpublish/Draft)
export const UNPUBLISH_COURSE_MUTATION = gql`
  mutation UnpublishCourse($courseId: UUID!) {
    unpublishCourse(courseId: $courseId) {
      courseId
      isPublished
    }
  }
`;


// === 2. MODULE MUTATIONS (Chương học) ===

// Tạo chương mới
export const CREATE_MODULE_MUTATION = gql`
  mutation CreateModule($input: CreateModuleInput!) {
    createModule(input: $input) {
      moduleId
      title
      order
    }
  }
`;

// Cập nhật tên chương
export const UPDATE_MODULE_MUTATION = gql`
  mutation UpdateModule($moduleId: UUID!, $input: UpdateModuleInput!) {
    updateModule(moduleId: $moduleId, input: $input) {
      moduleId
      title
      order
    }
  }
`;

// Xóa chương
export const DELETE_MODULE_MUTATION = gql`
  mutation DeleteModule($moduleId: UUID!) {
    deleteModule(moduleId: $moduleId)
  }
`;

// Sắp xếp lại thứ tự các chương (Dùng cho kéo thả)
export const REORDER_MODULES_MUTATION = gql`
  mutation ReorderModules($courseId: UUID!, $moduleIds: [UUID!]!) {
    reorderModules(courseId: $courseId, moduleIds: $moduleIds) {
      moduleId
      order
    }
  }
`;


// === 3. LESSON MUTATIONS (Bài học) ===

// Tạo bài học mới
export const CREATE_LESSON_MUTATION = gql`
  mutation CreateLesson($input: CreateLessonInput!) {
    createLesson(input: $input) {
      lessonId
      title
      order
      videoUrl
    }
  }
`;

// Cập nhật nội dung bài học
export const UPDATE_LESSON_MUTATION = gql`
  mutation UpdateLesson($lessonId: UUID!, $input: UpdateLessonInput!) {
    updateLesson(lessonId: $lessonId, input: $input) {
      lessonId
      title
      content
      videoUrl
      durationSeconds
    }
  }
`;

// Xóa bài học
export const DELETE_LESSON_MUTATION = gql`
  mutation DeleteLesson($lessonId: UUID!) {
    deleteLesson(lessonId: $lessonId)
  }
`;

// Sắp xếp lại bài học trong chương (Dùng cho kéo thả)
export const REORDER_LESSONS_MUTATION = gql`
  mutation ReorderLessons($moduleId: UUID!, $lessonIds: [UUID!]!) {
    reorderLessons(moduleId: $moduleId, lessonIds: $lessonIds) {
      lessonId
      order
    }
  }
`;