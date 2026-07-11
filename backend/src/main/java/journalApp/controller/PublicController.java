package journalApp.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import journalApp.dto.UserDTO;
import journalApp.entity.UserAccount;
import journalApp.service.UserDetailsServiceImpl;
import journalApp.service.AccountService;
import journalApp.utilis.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/public", "/api/auth"})
@Slf4j
@Tag(name = "Public APIs")
public class PublicController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    @Autowired
    private AccountService accountService;

    @Autowired
    private journalApp.repository.AccountRepository accountRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private journalApp.service.RefreshTokenService refreshTokenService;

    @Autowired
    private journalApp.service.FirebaseAuthService firebaseAuthService;

    @GetMapping("/health-check")
    public String healthCheck() {
        log.info("Health is ok !");
        return "Ok";
    }

    @PostMapping("/firebase-login")
    public ResponseEntity<?> firebaseLogin(@RequestBody java.util.Map<String, String> request, jakarta.servlet.http.HttpServletResponse response) {
        try {
            String idToken = request.get("idToken");
            if (idToken == null || idToken.isEmpty()) {
                return new ResponseEntity<>(java.util.Map.of("message", "ID Token is missing"), HttpStatus.BAD_REQUEST);
            }
            
            io.jsonwebtoken.Claims claims = firebaseAuthService.verifyIdToken(idToken);
            String email = claims.get("email", String.class);
            
            if (email == null || email.isEmpty()) {
                return new ResponseEntity<>(java.util.Map.of("message", "Email claim is missing in Firebase token"), HttpStatus.BAD_REQUEST);
            }
            
            String normalizedUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
            
            UserAccount user = accountRepository.findByEmail(email);
            if (user == null) {
                if (accountService.findByUserName(normalizedUsername) != null) {
                    normalizedUsername += "_" + (int)(Math.random() * 1000);
                }
                
                user = new UserAccount();
                user.setEmail(email);
                user.setUserName(normalizedUsername);
                user.setPassword(java.util.UUID.randomUUID().toString());
                user.setSentimentAnalysis(true);
                accountService.saveNewUser(user);
            }
            
            String jwt = jwtUtil.generateToken(user.getUserName());
            journalApp.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUserName());
            
            org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("refreshToken", refreshToken.getToken())
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();
            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
            
            return new ResponseEntity<>(java.util.Map.of(
                "token", jwt,
                "userName", user.getUserName()
            ), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Firebase Login authentication failed", e);
            return new ResponseEntity<>(java.util.Map.of("message", "Firebase authentication failed"), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@jakarta.validation.Valid @RequestBody UserDTO user) {
        String normalizedUsername = user.getUserName().toLowerCase().trim();
        if (accountService.findByUserName(normalizedUsername) != null) {
            return new ResponseEntity<>(java.util.Map.of("message", "Username already taken"), HttpStatus.CONFLICT);
        }
        if (user.getEmail() != null && accountRepository.findByEmail(user.getEmail().trim()) != null) {
            return new ResponseEntity<>(java.util.Map.of("message", "Email already registered"), HttpStatus.CONFLICT);
        }

        UserAccount newUser = new UserAccount();
        newUser.setEmail(user.getEmail().trim());
        newUser.setUserName(normalizedUsername);
        newUser.setPassword(user.getPassword());
        newUser.setSentimentAnalysis(user.isSentimentAnalysis());
        boolean saved = accountService.saveNewUser(newUser);
        if (saved) {
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(java.util.Map.of("message", "Failed to save user"), HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserAccount user, jakarta.servlet.http.HttpServletResponse response) {
        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUserName(), user.getPassword()));
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUserName());
            String jwt = jwtUtil.generateToken(userDetails.getUsername());
            
            journalApp.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getUsername());
            
            org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("refreshToken", refreshToken.getToken())
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();
            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
            
            return new ResponseEntity<>(java.util.Map.of("token", jwt), HttpStatus.OK);
        }catch (Exception e){
            log.error("Authentication failed for user: {}", user.getUserName(), e);
            return new ResponseEntity<>(java.util.Map.of("message", "Incorrect username or password"), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(jakarta.servlet.http.HttpServletRequest request) {
        String token = null;
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        
        if (token == null) {
            return new ResponseEntity<>(java.util.Map.of("message", "Refresh token is missing"), HttpStatus.BAD_REQUEST);
        }

        try {
            return refreshTokenService.findByToken(token)
                    .map(refreshTokenService::verifyExpiration)
                    .map(journalApp.entity.RefreshToken::getUsername)
                    .map(username -> {
                        String accessToken = jwtUtil.generateToken(username);
                        return ResponseEntity.ok(java.util.Map.of("token", accessToken));
                    })
                    .orElseGet(() -> new ResponseEntity<>(java.util.Map.of("message", "Refresh token not found"), HttpStatus.BAD_REQUEST));
        } catch (Exception ex) {
            return new ResponseEntity<>(java.util.Map.of("message", ex.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response) {
        String token = null;
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token != null) {
            refreshTokenService.deleteByToken(token);
        }
        
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(java.util.Map.of("message", "Logged out successfully"));
    }
}
