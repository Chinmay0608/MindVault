package com.chinmay.journalapp.service;

import lombok.extern.slf4j.Slf4j;
import com.chinmay.journalapp.entity.UserAccount;
import com.chinmay.journalapp.repository.AccountRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service managing user profiles and security authentication details.
 * I developed this service to handle secure registration, role management, and username normalization.
 */
@Service
@Slf4j
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Creates and saves a new UserAccount.
     * I designed this to enforce lowercase normalized usernames, encrypt password values, and assign default roles.
     *
     * @param user profile parameters of the new account
     * @return boolean state on successful save
     */
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

    /**
     * Provisions a new administrator account.
     * I created this helper to simplify provisioning admins securely.
     *
     * @param user admin account details
     */
    public void saveAdmin(UserAccount user) {
        if (user.getUserName() != null) {
            user.setUserName(user.getUserName().toLowerCase().trim());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("USER", "ADMIN"));
        accountRepository.save(user);
    }

    /**
     * Updates an existing UserAccount without altering roles or password encryption.
     * I designed this for profile updates.
     *
     * @param user existing user details
     */
    public void saveUser(UserAccount user) {
        if (user.getUserName() != null) {
            user.setUserName(user.getUserName().toLowerCase().trim());
        }
        accountRepository.save(user);
    }

    /**
     * Lists all registered user accounts.
     * I added this to help platform admins oversee account statuses.
     *
     * @return list of UserAccount profiles
     */
    public List<UserAccount> getAll() {
        return accountRepository.findAll();
    }

    /**
     * Resolves a user account by database identifier.
     * I developed this to ensure target account existences before query operations.
     *
     * @param id database key
     * @return profile info
     */
    public Optional<UserAccount> findById(ObjectId id) {
        return accountRepository.findById(id);
    }

    /**
     * Permanently deletes a user account.
     * I implemented this to purge profiles on request.
     *
     * @param id database key
     */
    public void deleteById(ObjectId id) {
        accountRepository.deleteById(id);
    }

    /**
     * Searches a UserAccount by normalized username.
     * I engineered this lookup to match lowercase user queries.
     *
     * @param userName search identifier
     * @return matching account profile
     */
    public UserAccount findByUserName(String userName) {
        if (userName != null) {
            userName = userName.toLowerCase().trim();
        }
        return accountRepository.findByUserName(userName);
    }
}
