# Migracje Prisma

Prisma w tym projekcie jest narzędziem do wersjonowania schematu i migracji
MariaDB. Aplikacja nadal korzysta z `mysql2`; nie używa Prisma Client.

## Lokalna zmiana schematu

1. Zmień `prisma/schema.prisma`.
2. Utwórz i zastosuj lokalną migrację:

   ```sh
   npm run db:migrate -- --name krotki_opis_zmiany
   ```

3. Sprawdź stan:

   ```sh
   npm run db:status
   ```

4. Przetestuj aplikację, a następnie commituj razem kod, `schema.prisma` i
   cały nowy katalog w `prisma/migrations/`.

Production deploy używa dokładnie wybranego commitu Git. Nie wdroży schematu
ani migracji obecnych tylko w lokalnym worktree.

`DATABASE_URL` jest budowany wyłącznie w pamięci przez
`scripts/prisma-local.mjs` z lokalnych zmiennych `MYSQL_*`. Skrypt odmawia
połączenia z hostem innym niż `127.0.0.1`, `localhost` lub `::1`.

## Production deployment

`npm run deploy:production` wykonuje Prisma CLI na Mac mini przez tymczasowy
tunel SSH. Credentials są pobierane wyłącznie do pamięci z istniejącej
konfiguracji SSH oraz production `.env.production`; nie trafiają do repo ani
logów.

Przed aktywacją release'u pipeline wykonuje:

```sh
prisma migrate status
kontrolę historii _prisma_migrations
backup production DB, tylko gdy istnieją pending migrations
prisma migrate deploy, tylko gdy preflight i backup przeszły
prisma migrate status oraz prisma migrate diff
```

Jeżeli nie ma pending migrations, backup i `migrate deploy` są pomijane.
Jeżeli migracja nie przejdzie, stary release pozostaje aktywny. Jeśli migracja
przejdzie, a aktywacja aplikacji zawiedzie, kod można cofnąć, ale schema nie
jest automatycznie cofana — dlatego migracje muszą być backward-compatible.

## Awaria migracji

Zatrzymaj deploy. Nie uruchamiaj go ponownie w ciemno i nie usuwaj wpisów z
`_prisma_migrations`. Zachowaj log błędu, sprawdź `prisma migrate status` i
ustal ręczny plan recovery dla konkretnej migracji, zanim wykonasz jakąkolwiek
zmianę bazy.

## Zakazy

Na stagingu i produkcji nigdy nie używaj `npm run db:deploy:local`, `prisma db push`,
`prisma migrate reset`, ręcznego DDL jako zastępstwa migracji ani
`prisma migrate resolve` bez uprzednio zatwierdzonego planu. Nie zapisuj
`DATABASE_URL` ani haseł w repozytorium.
