package journalApp;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableTransactionManagement
@EnableScheduling
public class JournalApplication {
    public static void main(String[] args) {
        SpringApplication.run(JournalApplication.class, args);
    }

    @Bean
    @org.springframework.context.annotation.Profile("!local")
    public PlatformTransactionManager mongoTransactionManager(MongoDatabaseFactory dbFactory){
        return new MongoTransactionManager(dbFactory);
    }

    @Bean
    @org.springframework.context.annotation.Profile("local")
    public PlatformTransactionManager localTransactionManager() {
        return new org.springframework.transaction.support.AbstractPlatformTransactionManager() {
            @Override
            protected Object doGetTransaction() {
                return new Object();
            }
            @Override
            protected void doBegin(Object transaction, org.springframework.transaction.TransactionDefinition definition) {}
            @Override
            protected void doCommit(org.springframework.transaction.support.DefaultTransactionStatus status) {}
            @Override
            protected void doRollback(org.springframework.transaction.support.DefaultTransactionStatus status) {}
        };
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }


}
