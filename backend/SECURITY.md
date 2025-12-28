# LMS Security Documentation

## Overview

Tài liệu này mô tả toàn bộ cơ chế bảo mật được triển khai trong hệ thống LMS.

---

## 1. Authentication (Xác thực)

### 1.1 JWT Token

| Config               | Value                  |
| -------------------- | ---------------------- |
| Algorithm            | HS256 (HMAC-SHA256)    |
| Access Token Expiry  | 1 giờ                  |
| Refresh Token Expiry | 7 ngày                 |
| Library              | `io.jsonwebtoken:jjwt` |

**Token Claims:**

```json
{
  "sub": "user@email.com",
  "userId": "uuid",
  "role": "STUDENT",
  "jti": "uuid",
  "tokenType": "REFRESH"
}
```

### 1.2 Password Security

- **Algorithm:** BCrypt với strength 15
- **Pepper:** Secret key thêm vào password trước khi hash
- **File:** `PepperBCryptEncoder.java`

### 1.3 Token Refresh & Invalidation

- **Refresh Token Rotation:** Mỗi lần refresh, token cũ bị invalidate
- **Blacklist:** Bảng `InvalidatedTokens` lưu JTI của tokens đã revoke
- **Logout:** Gọi mutation `logout(refreshToken)` để invalidate

---

## 2. Authorization (Phân quyền)

### 2.1 Role-based Access Control

| Role       | Permissions                            |
| ---------- | -------------------------------------- |
| STUDENT    | Xem courses, enroll, làm quiz, comment |
| INSTRUCTOR | Tạo/sửa courses, modules, lessons      |
| ADMIN      | Quản lý users, roles, toàn hệ thống    |

### 2.2 Object-level Authorization (Chống IDOR)

Mỗi service kiểm tra ownership trước khi sửa/xóa:

```java
if (!course.getInstructor().getUserId().equals(currentUserId)) {
    throw new RuntimeException("Not authorized");
}
```

---

## 3. Rate Limiting

| Endpoint   | Limit                |
| ---------- | -------------------- |
| `/graphql` | 60 requests/phút/IP  |
| Other APIs | 200 requests/phút/IP |

**Implementation:** `RateLimitFilter.java` với Bucket4j

---

## 4. Account Lockout

| Condition        | Action        |
| ---------------- | ------------- |
| 5 lần login sai  | Lock 15 phút  |
| Login thành công | Reset counter |

**Fields:** `Users.failedLoginAttempts`, `Users.blockUntil`

---

## 5. Security Headers

| Header                    | Value                           | Purpose              |
| ------------------------- | ------------------------------- | -------------------- |
| X-Frame-Options           | SAMEORIGIN                      | Chống Clickjacking   |
| X-XSS-Protection          | 1; mode=block                   | Chống XSS (legacy)   |
| X-Content-Type-Options    | nosniff                         | Chống MIME sniffing  |
| Referrer-Policy           | strict-origin-when-cross-origin | Limit referrer info  |
| Strict-Transport-Security | max-age=31536000                | Force HTTPS          |
| Content-Security-Policy   | Whitelist sources               | Chống XSS, injection |

---

## 6. CORS Configuration

```java
allowedOrigins: ["http://localhost:5173", "http://domain.com"]
allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
allowCredentials: true
```

---

## 7. Session Management

- **Stateless:** Không tạo server-side sessions
- **JWT-based:** Mỗi request mang token trong header

---

## 8. Input Validation

- GraphQL schema tự validate types
- Service layer validate business logic
- Database constraints (UNIQUE, NOT NULL, FK)

---

## 9. Security Config Files

| File                           | Purpose                     |
| ------------------------------ | --------------------------- |
| `SecurityConfig.java`          | Main security config        |
| `JwtAuthenticationFilter.java` | Validate JWT mỗi request    |
| `RateLimitFilter.java`         | Rate limiting               |
| `PepperBCryptEncoder.java`     | Password hashing            |
| `JwtUtil.java`                 | Token generation/validation |

---

## 10. Database Security

- **Sensitive data:** Passwords hashed, không lưu plaintext
- **Token blacklist:** `InvalidatedTokens` table
- **Soft delete:** `isActive` flag thay vì xóa thật

---

## 11. Known Limitations & Future Improvements

| Item                          | Status          | Priority |
| ----------------------------- | --------------- | -------- |
| Asymmetric keys (RS256)       | Not implemented | Low      |
| Field-level authorization     | Not implemented | Medium   |
| Audit logging                 | Not implemented | Medium   |
| API key for external services | Not implemented | Low      |
