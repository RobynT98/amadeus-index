# Amadeus Command Index

En snabb och interaktiv indexsida över vanliga **Amadeus-kommandon**, uppdelade i moduler (PNR, Availability, Pricing, Offers, Ticketing, SSR, m.fl.).

## ✨ Funktioner
- **Sök** – filtrera på kommando, taggar eller beskrivning  
- **Moduler** – kommandon grupperade efter funktion  
- **Kopiera** – kopiera kommando till urklipp med ett klick  
- **Tema** – växla mellan ljust/mörkt  
- **Vy** – kompakt eller luftig kortlayout  
- **PWA** – fungerar offline och kan installeras som app

## 🚀 Live
- GitHub Pages: https://robynt98.github.io/amadeus-index/
- Vercel: https://amadeus-index.vercel.app/

## 🧭 Användning
1. Öppna någon av länkarna ovan  
2. Sök efter ett kommando eller bläddra i modulerna  
3. Klicka **Kopiera** för att snabbt använda kommandot i Amadeus

## 💻 Köra lokalt
```bash
git clone https://github.com/RobynT98/amadeus-index.git
cd amadeus-index
# öppna index.html i din webbläsare (dubbeklick eller via server)
```
Tips: om du vill testa service workern korrekt, kör en liten dev-server:
```
npx serve .
# eller
python -m http.server 8080
```
## 📲 PWA (offline)
Appen cachear UI + datafiler via sw.js. När du uppdaterar filer, bumpa VERSION i sw.js för att trigga ny cache.
Installera som app:
Desktop: klicka Installera app i adressfältet (Chrome/Edge)
Android: Lägg till på startskärmen när prompten visas.

## 🗂 Struktur
```
amadeus-index/
├─ data/                 # JSON med kommandodata
├─ 192.png 512.png 1024.png  # app-ikoner
├─ Maskable_*.png
├─ index.html
├─ styles.css
├─ app.js
├─ manifest.json
└─ sw.js                 # service worker
```

## 📦 Deployment
### GitHub Pages

Settings → Pages → Source: Deploy from a branch, Branch: main
Vänta på bygget, sidan blir tillgänglig på https://<user>.github.io/amadeus-index/
### Vercel
Importera repo i Vercel
Framework: Other (statisk sida), Build/Output dir: /

## 📜 Licens & bidrag
Projektet är släppt under MIT License.
Bidrag: Genom att bidra godkänner du vår Contributor License Agreement (CLA).
Det innebär att projektägaren Conri Turesson kan:
ändra licens för framtida versioner,
skapa premium/kommersiella varianter.
Ditt bidrag till den öppna versionen förblir MIT-licensierat.

