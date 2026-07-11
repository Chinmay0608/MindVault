package com.chinmay.journalapp.cache;

import com.chinmay.journalapp.entity.AppUserConfig;
import com.chinmay.journalapp.repository.AppUserConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.*;

@Component
public class AppCache {

    public enum keys{
        WEATHER_API;
    }

    @Autowired
    private AppUserConfigRepository configJournalAppRepository;

    public Map<String, String> appCache;

    @PostConstruct
    public void init(){
        appCache = new HashMap<>();
        List<AppUserConfig> all = configJournalAppRepository.findAll();
        for (AppUserConfig configJournalAppEntity : all) {
            appCache.put(configJournalAppEntity.getKey(), configJournalAppEntity.getValue());
        }
    }

}



