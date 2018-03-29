# ESP32 Dev Modul mit 32x32 RGB Matrix

Der ESP32 soll einen Arduino Mega ersetzen der bis dato ein 32x32 RGB-Pannel angesteuert hat.

in Entwicklung, momentane Probleme:
Crash beim SPIFFS lesen/schreiben & aktiven Timer

Momentan wird bei Datei I/O der Timer abgeschaltet

Der Quellcode ist noch "etwas" unübersichtlich... das mit dem Auslagern/includen muß ich mir erst noch ansehen.

# Hinweise
* Passwort und SSID müssen per Serielle Konsole gesetzt werden, wenn man es nicht im Quellcode setzen möchte.
* der Hostname ist bei mir fest eingestellt, dieser ist evtl. anzupassen!

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
* OTA 

# Demo

[<img title="Demovideo read SPIFFS and show" alt="Demovideo read SPIFFS and show" src="https://scontent-frt3-2.cdninstagram.com/vp/eeb3de3ff9e4217f3aed637e9633c9b0/5ABF514D/t51.2885-15/e15/29400833_190540264895294_6084458165678637056_n.jpg" width="200" />](https://scontent-frt3-2.cdninstagram.com/vp/abe3c53b61c31ad2d3dea715470891ba/5ABF572F/t50.2886-16/29704055_157135948307510_3876357852592319566_n.mp4 "Demo")
