# Pokédex Eclipse – PokéAPI-Datenstand (20.10.2026)

Quelle: https://pokeapi.co/docs/v2 und https://github.com/PokeAPI/pokeapi/blob/master/openapi.yml

## Bereits in Eclipse angebunden
- Pokémon-Spezies (Nationaldex; jetzt dynamisch aus `/pokemon-species?limit=2000`)
- Pokémon-Detaildaten (Stats, Typen, Attacken, Fähigkeiten, Varianten)
- Pokémon-Arten (deutsche Namen, Pokédex-Texte, Eigenschaften)
- Entwicklungsketten und Entwicklungsbedingungen
- Attacken und deutsche Attackennamen
- Typen und Wechselwirkungen
- Fundort-Begegnungen pro Pokémon und Edition
- Fundortgebiete und deutsche Ortsnamen (soweit in der API verfügbar)

## Verfügbare PokéAPI-v2-Ressourcen
- Beeren: `berry`, `berry-firmness`, `berry-flavor`
- Wettbewerbe: `contest-type`, `contest-effect`, `super-contest-effect`
- Begegnungen: `encounter-method`, `encounter-condition`, `encounter-condition-value`
- Entwicklungen: `evolution-chain`, `evolution-trigger`
- Spiele: `generation`, `pokedex`, `version`, `version-group`
- Items: `item`, `item-attribute`, `item-category`, `item-fling-effect`, `item-pocket`
- Orte: `location`, `location-area`, `pal-park-area`, `region`
- Attacken: `move`, `move-ailment`, `move-battle-style`, `move-category`, `move-damage-class`, `move-learn-method`, `move-target`
- Pokémon: `ability`, `characteristic`, `egg-group`, `gender`, `growth-rate`, `nature`, `pokeathlon-stat`, `pokemon`, `pokemon-color`, `pokemon-form`, `pokemon-habitat`, `pokemon-shape`, `pokemon-species`, `stat`, `type`
- Sonstiges: `language`, `machine`

## Grenzen und nächste Schritte
- Eine API-Ressource bedeutet **nicht**, dass alle Editionsdaten vorhanden sind.
- Insbesondere Begegnungen der neueren Spiele (u. a. Karmesin/Purpur, Legenden: Z-A) sind nicht zuverlässig vollständig. Im UI wird fehlende Abdeckung gekennzeichnet.
- Neuere Pokémon-Arten werden über die dynamische Speziesliste automatisch aufgenommen, sobald sie in der API erscheinen. Die deutschen Namen werden aktuell nur bis #1025 vorab geladen; die Synchronisation für spätere Einträge ist noch zu erweitern.
- Ein vollständiger lokaler Export sämtlicher API-Datensätze wurde **nicht** durchgeführt. Diese Datei dokumentiert die Endpunkte und Integrationsabdeckung, keine verifizierte Live-Zählung.
- Bei weiterer Erweiterung: deutsche Namensauflösung mit Caching, Fehler-/Ladelogik und Datenqualitätsprüfungen je Edition; keine ungeprüften externen Daten als Fakten anzeigen.

PokéAPI-Daten können sich ändern. Für konkrete Vollständigkeitszahlen müssen die jeweiligen Endpunkte live abgefragt und mit Zeitstempel protokolliert werden.
