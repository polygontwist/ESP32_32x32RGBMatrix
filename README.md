# ESP32_32x32RGBMatrix
ESP32 width 32x32 RGB Matrix, OTA, SPIFFS

in Entwicklung, momentane Probleme:
Crash beim SPIFFS lesen/schreiben & aktiven Timer

Momentan wird bei Datei I/O der Timer abgeschaltet

# Quellen
* RGB-Matrixdisplay: https://github.com/VGottselig/ESP32-RGB-Matrix-Display
* Webserver: https://github.com/bbx10/WebServer_tng
* NTP: https://github.com/gmag11/NtpClient/blob/master/src/NTPClientLib.cpp
* Calc time to stunde/min/sec/Monat/tag/Jahr https://github.com/arduino-libraries/NTPClient/issues/36
* Filesystem: https://github.com/esp8266/Arduino/blob/master/doc/filesystem.rst
