# Language Learning Backend

NestJS + PostgreSQL backend for the language learning app.

## Quick Start

### Setup

1. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Ensure PostgreSQL is running with the database created:
   ```bash
   createdb language_learning
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

API base path: `/v1`

Swagger docs:
- `/v1/docs`

## Architecture

### Core Components

- **LLM Service** (`src/llm/`) - Abstraction layer for LLM providers
  - Currently implements OpenAI
  - Easy to add more providers (Anthropic, etc.)
  - Handles conversation generation and topic openers

- **Services** (`src/services/`)
  - `ConversationService` - Manages conversations with users
  - `ProfileService` - Manages user learning profiles
  - `ScraperService` - Placeholder for content scraping logic

- **Entities** (`src/entities/`)
  - `User` - User accounts
  - `UserProfile` - Learning preferences per user
  - `Conversation` - Chat history with AI
  - `Content` - Scraped content indexed by interest

### Database Schema

- **users** - User accounts
- **user_profiles** - Language targets and interests
- **conversations** - AI conversation history
- **content** - Indexed content for topic matching

## Next Steps

1. **API Controllers** - Add REST endpoints for:
   - User registration/auth
   - Profile CRUD
   - Conversation management
   - Content discovery

2. **Content Scraping** - Implement `ScraperService`:
   - Route interests to relevant sources
   - Parse and summarize content
   - Deduplicate URLs

3. **Background Jobs** - Add scheduled tasks:
   - Periodic content checking
   - Conversation initiation
   - Notification delivery

4. **Authentication** - Extend auth (Google OAuth + JWT is scaffolded)

## Environment Variables

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`
- `LLM_PROVIDER` - Currently supports: `openai`
- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `JWT_SECRET`, `JWT_EXPIRATION`
- `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRATION`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `REDDIT_DEFAULT_SUBREDDITS` (comma-separated, e.g. `languagelearning,technology,worldnews`)
- `REDDIT_FETCH_LIMIT`, `REDDIT_USER_AGENT`
- `ENABLE_CONTENT_REFRESH`
- `TYPEORM_SYNCHRONIZE`, `TYPEORM_RUN_MIGRATIONS`
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - `development` or `production`

## Topic Source Abstraction

Profiles can now merge direct interests with source-based topics.

Example profile payload shape:

```json
{
  "targetLanguage": "Portuguese",
  "interests": ["football", "history"],
  "topicSources": [
    { "source": "reddit", "items": ["languagelearning", "soccer"] }
  ]
}
```

Resolved topics from Reddit are normalized as `reddit:r/<subreddit>` and merged into `interests`.

## Google OAuth (JWT)

Endpoints:
- `GET /v1/auth/google` - Starts Google OAuth flow
- `GET /v1/auth/google/callback` - Returns access + refresh tokens
- `GET /v1/auth/me` - Protected route using `Authorization: Bearer <token>`
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Revoke refresh token

## Profile and Conversation APIs (Android)

All require JWT bearer token.

Profiles:
- `POST /v1/profiles`
- `GET /v1/profiles`
- `PATCH /v1/profiles/:id/interests`
- `PATCH /v1/profiles/:id/check-frequency`
- `DELETE /v1/profiles/:id`

Conversations:
- `POST /v1/conversations/start`
- `POST /v1/conversations/:id/messages`
- `GET /v1/conversations?page=1&limit=20&status=active`
- `GET /v1/conversations/:id`
- `PATCH /v1/conversations/:id/complete`

## Periodic Content Refresh

When `ENABLE_CONTENT_REFRESH=true`, a background job runs every 10 minutes and fetches Reddit posts for interests starting with `reddit:r/`, then saves new content rows.

## Migrations

A migration scaffold exists in `src/migrations`. Keep synchronize off (`TYPEORM_SYNCHRONIZE=false`) outside local prototyping.
