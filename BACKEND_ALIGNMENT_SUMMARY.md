# Frontend Backend Alignment Summary

**Date:** Latest Session  
**Objective:** Align frontend GraphQL operations with actual backend schema definitions

## Changes Made

### 1. Fixed GraphQL Mutations

#### SUBMIT_QUIZ_ANSWER Mutation
**File:** `frontend/src/graphql/mutations/quiz.ts`

**Before:**
```graphql
mutation SubmitQuizAnswer($input: SubmitQuizAnswerInput!) {
  submitQuizAnswer(input: $input) {
    answerId
    questionId
    isCorrect
    pointsAwarded
  }
}
```

**After:**
```graphql
mutation SubmitQuizAnswer($attemptId: UUID!, $input: SubmitQuizAnswerInput!) {
  submitQuizAnswer(attemptId: $attemptId, input: $input) {
    answerId
    question { questionId }
    isCorrect
    pointsAwarded
  }
}
```

**Reason:** Backend signature requires `attemptId` as separate parameter plus `SubmitQuizAnswerInput` object.

---

#### UPDATE_PROGRESS Mutation
**File:** `frontend/src/graphql/mutations/enrollment.ts`

**Before:**
```graphql
mutation UpdateProgress($lessonId: UUID!, $progressPercent: Int!) {
  updateProgress(lessonId: $lessonId, progressPercent: $progressPercent) {
    lessonId
    progressPercent
    completed
  }
}
```

**After:**
```graphql
mutation UpdateProgress($lessonId: UUID!, $input: UpdateProgressInput!) {
  updateProgress(lessonId: $lessonId, input: $input) {
    progressId
    watchedSeconds
    progressPercent
    completed
  }
}
```

**Reason:** Backend expects `UpdateProgressInput` object with `watchedSeconds` and `progressPercent` fields, not a flat parameter.

---

### 2. Updated Mutation Calls in Pages

#### QuizTakingPage.tsx
**File:** `frontend/src/pages/student/QuizTakingPage.tsx`  
**Function:** `handleSubmitAnswer()`

**Before:**
```typescript
await submitAnswer({
  variables: {
    input: {
      attemptId,
      questionId,
      selectedAnswerId,
    },
  },
});
```

**After:**
```typescript
await submitAnswer({
  variables: {
    attemptId,
    input: {
      questionId,
      answerId: selectedAnswerId,
    },
  },
});
```

**Changes:**
- `attemptId` moved to top-level variables (separate from input object)
- Renamed field from `selectedAnswerId` to `answerId` to match backend SubmitQuizAnswerInput

---

#### LessonDetailPage.tsx
**File:** `frontend/src/pages/student/LessonDetailPage.tsx`  
**Function:** `handleProgressUpdate()`

**Before:**
```typescript
await updateProgress({
  variables: {
    lessonId: currentLesson.lessonId,
    progressPercent: 100,
  },
});
```

**After:**
```typescript
await updateProgress({
  variables: {
    lessonId: currentLesson.lessonId,
    input: {
      watchedSeconds: Math.round(currentTime),
      progressPercent: 100,
    },
  },
});
```

**Changes:**
- Wrapped `progressPercent` in `input` object
- Added `watchedSeconds` field (calculated from video currentTime)

---

## Backend GraphQL Schema Reference

### Input Types Used

```graphql
input SubmitQuizAnswerInput {
    questionId: UUID!
    answerId: UUID
    userAnswer: String
}

input UpdateProgressInput {
    watchedSeconds: Int
    progressPercent: Float
}
```

### Mutation Signatures

```graphql
type Mutation {
    startQuizAttempt(quizId: UUID!): QuizAttempt!
    submitQuizAnswer(attemptId: UUID!, input: SubmitQuizAnswerInput!): QuizAnswer!
    finishQuizAttempt(attemptId: UUID!): QuizAttempt!
    updateProgress(lessonId: UUID!, input: UpdateProgressInput!): Progress!
    # ... other mutations
}
```

---

## Testing Checklist

- [ ] Test quiz answer submission with correct parameter structure
- [ ] Test lesson progress update with watchedSeconds tracking
- [ ] Verify Apollo client correctly passes variables to mutations
- [ ] Check error handling for mutation failures
- [ ] Test with actual backend to confirm parameter alignment

---

## Notes

- All changes made only to align with actual backend schema
- No functionality was altered, only the way parameters are passed to mutations
- Frontend queries (GET operations) were already correctly aligned
- Consider adding TypeScript types for input objects to catch future misalignments at compile time
