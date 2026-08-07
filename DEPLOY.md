# Fucha24 — release pipeline (Mac mini → cPanel Passenger)

## Zasada

`main` i commit SHA są źródłem prawdy. Development korzysta z hostowego `next dev` oraz lokalnej MariaDB w Dockerze. Release build **nigdy** nie korzysta z checkoutu, w którym działa development, ani z jego katalogu `.next`.

Produkcja otrzymuje gotowy release Next standalone. cPanel/Passenger nie uruchamia `npm ci`, `next build` ani migracji podczas startu aplikacji.

## Codzienna praca

1. Zmiana kodu jest od razu widoczna przez Next dev/hot reload.
2. Dla copy wystarcza szybkie potwierdzenie tekstu na stronie.
3. Codex commituję i wypycha wyłącznie zmianę źródłową.
4. To nie uruchamia release builda ani deployu.

`npm run build` jest celowo zablokowane poza izolowanym pipeline'em. Chroni to działający dev server przed nadpisaniem `.next`.

## Jednorazowa konfiguracja produkcji

Na Mac mini utwórz plik `~/.config/fucha24/production.env` z prawami `0600`, kopiując [config/production.env.example](config/production.env.example). Wartości są lokalnymi sekretami i nie trafiają do Git.

W cPanel jednorazowo:

- autoryzuj publiczny klucz `/Users/mini/.ssh/id_ed25519.pub` dla wskazanego konta;
- ustaw Node.js 22, Application root na `FUCHA_PROD_APP_ROOT` i Startup file na `server.js`;
- utrzymaj w Application root nieśledzony `.env.production`;
- upewnij się, że `server.js` z repo jest obecny oraz że katalog `tmp/` jest zapisywalny.

`server.js` jest stałym launcherem Passenger. Ładuje lokalny `.env.production`, a następnie uruchamia `release/server.js`, gdzie `release` jest symlinkiem do `releases/current`.

## Deploy

Po świadomej decyzji o wdrożeniu uruchamiany jest wyłącznie:

```bash
npm run deploy:production
```

Opcjonalnie można wskazać zatwierdzony commit z `origin/main`:

```bash
npm run deploy:production -- --commit COMMIT_SHA
```

Pipeline:

1. Rozwiązuje commit SHA i wymaga, aby był zawarty w `origin/main`.
2. Tworzy tymczasowy, odłączony Git worktree tego SHA.
3. W worktree wykonuje `npm ci`, `npm run check` i produkcyjny build.
4. Zapisuje release standalone z metadanymi SHA w `.release.json` oraz `public/_fucha-release.json`.
5. Wysyła release do osobnego `releases/.<sha>.incoming-*`.
6. Weryfikuje metadane, zmienia katalog na `releases/<sha>` i atomowo przełącza `releases/current`.
7. Restartuje Passenger przez `touch tmp/restart.txt`.
8. Wykonuje Basic-Auth smoke test pliku `_fucha-release.json` i wymaga zgodności SHA.

W razie nieudanego smoke testu pipeline przełącza poprzedni `current` i ponownie restartuje Passenger. Release'y nie są automatycznie usuwane przez pierwszą wersję pipeline'u.

## Test lokalny pipeline'u

Poniższa komenda wykonuje pełny clean build i walidację artefaktu, ale nie odczytuje profilu, nie łączy się z produkcją i niczego nie wdraża:

```bash
npm run deploy:production -- --dry-run
```

## Migracje

Obecna wersja pipeline'u jest świadomie przeznaczona wyłącznie dla deployów bez migracji DB. Jeśli w commicie pojawi się `prisma/migrations`, deploy zatrzyma się przed połączeniem z produkcją.

Prisma baseline i `prisma migrate deploy` zostaną dodane osobno, po świadomej decyzji. Pipeline nigdy nie użyje `prisma db push`, resetu ani migracji podczas startu Passenger.

## Rollback

Pipeline wykonuje rollback automatycznie po błędzie smoke testu. Ręczny rollback to przełączenie `releases/current` na poprzedni release i `touch tmp/restart.txt`.

Rollback kodu nie cofa schematu DB; dlatego przyszłe migracje muszą być kompatybilne wstecz albo mieć osobną, zatwierdzoną procedurę.
