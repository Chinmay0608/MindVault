package journalApp.service;

import lombok.extern.slf4j.Slf4j;
import journalApp.entity.UserAccount;
import journalApp.repository.AccountRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public boolean saveNewUser(UserAccount user) {
        try {
            if (user.getUserName() != null) {
                user.setUserName(user.getUserName().toLowerCase().trim());
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRoles(Arrays.asList("USER"));
            accountRepository.save(user);
            return true;
        } catch (Exception e) {
            log.error("Failed to save new user context: {}", e.getMessage());
            return false;
        }
    }

    public void saveAdmin(UserAccount user) {
        if (user.getUserName() != null) {
            user.setUserName(user.getUserName().toLowerCase().trim());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("USER", "ADMIN"));
        accountRepository.save(user);
    }

    public void saveUser(UserAccount user) {
        if (user.getUserName() != null) {
            user.setUserName(user.getUserName().toLowerCase().trim());
        }
        accountRepository.save(user);
    }

    public List<UserAccount> getAll() {
        return accountRepository.findAll();
    }

    public Optional<UserAccount> findById(ObjectId id) {
        return accountRepository.findById(id);
    }

    public void deleteById(ObjectId id) {
        accountRepository.deleteById(id);
    }

    public UserAccount findByUserName(String userName) {
        if (userName != null) {
            userName = userName.toLowerCase().trim();
        }
        return accountRepository.findByUserName(userName);
    }
}
