# Fucha24

Minimalny MVP marketplace do publikowania krótkich zleceń bez systemu kont.

## Stack
- Frontend: Next.js 14 + TypeScript + TailwindCSS
- Backend: Next.js API routes (app router /api/*)
- DB: Supabase PostgreSQL (jedna tabela `listings`)
- Email: SMTP / Resend (nodemailer placeholder)
- Deployment: Vercel

## Struktura

```
app/
  page.tsx
  jobs/
     page.tsx
  add/
     page.tsx
components/
  JobCard.tsx
  JobForm.tsx
  ContactModal.tsx
lib/
  db.ts
  email.ts
api/
  jobs/create/route.ts
  jobs/list/route.ts
  contact/send/route.ts
```

## Baza danych (Supabase)
Tabela `listings`:
- id uuid primary key
- title text
- description text
- city text
- category text
- available_date date
- rate text
- phone text
- email text
- created_at timestamp default now()

## Środowisko
Ustaw zmienne w `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=no-reply@fucha24.com
```

## Uruchamianie
```bash
npm install
npm run dev
```

## Dalsza rozbudowa
- dodanie kont użytkowników
- prosty system weryfikacji po numerze telefonu (kod SMS) by utrudnić spam; implementacja w `api/verify` generuje kod i trzeba go wpisać przed wysłaniem ogłoszenia (kod jest logowany na serwerze)
- limit zapytań, płatności
- filtrowanie, sortowanie
```
