package com.chinmay.journalapp.service;

import com.chinmay.journalapp.entity.UserAccount;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.ArgumentsProvider;

import java.util.stream.Stream;

public class AccountArgumentsProvider implements ArgumentsProvider {
    @Override
    public Stream<? extends Arguments> provideArguments(ExtensionContext extensionContext) throws Exception {
        return Stream.of(
                Arguments.of(UserAccount.builder().userName("ededede").password("shyam").build()),
                Arguments.of(UserAccount.builder().userName("ededed").password("").build())
        );
    }
}



