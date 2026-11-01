package com.campusnotify.config;

import com.campusnotify.entity.Role;
import com.campusnotify.entity.RoleType;
import com.campusnotify.entity.User;
import com.campusnotify.repository.RoleRepository;
import com.campusnotify.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed all standard roles
        for (RoleType type : RoleType.values()) {
            if (roleRepository.findByName(type).isEmpty()) {
                roleRepository.save(new Role(type));
            }
        }

        // Seed default system admin if not present
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName(RoleType.ADMIN).orElseThrow();
            Role facultyRole = roleRepository.findByName(RoleType.FACULTY).orElseThrow();

            User admin = User.builder()
                    .username("admin")
                    .email("admin@campusnotify.edu")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .fullName("CampusNotify System Administrator")
                    .department("ADMIN")
                    .prn("ADMIN-001")
                    .rollNo("00")
                    .phone("9876543210")
                    .parentPhone("9876543211")
                    .parentPhoneVerified(true)
                    .roles(Set.of(adminRole, facultyRole))
                    .build();

            userRepository.save(admin);
            log.info("Default administrator seeded: admin / Admin@12345");
        }
    }
}
