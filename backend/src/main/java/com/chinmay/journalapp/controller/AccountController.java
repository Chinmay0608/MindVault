package com.chinmay.journalapp.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import com.chinmay.journalapp.entity.UserAccount;
import com.chinmay.journalapp.repository.AccountRepository;
import com.chinmay.journalapp.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller managing personal user profile and account operations.
 * I developed these endpoints to enable secure modifications to user settings.
 */
@RestController
@RequestMapping("/user")
@Tag(name = "User APIs", description = "Read, Update & Delete User")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountRepository accountRepository;

    /**
     * Updates profile details of the authenticated account.
     * I designed this to check credentials and conditionally encrypt new passwords.
     *
     * @param user updated data values
     * @return NO_CONTENT status on success
     */
    @PutMapping
    public ResponseEntity<?> updateUser(@RequestBody UserAccount user) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        UserAccount userInDb = accountService.findByUserName(userName);
        userInDb.setUserName(user.getUserName() != null && !user.getUserName().isEmpty() ? user.getUserName() : userInDb.getUserName());
        userInDb.setEmail(user.getEmail() != null ? user.getEmail() : userInDb.getEmail());
        userInDb.setSentimentAnalysis(user.isSentimentAnalysis());
        userInDb.setLocation(user.getLocation() != null ? user.getLocation() : userInDb.getLocation());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            userInDb.setPassword(user.getPassword());
            accountService.saveNewUser(userInDb);
        } else {
            accountService.saveUser(userInDb);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * Deletes the currently authenticated user account.
     * I implemented this to purge user records cleanly from MongoDB.
     *
     * @return NO_CONTENT status on successful deletion
     */
    @DeleteMapping
    public ResponseEntity<?> deleteUserById() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        accountRepository.deleteByUserName(authentication.getName());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * Retrieves the profile info of the authenticated user.
     * I structured this to fetch current database statistics securely.
     *
     * @return response entity containing profile data
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        UserAccount user = accountService.findByUserName(userName);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    /**
     * Basic personalized verification greeting.
     * I added this to verify login state and roles.
     *
     * @return greeting string
     */
    @GetMapping
    public ResponseEntity<?> greeting() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>("Hi " + authentication.getName(), HttpStatus.OK);
    }
}
