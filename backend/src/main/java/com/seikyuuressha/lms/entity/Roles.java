package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Roles")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Roles {
    @Id
    UUID roleId;
    
    @Column(nullable = false, unique = true, length = 50)
    String roleName;

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    List<Users> users;
}
