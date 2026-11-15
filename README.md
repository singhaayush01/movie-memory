# Movie Memory

Movie Memory is a small full-stack app for saving your favorite movie and getting an interesting fact about it.

Sign in with Google, add the movie you always come back to, and it will be saved to your account. The dashboard also lets you edit the movie and ask for another fact.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS |
| Authentication | Google OAuth with NextAuth |
| Database | PostgreSQL |
| ORM | Prisma |
| AI | OpenAI API |
| Tests | Vitest |

## Features

- Google sign-in and sign-out
- First-time onboarding to save a favorite movie
- Dashboard with Google profile information and saved movie
- Movie facts generated with OpenAI and stored in Postgres
- Inline movie editing with Save and Cancel
- Optimistic movie update with rollback when the API request fails
- Typed API client with a consistent error shape
- 30-second client-side fact cache, with a button to request a new fact
- Fact cache is cleared after the favorite movie changes

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/singhaayush01/movie-memory.git
cd movie-memory
git checkout variant-b-implementation
npm install
```

Use Node.js 20.19 or newer.

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Fill in the values:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXTAUTH_SECRET` | Secret used to sign/encrypt NextAuth data |
| `NEXTAUTH_URL` | App URL, normally `http://localhost:3000` locally |
| `OPENAI_API_KEY` | Server-side OpenAI API key |
| `OPENAI_MODEL` | Optional model name; defaults to `gpt-4o-mini` |

Do not commit your real `.env` file. The OpenAI key is only read by the server and is not exposed through a `NEXT_PUBLIC_` variable.

### 3. Set up Google OAuth

In Google Cloud Console, create an OAuth 2.0 Client ID for a Web application.

For local development, add this authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Copy the client ID and client secret into `.env`.

### 4. Set up PostgreSQL

Create a PostgreSQL database with your provider (for example, a local Postgres instance or a hosted Postgres database).

Add its connection string as `DATABASE_URL`, then run:

```bash
npx prisma generate
npx prisma migrate dev
```

The initial migration is included under `prisma/migrations`. To apply committed migrations in a deployment environment, use:

```bash
npx prisma migrate deploy
```

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

The app uses the Next.js App Router for both the frontend and the API. The browser does not connect directly to PostgreSQL or OpenAI.

```text
Browser
  |
  | Next.js pages + typed lib/api.ts
  v
Next.js API routes
  |                  |
  | NextAuth session | OpenAI API (server only)
  v                  |
Prisma ORM           |
  |                  |
  v                  |
PostgreSQL <---------+
```

### Authentication and user data

NextAuth handles Google OAuth and uses the Prisma adapter to save the user, linked Google account, and database session. Protected pages and API routes call Auth.js `auth()` before reading or changing user data.

The `User` record contains the user's `favoriteMovie`. The `Fact` table stores generated facts with the owning user ID and the movie title used to generate each fact. A fact is always created with the authenticated session's user ID; the API does not accept a user ID from the browser.

### API contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/me` | Return the signed-in profile and favorite movie |
| PUT | `/api/me/movie` | Validate and update the signed-in user's movie |
| GET | `/api/fact` | Generate and store a fact for the signed-in user's movie |

API errors use one shape:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Please sign in to continue."
  }
}
```

The client wrapper in `lib/api.ts` reads this response and throws an `ApiError` with a status, code, and message. Components can show a useful message without duplicating response parsing.

### Variant B: Client orchestration

I chose Variant B because it puts the focus on the API contract and how the frontend handles asynchronous work.

- **Typed API layer:** request and response types live in `lib/api.ts`. Requests use the same credentials, JSON headers, and error handling.
- **Optimistic edit:** when Save is clicked, the dashboard displays the new title immediately. If the request fails, `saveMovieOptimistically` restores the previous title.
- **Fact cache:** the dashboard keeps the last fact and the time it was received in React state. A fact is reused for 30 seconds. The "Give me another fact" button bypasses that cache.
- **Cache invalidation:** after a movie update succeeds, the old fact and its timestamp are cleared so the next fact is about the updated movie.

The cache is intentionally scoped to the current browser tab and user. It is only reused when it belongs to the currently saved movie, is less than 30 seconds old, and has a valid timestamp. It is cleared after the movie is changed, and a new fact request bypasses it. A request counter also prevents an older fact response from replacing the result for a newer movie.

## Security and Validation

- Movie titles are trimmed and checked on the server (1 to 120 characters).
- Each protected route gets the user ID from the server-side session.
- Database reads and writes are scoped to that authenticated user.
- The browser never receives database credentials or the OpenAI API key.
- The UI has fallback text when Google does not return a name or profile photo.

## Tests

Run:

```bash
npm test
```

The small test suite covers:
- API client handling for unauthorized and server-error responses.
- Optimistic movie editing when the API succeeds and when it fails.

Also run the TypeScript check:

```bash
npm run typecheck
```

## AI Usage

- I used AI assistance to review the requirements and plan the project structure.
- I used it to help draft and review parts of the implementation and tests.
- I reviewed the code and README and will verify the setup and behavior locally before submission.

## Tradeoffs and Next Steps

I kept the app to one saved favorite movie per user and a small dashboard. The client cache uses session storage instead of adding a data-fetching library because the cache requirement is only one value with a short time window.

With two more hours, I would add stronger end-to-end tests for the Google sign-in and onboarding flow, improve the fact-generation failure experience by showing the last saved fact, and add a small deployment guide for a hosted PostgreSQL database and Vercel.
