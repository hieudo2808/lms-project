# 🔧 Hướng dẫn Clear Cache & Fix Common Issues

## 🚨 Lỗi: Navbar hiển thị user cũ khi chưa đăng nhập

**Nguyên nhân:** LocalStorage còn lưu token và user cũ từ session trước

**Cách fix:**

### Option 1: Clear qua Developer Tools (Khuyến nghị)
1. Mở **Developer Tools** (F12)
2. Vào tab **Application** (hoặc **Storage** trong Firefox)
3. Sidebar bên trái → **Local Storage** → `http://localhost:5173`
4. Tìm key `auth-store` → Click chuột phải → **Delete**
5. Refresh trang (F5)

### Option 2: Clear qua Console
1. Mở **Developer Tools** (F12)
2. Vào tab **Console**
3. Gõ lệnh:
```javascript
localStorage.clear();
location.reload();
```

### Option 3: Click Logout
- Nếu đang thấy user cũ ở navbar, click vào avatar → **Đăng xuất**
- Hệ thống sẽ tự động clear localStorage

---

## ✅ Các thay đổi đã fix

### 1. Navbar Avatar Update Realtime ✨
- **Trước:** Avatar không cập nhật sau khi thay đổi trong Profile Settings
- **Sau:** Navbar tự động query GET_ME và cập nhật avatar mỗi lần render
- **Cách test:**
  1. Đăng nhập
  2. Vào Dashboard → Cài đặt tài khoản
  3. Thay đổi Avatar URL
  4. Click "Lưu thay đổi"
  5. ✅ Avatar ở navbar sẽ tự động cập nhật

### 2. Course Level Filter Fix 🔍
- **Trước:** Click "Cơ bản", "Trung bình", "Nâng cao" đều hiển thị "Chưa tìm thấy khóa học"
- **Sau:** Filter hoạt động đúng với case-insensitive comparison
- **Backend format:** `Beginner`, `Intermediate`, `Advanced` (chữ hoa đầu)
- **Frontend param:** `beginner`, `intermediate`, `advanced` (chữ thường)
- **Solution:** Auto-capitalize level param và compare case-insensitive

### 3. User State Sync 🔄
- **Trước:** User data chỉ lưu trong localStorage, không sync với backend
- **Sau:** 
  - GET_ME query chạy mỗi khi vào app (nếu có token)
  - User data sync với backend realtime
  - Store tự động update khi có data mới

---

## 🧪 Test Checklist

### Test Login Flow
- [ ] Clear localStorage
- [ ] Vào trang chủ → Không thấy user ở navbar
- [ ] Click "Đăng nhập"
- [ ] Login với email/password
- [ ] ✅ Redirect về trang trước, navbar hiển thị đúng user

### Test Avatar Update
- [ ] Login thành công
- [ ] Vào `/dashboard/settings`
- [ ] Nhập Avatar URL mới
- [ ] Click "Lưu thay đổi"
- [ ] ✅ Avatar navbar cập nhật ngay lập tức

### Test Course Filtering
- [ ] Vào `/courses` (hoặc click "Khám phá" → "Tất cả khóa học")
- [ ] ✅ Thấy danh sách tất cả khóa học
- [ ] Click "Khám phá" → "Cơ bản"
- [ ] ✅ Chỉ thấy các khóa học level "Beginner"
- [ ] Click "Khám phá" → "Trung bình"
- [ ] ✅ Chỉ thấy các khóa học level "Intermediate"
- [ ] Click "Khám phá" → "Nâng cao"
- [ ] ✅ Chỉ thấy các khóa học level "Advanced"

### Test Logout
- [ ] Login vào hệ thống
- [ ] Click avatar ở navbar
- [ ] Click "🚪 Đăng xuất"
- [ ] ✅ Redirect về /login
- [ ] ✅ Navbar không còn hiển thị user
- [ ] ✅ localStorage được clear

---

## 📝 Technical Details

### Files Modified

1. **Navbar.tsx**
   - Added `useQuery(GET_ME_QUERY)` với `cache-and-network` policy
   - Auto-sync user data từ query vào store
   - Level capitalization trong handleExplore()

2. **HomePage.tsx**
   - Case-insensitive level filtering
   - Support cả "beginner" và "Beginner" format

3. **store.ts**
   - Added `updateUser()` method
   - Maintain both `setAuth()` và `updateUser()`

### Query Policy
```typescript
useQuery(GET_ME_QUERY, {
  skip: !token,
  fetchPolicy: 'cache-and-network'
})
```
- `cache-and-network`: Return cache first, then refetch
- Đảm bảo UI responsive nhưng vẫn có data mới nhất

---

## 🐛 Troubleshooting

### Vẫn thấy user cũ sau khi logout?
→ Hard refresh: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)

### Avatar không đổi sau khi update?
→ Check console xem có error không
→ Verify avatar URL có valid không (test bằng cách mở URL trực tiếp)

### Filter không hoạt động?
→ Check backend có course với level tương ứng không
→ Mở Developer Tools → Network → Xem response của getAllCourses
→ Verify level field có đúng format "Beginner"/"Intermediate"/"Advanced"

---

## 💡 Best Practices

1. **Luôn clear localStorage khi test authentication flow**
2. **Sử dụng cache-and-network cho user data** (realtime update)
3. **Case-insensitive comparison cho string filters**
4. **Capitalize level params khi gửi lên URL** (consistent với backend)

