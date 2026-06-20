# LOOP-, WHILE- & GOTO-Simulator

Ein webbasierter Simulator zur Ausführung und Analyse von **LOOP-, WHILE- und GOTO-Programmen** im Kontext der *Theoretischen Informatik*.

**[Live-Version (GitHub Pages)](https://jonashuberts.github.io/Loop-While-Goto-Simulator/)**

---

## Funktionsumfang

- **Unterstützung für drei Berechnungsmodelle**: Nahtloses Umschalten zwischen **LOOP-**, **WHILE-** und **GOTO-Programmen** direkt über die Benutzeroberfläche.
- **Interaktiver Code-Editor**: Bietet Syntax-Highlighting (Kommentare, Keywords, Zuweisungen, Variablen, Zahlen, GOTO-Labels), automatische Zeilennummerierung, Unterstützung für Tab-Einrückungen (`Tab` / `Shift+Tab`) und eine automatische Code-Formatierung.
- **Dynamische Variablen-Erkennung**: Scannt das Programm in Echtzeit nach genutzten Registern (`x1`, `x2`, ...) und generiert automatisch entsprechende Eingabefelder zur Definition der Anfangswerte.
- **Schritt-für-Schritt-Debugger**: Ermöglicht die zeilenweise Ausführung des Codes inklusive optischer Markierung der aktiven Zeile sowie einer vollständigen Historie aller Registeränderungen (Trace Log).
- **Semantische Spezifikationen**:
  - **LOOP-Modus**: Die Schleifenanzahl wird beim Eintritt in ein `LOOP`-Konstrukt festgesetzt. Nachträgliche Modifikationen des Schleifenregisters haben keinen Einfluss auf die Iterationsanzahl.
  - **WHILE-Modus**: Die Schleifenbedingung wird dynamisch vor *jeder* Iteration ausgewertet (Endlosschleifen möglich).
  - **GOTO-Modus**: Zeilenweise Ausführung mit unbedingten (`GOTO Mk`) und bedingten (`IF xj = c GOTO Mk`) Sprüngen. Zeilenlabels (z. B. `M0:`) sind optional und werden nur auf Sprungzielen benötigt.
  - **Modifizierte Subtraktion (Monus)**: `xi := xj -· c` subtrahiert den Wert `c` mit einer automatischen Untergrenze bei `0`.
- **Integrierte Lehrbeispiele**: Enthält vordefinierte, strukturierte Beispielprogramme für alle drei Berechnungsmodelle (Grundrechenarten, Paritätsprüfungen, Vorgängeroperationen).

---

## Projektstruktur

```text
├── index.html        # Benutzeroberfläche & Syntax-Referenz
├── style.css         # Visuelle Gestaltung & Layout
└── src/
    ├── main.js       # Applikationssteuerung, Event-Handling & Zustandssicherung
    ├── parser.js     # Lexikalische Analyse & Parser (Modus-spezifische Validierung)
    ├── interpreter.js# Generator-basierter Interpreter (LOOP/WHILE/GOTO-Semantiken)
    ├── editor.js     # Editor-Hilfsfunktionen & Syntax-Highlighter
    └── examples.js   # Datenbasis der Lehrbeispiele
```

---

## Lokale Ausführung

Das Projekt benötigt keine Build-Schritte. Aufgrund der Verwendung von ES6-Modulen muss die Ausführung jedoch über einen lokalen Webserver erfolgen:

```bash
# Start eines lokalen Webservers (z. B. mittels serve)
npx serve .
```

*Alternativ kann in Entwicklungsumgebungen wie VS Code die Erweiterung „Live Server“ verwendet werden.*
