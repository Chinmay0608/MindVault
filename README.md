# MindVault — AI-Powered Journal Management System

![Java](https://img.shields.io/badge/Java_17-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=flat&logo=spring-boot&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_Flash_API-8B5CF6?style=flat&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=flat&logo=apache-kafka&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![CI](https://github.com/Chinmay0608/journalApp/actions/workflows/ci.yml/badge.svg)

MindVault is a secure, AI-powered journal management backend built with Java 17 and Spring Boot 3.
Users can create private journal entries that are asynchronously analyzed by Google Gemini Flash API
to generate mood sentiment scores (POSITIVE / NEGATIVE / NEUTRAL), delivered via an Apache Kafka pipeline.

## Features

- JWT-based authentication with role-based access control (USER / ADMIN)
- Full CRUD for personal journal records
- Asynchronous AI sentiment analysis via Google Gemini Flash 2.0 API
- Apache Kafka event pipeline for non-blocking mood processing
- Local lexicon fallback when Gemini API is unavailable
- Redis caching for session and frequently accessed data
- Weekly mood trend analytics endpoint
- Journal entry search and tag filtering
- Streak tracking — consecutive days journaled
- CORS configuration, input validation, global exception handling
- CI/CD via GitHub Actions

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3, Spring Security |
| Database | MongoDB |
| Cache | Redis |
| Message Queue | Apache Kafka |
| AI | Google Gemini Flash 2.0 API |
| Auth | JWT, BCrypt |
| DevOps | GitHub Actions CI/CD |

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | Public | Register new account |
| POST | /api/auth/login | Public | Login, returns JWT token |
| GET | /api/entries | USER | Get all journal records |
| POST | /api/entries | USER | Create journal entry |
| GET | /api/entries/{id} | USER | Get single entry |
| PUT | /api/entries/{id} | USER | Update entry |
| DELETE | /api/entries/{id} | USER | Delete entry |
| GET | /api/entries/{id}/mood | USER | Get AI sentiment for entry |
| GET | /api/entries/search?q= | USER | Search entries by keyword |
| GET | /api/analytics/mood-trend | USER | Weekly mood summary |
| GET | /api/analytics/streak | USER | Journaling streak count |
| GET | /api/admin/accounts | ADMIN | Get all user accounts |

## Getting Started

### Prerequisites
- Java 17+
- MongoDB (local or Atlas)
- Redis (optional)
- Apache Kafka (optional — sentiment falls back to lexicon)
- Google Gemini API key (free tier at aistudio.google.com)

### Setup
```bash
git clone https://github.com/Chinmay0608/journalApp.git
cd journalApp
cp .env.example .env
# Fill in your values in .env
mvn spring-boot:run
```

## Architecture

```
Client → Spring Boot REST API → MongoDB
              ↓
        Kafka Producer
              ↓
        Kafka Consumer
              ↓
    Gemini Flash 2.0 API → Mood Score → MongoDB
    (fallback: Local Lexicon)
              ↓
        Redis Cache
```

## Author

**Chinmay Maheshwari**
[LinkedIn](https://linkedin.com/in/chinmay8064) | [GitHub](https://github.com/Chinmay0608)
