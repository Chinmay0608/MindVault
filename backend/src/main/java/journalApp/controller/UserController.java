package journalApp.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import journalApp.entity.User;
import journalApp.repository.UserRepository;
import journalApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@Tag(name = "User APIs", description = "Read, Update & Delete User")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PutMapping
    public ResponseEntity<?> updateUser(@RequestBody User user) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User userInDb = userService.findByUserName(userName);
        userInDb.setUserName(user.getUserName() != null && !user.getUserName().isEmpty() ? user.getUserName() : userInDb.getUserName());
        userInDb.setEmail(user.getEmail() != null ? user.getEmail() : userInDb.getEmail());
        userInDb.setSentimentAnalysis(user.isSentimentAnalysis());
        userInDb.setLocation(user.getLocation() != null ? user.getLocation() : userInDb.getLocation());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            userInDb.setPassword(user.getPassword());
            userService.saveNewUser(userInDb);
        } else {
            userService.saveUser(userInDb);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteUserById() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        userRepository.deleteByUserName(authentication.getName());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByUserName(userName);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> greeting() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>("Hi " + authentication.getName(), HttpStatus.OK);
    }

}
