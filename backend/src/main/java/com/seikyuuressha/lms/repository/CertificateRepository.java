package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Certificate;
import com.seikyuuressha.lms.entity.Course;
import com.seikyuuressha.lms.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findByUserAndCourse(Users user, Course course);
    Optional<Certificate> findByCertificateCode(String certificateCode);
    List<Certificate> findByUserOrderByIssuedAtDesc(Users user);
    List<Certificate> findByUserAndIsValidOrderByIssuedAtDesc(Users user, Boolean isValid);
}
