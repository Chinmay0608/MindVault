package journalApp.service;

import lombok.extern.slf4j.Slf4j;
import journalApp.entity.User;
import journalApp.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class UserService {
    @Autowired
    private UserRepository userRepository;

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public boolean saveNewUser(User user) {
        try {
            if (user.getUserName() != null) {
                user.setUserName(user.getUserName().toLowerCase().trim());
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRoles(Arrays.asList("USER"));
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            log.error("Failed to save new user context: {}", e.getMessage());
            return false;
        }
    }

    public void saveAdmin(User user) {
        if (user.getUserName() != null) {
            user.setUserName(user.getUserName().toLowerCase().trim());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("USER", "ADMIN"));
        userRepository.save(user);
    }

    public void saveUser(User user) {
        if (user.getUserName() != null) {
            user.setUserName(user.getUserName().toLowerCase().trim());
        }
        userRepository.save(user);
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(ObjectId id) {
        return userRepository.findById(id);
    }

    public void deleteById(ObjectId id) {
        userRepository.deleteById(id);
    }

    public User findByUserName(String userName) {
        if (userName != null) {
            userName = userName.toLowerCase().trim();
        }
        return userRepository.findByUserName(userName);
    }
}
