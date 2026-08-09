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

## Potwierdzony układ produkcji

- SSH: `atilla@srv3.anyservers.com:2222`
- Passenger Application Root i launcher: `/home6/atilla/repositories/Fucha24/server.js`
- Passenger lifecycle: CloudLinux Node Selector dla `/home6/atilla/repositories/Fucha24`
- Document Root: `/home6/atilla/public_html/fucha24`
- Release root: `/home6/atilla/releases/fucha24`
- Basic Auth istnieje pod `/home6/atilla/.htpasswds/public_html/fucha24`; pipeline używa wyłącznie lokalnych poświadczeń do smoke testu i go nie zmienia.

Istniejący release `c3e5df5b4e27` pozostaje nietknięty. Nie tworzymy nowego Application Root ani nie zmieniamy konfiguracji Passenger.

`/home6/atilla/repositories/Fucha24/server.js` jest stałym launcherem Passenger. Ładuje lokalny `.env.production`, a następnie uruchamia `release/server.js`. Pipeline utrzymuje `release` jako symlink do `/home6/atilla/releases/fucha24/current`; atomowe przełączenie `current` zmienia wersję aplikacji bez zmiany Application Root.

## Jednorazowa konfiguracja produkcji

Na Mac mini utwórz plik `~/.config/fucha24/production.env` z prawami `0600`, kopiując [config/production.env.example](config/production.env.example). Wartości są lokalnymi sekretami i nie trafiają do Git.

Na Mac mini jednorazowo:

- dodaj publiczny klucz `/Users/mini/.ssh/id_ed25519.pub` do istniejącego konta `atilla`;
- utwórz lokalny profil na podstawie szablonu — nie zapisuj go w Git;
- zachowaj istniejący nieśledzony `.env.production` w Application Root.

Nie zmieniaj ustawień Application Root, Startup file, Document Root, Basic Auth ani bazy.

## Deploy

Po świadomej decyzji o wdrożeniu uruchamiany jest wyłącznie:

```bash
npm run deploy:production
```

Opcjonalnie można wskazać zatwierdzony commit z `origin/main`:

```bash
npm run deploy:production -- --commit COMMIT_SHA
```

Teksty smoke testu są opcjonalne. Gdy są podane, pipeline wymaga obecności nowego tekstu i/lub braku starego:

```bash
npm run deploy:production -- --commit COMMIT_SHA \
  --expect-text 'OCZEKIWANY TEKST' \
  --reject-text 'POPRZEDNI TEKST'
```

Pipeline jest deterministyczny i wykonuje dokładnie:

1. PRECHECK — zatwierdzony SHA, konfiguracja i stan symlinków.
2. BUILD — izolowany Docker build z `git archive` SHA.
3. PRISMA — tymczasowy tunel SSH, status i kontrola historii. Przy pending migrations pipeline tworzy dump w `/Users/mini/Backups/Fucha24`, wykonuje `prisma migrate deploy`, a potem wymaga aktualnego statusu i pustego diffu. Bez pending migrations backup i migracja są pomijane.
4. UPLOAD — istniejący katalog `releases/<sha>` jest ponownie używany wyłącznie po walidacji `.release.json`, `server.js`, `.next` i `.next/static`; uszkodzony release kończy deploy przed aktywacją.
5. ACTIVATE — atomowo przełącza `releases/current` i `APP_ROOT/release` na ten sam release.
6. TERMINATE OLD RELEASE PROCESSES — wyłącznie procesy, których fizyczny `/proc/<pid>/cwd` nadal jest dokładnie poprzednim katalogiem release.
7. COLD START — CloudLinux Node Selector dla istniejącego `APP_ROOT`, bez `tmp/restart.txt`.
8. HTTPS SMOKE i VERIFY PROCESS CWD.

Pipeline nie wykonuje automatycznego rollbacku ani dodatkowej diagnostyki. Kończy się jednoznacznie `RESULT: FAIL`, ze `STAGE` i `REASON`; osobne zadanie diagnozuje błąd. Release'y nie są automatycznie usuwane.

## Test lokalny pipeline'u

Poniższa komenda wykonuje pełny clean Docker build dla lokalnej architektury i walidację artefaktu, ale nie odczytuje profilu, nie łączy się z produkcją i niczego nie wdraża:

```bash
npm run deploy:production -- --dry-run
```

Do testu innej platformy można jawnie użyć `--platform linux/amd64` albo `--platform linux/arm64`. Właściwy deploy nigdy nie przyjmuje platformy w argumencie: odczytuje ją z cPanel przed buildem.

Bez Docker i bez kontaktu z produkcją można sprawdzić dokładne dopasowanie procesów po CWD:

```bash
node scripts/deploy-production.mjs --self-test
```

## Migracje

Prisma migrations są obsługiwane przed aktywacją release'u. Pipeline nigdy nie używa `prisma db push`, resetu ani migracji podczas startu Passenger.

## Rollback

Rollback jest świadomą, osobną operacją: przełączenie `releases/current` na poprzedni release i cold start aplikacji przez CloudLinux Node Selector.

Rollback kodu nie cofa schematu DB; dlatego przyszłe migracje muszą być kompatybilne wstecz albo mieć osobną, zatwierdzoną procedurę.
