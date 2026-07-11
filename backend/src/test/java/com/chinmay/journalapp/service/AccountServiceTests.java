package com.chinmay.journalapp.service;

import com.chinmay.journalapp.entity.UserAccount;
import com.chinmay.journalapp.repository.AccountRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ArgumentsSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AccountServiceTests {

    @Autowired
    private AccountRepository userRepository;

    @Autowired
    private AccountService userService;

    @Disabled
    @ParameterizedTest
    @ArgumentsSource(AccountArgumentsProvider.class)
    public void testSaveNewUser(UserAccount user) {
        assertTrue(userService.saveNewUser(user));
    }

    @Disabled
    @ParameterizedTest
    @CsvSource({
            "1,1,2",
            "2,10,12",
            "3,3,9"
    })
    public void test(int a, int b, int expected){
        assertEquals(expected, a + b);
    }
}



