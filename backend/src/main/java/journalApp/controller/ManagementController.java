package journalApp.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import journalApp.cache.AppCache;
import journalApp.entity.UserAccount;
import journalApp.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/admin", "/api/admin"})
@Tag(name = "Admin APIs")
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
public class ManagementController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private AppCache appCache;

    @GetMapping({"/all-users", "/users"})
    public ResponseEntity<?> getAllUsers() {
        List<UserAccount> all = accountService.getAll();
        if (all != null && !all.isEmpty()) {
            return new ResponseEntity<>(all, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/create-admin-user")
    public void createUser(@RequestBody UserAccount user) {
        accountService.saveAdmin(user);
    }

    @GetMapping("clear-app-cache")
    public void clearAppCache(){
        appCache.init();
    }
}
