package com.chinmay.journalapp.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import com.chinmay.journalapp.cache.AppCache;
import com.chinmay.journalapp.entity.UserAccount;
import com.chinmay.journalapp.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Administrative control plane managing system-wide accounts and platform cache.
 * I designed this to protect administrative routes behind key-restricted execution checks.
 */
@RestController
@RequestMapping({"/admin", "/api/admin"})
@Tag(name = "Admin APIs")
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
public class ManagementController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private AppCache appCache;

    /**
     * Obtains list of all registered accounts.
     * I implemented this to let administrators oversee all users on the platform.
     *
     * @return response entity containing list of user accounts, or NOT_FOUND if empty
     */
    @GetMapping({"/all-users", "/users"})
    public ResponseEntity<?> getAllUsers() {
        List<UserAccount> all = accountService.getAll();
        if (all != null && !all.isEmpty()) {
            return new ResponseEntity<>(all, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    /**
     * Provisions a new administrator account.
     * I designed this to expand management operations securely.
     *
     * @param user the account details of the new admin user
     */
    @PostMapping("/create-admin-user")
    public void createUser(@RequestBody UserAccount user) {
        accountService.saveAdmin(user);
    }

    /**
     * Purges and synchronizes local application caches.
     * I created this to force update system values manually.
     */
    @GetMapping("clear-app-cache")
    public void clearAppCache(){
        appCache.init();
    }
}
