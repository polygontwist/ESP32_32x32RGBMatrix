# ESP32 Dev Modul mit 32x32 RGB Matrix

Der ESP32 soll einen Arduino Mega ersetzen der bis dato ein 32x32 RGB-Pannel angesteuert hat.

in Entwicklung, momentane Probleme:
Crash beim SPIFFS lesen/schreiben & aktiven Timer

Momentan wird bei Datei I/O der Timer abgeschaltet

Der Quellcode ist noch "etwas" unübersichtlich... das mit dem Auslagern/includen muß ich mir erst noch ansehen.

# Hinweise
* Passwort und SSID müssen per Serielle Konsole gesetzt werden, wenn man es nicht im Quellcode setzen möchte.
* der Hostname ist bei mir fest eingestellt, dieser ist evtl. anzupassen!
* Funktionen zum Erstellen der Animationen sind noch nicht implementiert (müssen vom alten Projekt übernommen werden)

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
* Version 0.50: https://www.instagram.com/p/Bhw8z1TAUns 
* Version 0.52: https://www.instagram.com/p/Bh4uAPDgLLZ Bildansehen: tranfer speed up
* Version 0.54: https://www.instagram.com/p/BiIK3oYAFUu Datei abspielen über einem Hilfspuffer
