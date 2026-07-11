package journalApp.config;

import journalApp.entity.UserAccount;
import journalApp.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class UsernameMigration implements CommandLineRunner {

    @Autowired
    private AccountRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            List<UserAccount> users = userRepository.findAll();
            for (UserAccount user : users) {
                if (user.getUserName() != null) {
                    String original = user.getUserName();
                    String normalized = original.toLowerCase().trim();
                    if (!original.equals(normalized)) {
                        user.setUserName(normalized);
                        userRepository.save(user);
                        System.out.println("Migrated database username to lowercase: " + original + " -> " + normalized);
                    }
                }
            }
        } catch (Exception e) {
            // Suppress migration errors on read-only/missing connection states
        }
    }
}
