# Fucha24 — deployment demonstracyjny (cPanel + Passenger)

## Zasada

Build wykonujemy wyłącznie lokalnie. Serwer otrzymuje gotowy katalog `release/` przez SSH i nigdy nie uruchamia `npm install`, `npm ci` ani `npm run build`.

## Wymagania jednorazowe na serwerze

- Aplikacja Node.js w cPanel wskazuje `~/repositories/Fucha24` jako Application root i `server.js` jako Startup file.
- Node.js ma wersję 22.
- W katalogu repozytorium istnieje nieśledzony przez Git plik `.env.production` z danymi MariaDB i SMTP.
- Katalog `~/releases/fucha24` istnieje i należy do użytkownika cPanel.
- Katalog `~/repositories/Fucha24/tmp` istnieje. Passenger używa pliku `tmp/restart.txt` do restartu.

Przed pierwszym `git pull` przenieś ręcznie wcześniej utworzony na serwerze `server.js` do kopii zapasowej. Od tej wersji `server.js` jest śledzony w repo i uruchamia gotowy release.

Przykładowy plik `.env.production` na serwerze:

```env
LISTINGS_STORAGE=mysql
MYSQL_HOST=...
MYSQL_PORT=3306
MYSQL_DATABASE=...
MYSQL_USER=...
MYSQL_PASSWORD=...
NEXT_PUBLIC_APP_URL=https://app.fucha24.pl
```

Nie kopiuj `.env.production` do `release/` ani do GitHub.

## Pierwsze przygotowanie release na serwerze

Po pierwszym `git pull` wykonaj jednorazowo:

```bash
mkdir -p ~/releases/fucha24
mkdir -p ~/repositories/Fucha24/tmp
ln -sfn ~/releases/fucha24/current ~/repositories/Fucha24/release
```

Symlink `release` jest ignorowany przez Git. `current` będzie wskazywał na aktualnie wdrożony release.

## Proces lokalny

Używaj Node.js 22, zgodnego z serwerem:

```bash
nvm use
git pull --ff-only
npm ci
npm run check
npm run build
```

`npm run build` tworzy kompletny katalog `release/` z Next standalone, plikami `public` i `.next/static`.

Następnie zatwierdź oraz wypchnij wyłącznie kod źródłowy:

```bash
git add .
git commit -m "Opis zmiany"
git push
```

## Wysłanie gotowego release z Maca

Ustal wartości `CPANEL_USER`, `SERVER_HOST` i identyfikator commita. Przykład:

```bash
git rev-parse --short HEAD
rsync -az --delete ./release/ CPANEL_USER@SERVER_HOST:~/releases/fucha24/COMMIT_SHA/
ssh CPANEL_USER@SERVER_HOST "ln -sfn ~/releases/fucha24/COMMIT_SHA ~/releases/fucha24/current"
```

Upload odbywa się z Maca. Serwer tylko zapisuje gotowe pliki; niczego nie buduje ani nie instaluje.

## Czynności na serwerze po każdym deployu

```bash
cd ~/repositories/Fucha24
git pull --ff-only
touch tmp/restart.txt
```

Alternatywnie użyj przycisku Restart w cPanel Node.js Application.

## Rollback

Wskaż `current` na wcześniejszy katalog release i zrestartuj Passenger:

```bash
ln -sfn ~/releases/fucha24/POPRZEDNI_COMMIT ~/releases/fucha24/current
cd ~/repositories/Fucha24
touch tmp/restart.txt
```

## Zmiany bazy danych

Migracje wykonujemy świadomie z lokalnego komputera, po połączeniu ze zdalną MariaDB. Nie uruchamiamy migracji podczas startu Passenger.
