package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<Users, UUID> {
    Optional<Users> findByEmail(String email);
    
    @Query("SELECT u FROM Users u JOIN FETCH u.role WHERE u.email = :email")
    Optional<Users> findByEmailWithRole(@Param("email") String email);
    
    boolean existsByEmail(String email);
    Page<Users> findByRole_RoleName(String roleName, Pageable pageable);
    long countByRole_RoleName(String roleName);
}