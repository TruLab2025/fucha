# Fucha24 — release pipeline (Mac mini → cPanel Passenger)

## Zasada

`main` i commit SHA są źródłem prawdy. Development korzysta z hostowego `next dev` oraz lokalnej MariaDB w Dockerze. Release build powstaje wyłącznie w Dockerze na Mac mini, z czystego `git archive` wskazanego SHA. Nie montuje checkoutu developmentu, jego `.next` ani lokalnej bazy.

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
2. Tworzy czysty kontekst Docker z `git archive` tego SHA; niezatwierdzone lokalne pliki nie mogą wejść do builda.
3. Odczytowo sprawdza `uname -m` na serwerze i wybiera zgodną platformę Docker (`linux/amd64` albo `linux/arm64`).
4. W Dockerze Node 22 wykonuje `npm ci`, TypeScript check i produkcyjny build.
5. Zapisuje release standalone z metadanymi SHA w `.release.json` oraz `public/_fucha-release.json`.
6. Wysyła release do osobnego `releases/.<sha>.incoming-*`.
7. Weryfikuje metadane, zmienia katalog na `releases/<sha>` i atomowo przełącza `releases/current`.
8. Restartuje Passenger przez `touch tmp/restart.txt`.
9. Wykonuje Basic-Auth smoke test pliku `_fucha-release.json` i wymaga zgodności SHA.

W razie nieudanego smoke testu pipeline przełącza poprzedni `current` i ponownie restartuje Passenger. Release'y nie są automatycznie usuwane przez pierwszą wersję pipeline'u.

## Test lokalny pipeline'u

Poniższa komenda wykonuje pełny clean Docker build dla lokalnej architektury i walidację artefaktu, ale nie odczytuje profilu, nie łączy się z produkcją i niczego nie wdraża:

```bash
npm run deploy:production -- --dry-run
```

Do testu innej platformy można jawnie użyć `--platform linux/amd64` albo `--platform linux/arm64`. Właściwy deploy nigdy nie przyjmuje platformy w argumencie: odczytuje ją z cPanel przed buildem.

## Migracje

Obecna wersja pipeline'u jest świadomie przeznaczona wyłącznie dla deployów bez migracji DB. Jeśli w commicie pojawi się `prisma/migrations`, deploy zatrzyma się przed połączeniem z produkcją.

Prisma baseline i `prisma migrate deploy` zostaną dodane osobno, po świadomej decyzji. Pipeline nigdy nie użyje `prisma db push`, resetu ani migracji podczas startu Passenger.

## Rollback

Pipeline wykonuje rollback automatycznie po błędzie smoke testu. Ręczny rollback to przełączenie `releases/current` na poprzedni release i `touch tmp/restart.txt`.

Rollback kodu nie cofa schematu DB; dlatego przyszłe migracje muszą być kompatybilne wstecz albo mieć osobną, zatwierdzoną procedurę.
