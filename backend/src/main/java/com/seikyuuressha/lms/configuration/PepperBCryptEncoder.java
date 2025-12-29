package com.seikyuuressha.lms.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PepperBCryptEncoder implements PasswordEncoder {
    private final BCryptPasswordEncoder passwordEncoder;
    @Value("${security.pepper}")
    private String pepper;

    public PepperBCryptEncoder(int strength) {
        this.passwordEncoder = new BCryptPasswordEncoder(strength);
    }

    @Override
    public String encode(CharSequence rawPassword) {
        return passwordEncoder.encode(rawPassword + pepper);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword + pepper, encodedPassword);
    }
}
