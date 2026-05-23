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

4. **Authentication** - Implement JWT-based auth

## Environment Variables

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`
- `LLM_PROVIDER` - Currently supports: `openai`
- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `JWT_SECRET`, `JWT_EXPIRATION`
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - `development` or `production`
