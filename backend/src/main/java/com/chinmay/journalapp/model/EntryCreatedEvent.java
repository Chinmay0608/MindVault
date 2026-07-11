package com.chinmay.journalapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntryCreatedEvent {
    private String entryId;
    private String content;
}



