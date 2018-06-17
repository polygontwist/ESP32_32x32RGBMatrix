# ESP32 Dev Modul mit 32x32 RGB Matrix

Der ESP32 soll einen Arduino Mega ersetzen der bis dato ein 32x32 RGB-Pannel angesteuert hat.
(http://www.a-d-k.de/20140202_194719-Arduino_mit_32x32_RGB-LED-Matrix.htm)

![](https://raw.githubusercontent.com/polygontwist/ESP32_32x32RGBMatrix/master/bilder/32x32rgb-matrix_beispiel1.jpg)

Der Editor ist per Tablett, PC oder per Smartphone bedienbar.

# momentane Probleme & Lösungen
Crash beim SPIFFS lesen/schreiben & aktiven Timer/xTask: beim abspielen einer Datei wird diese jetzt zwischengepuffert.
Bei Dateioperationen wird der Timer/xTask abgeschaltet, danach wieder gestartet (RGB-Matrix wird kurz schwarz).

# Hinweise
* Passwort und SSID müssen per Serielle Konsole gesetzt werden, wenn man es nicht im Quellcode setzen möchte.
* der Hostname "rgbmatrix" ist bei mir fest eingestellt, dieser ist evtl. anzupassen!

# Funktionen
* OTA - onlineupdate
* SPIFFS - Filesystem
* Modul läuft als Wifi-Client, kein AP
* Webserver - upload Dateien, löschen, download, Setup (Filelisting)
* NTP - Uhrzeit wird per NTP geholt und eingestellt
* 32x32RGBMatrix - das Pannel; Demo Uhrzeit + lesen&darstellen von .ani-Dateien (Text)

# Quellen
* RGB-Matrixdisplay: https://github.com/VGottselig/ESP32-RGB-Matrix-Display
* Webserver: https://github.com/bbx10/WebServer_tng
* NTP: https://github.com/gmag11/NtpClient/blob/master/src/NTPClientLib.cpp
* Calc time to stunde/min/sec/Monat/tag/Jahr https://github.com/arduino-libraries/NTPClient/issues/36
* Filesystem: https://github.com/esp8266/Arduino/blob/master/doc/filesystem.rst
* EasyOTA https://github.com/jeroenvermeulen/JeVe_EasyOTA/

# Demo/History
* Version 0.50: https://www.instagram.com/p/Bhw8z1TAUns 
* Version 0.52: https://www.instagram.com/p/Bh4uAPDgLLZ Bildansehen: tranfer speed up
* Version 0.54: https://www.instagram.com/p/BiIK3oYAFUu Datei abspielen über einem Hilfspuffer
* Version 0.55: cleaning code,fix save-Editorfile, System jetzt mit allen Funktionen einsetzbar.
* 32x32.js/32x32.css 05.06.2018: integrated color picker, jetzt kann die Farbe auch im Bild ausgewählt werden

# Installation
Nach dem Flaschen der ESP32_32x32RGBMatrix.ino (mit Arduino), wird mit der seriellen Konsole (z.B. in Arduino-IDE) die SSID und das Passwort des WLANS eingestellt werden:
* setpass=passwort
* setssid=SSIDvomWLAN
* sethost=hostname

Dann müssen noch folgende Dateien für das Editorsystem mit der upload-Funktion hochgeladen werden:
* 32x32.css (Aussehen)
* 32x32.js (Funktionalität)
* favicon.ico (optional)
* index.htm (ersetzt interne index.htm)

Die Dateien befinden sich im Ordner "daten". Dort befinden sich auch Beispiele für die Animationen die hochgeladen werden können. Zu beachten ist das der internen Speicher nur Platz für ca 1,3MB hat - das reicht aber für einige Animationen.

# Hardware

| 32x32 Matrix | Arduino MEGA (1. Projekt) | ESP32 (dieses Projekt) |
------|------|------|
| R1 | D24 | 17 |
| G1 | D25 | 16 |
| B1 | D26 | 4 |
| R2 | D27 | 0 |
| G2 | D28 | 2 |
| B2 | D29 | 15 |
| CH A weiß| A0 | 21 |
| CH B | A1 | 19 |
| CH C | A2 | 18 |
| CH D | A3 | 5 |
| CLK | D11 | 22 |
| STB/Lat | D10 | 03 |
| OE | D9 | 23 |


# weitere Funktionen der seriellen Konsole
ESP neu starten:
* ESP=reboot

Infos ausgeben:
* ESP=getssid
* ESP=getpass
* ESP=gethost
* ESP=gettime
* ESP=getdate
* ESP=getwifistat
* ESP=hatntp

# TODO
* check freien Speicher bei upload
* Dateiformat erweitern für Text und dynamischen Text (z.B. Uhrzeit); für einen individuellen Defaultscreen
* handling wenn WLAN-Verindung abreißt
