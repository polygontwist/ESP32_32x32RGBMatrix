#include "myNTP.h"


void myNTP::begin(){
	 udp.begin(localPort);
}

void myNTP::update(){
	unsigned long currentMillis = millis();
	
	//Warten bis das NTP-Paket angefragt werden soll
	if(currentMillis - ntp_getMillis > ntp_zeitchecker){
		ntp_getMillis=currentMillis;
		getNTPTime();
		versuche=0;
	}
	
	//Paket unterwegs, checken ob Antwort erhalten
	if(ntpangefragt && currentMillis - requestWait > ntp_zeitcheckerWaitNTP){//1sec
		 requestWait = currentMillis;
		 versuche++;
		 if(hatntptime && versuche>versuchemax){
			ntpangefragt=false; //nicht mehr auf Ergebnis warten
			versuche=0;
		 }
		 checkNTPTime();
	}

	//Uhr alle 1 Sec aktualisieren
	if(hatntptime&& currentMillis - uhr_previousMillis > uhr_zeitchecker){
		uhr_previousMillis = currentMillis;
		unsigned long diff = (millis()-ntp_timestamp)/1000;
		unsigned long epoch = ntp_unixtime + diff + ntp_timeDIFF*60*60;//sec
		
		if(ntp_year>0){
			if(summertime (ntp_year,ntp_month, ntp_day, ntp_stunde, ntp_timeDIFF)){
			  epoch +=3600;//sec=1h; Sommerzeit +1h 
			}
			issummertimechecked=true;
      }
      
	  unsigned long tday = epoch / 86400L + 3;//0=Do +3 als Korrektur -> 0=Montag
      ntp_wochentag=(tday) % 7;            // Since January 1, 1970 was a Thursday the results are

      //https://github.com/arduino-libraries/NTPClient/issues/36
      time_t rawtime = epoch;
      struct tm * ti;
      ti = localtime (&rawtime);
      ntp_year		=ti->tm_year + 1900;
      ntp_month		=ti->tm_mon + 1;
      ntp_day		=ti->tm_mday;
      ntp_stunde	=ti->tm_hour;
      ntp_minute	=ti->tm_min;
      ntp_secunde	=ti->tm_sec;
	  
	}
	
}

bool myNTP::isSummertime(){
	return summertime (ntp_year,ntp_month, ntp_day, ntp_stunde, ntp_timeDIFF);
}

void myNTP::setTimeDiff(byte t){
	ntp_timeDIFF=t;//h
}

byte myNTP::getUTCtimediff(){
	return ntp_timeDIFF;
}


bool myNTP::hatTime(){
	return issummertimechecked;
}

bool myNTP::istTimeWHM(byte wochentag, byte hh, byte min){
	if(
		wochentag==ntp_wochentag &&
		ntp_stunde==hh && ntp_minute==min 
	  )
	return true;
	else
	return false;
}

int myNTP::getyear(){
	return ntp_year;
}
byte myNTP::getmonth(){
	return ntp_month;
}
byte myNTP::getday(){
	return ntp_day;
}
byte myNTP::getwochentag(){
	return ntp_wochentag;
}
byte myNTP::getstunde(){
	return ntp_stunde;
}
byte myNTP::getminute(){
	return ntp_minute;
}
byte myNTP::getsecunde(){
	return ntp_secunde;
}

//--private--
void myNTP::getNTPTime(){
	if(WiFi.hostByName(ntpServerName, timeServerIP)){
		sendNTPpacket(timeServerIP); // send an NTP packet to a time server
		ntpangefragt=true;
	}
	else{
		ntpangefragt=false;
		//kein Netz
	}
	yield();
}

void myNTP::sendNTPpacket(IPAddress& address)
{
  //Serial.println("sending NTP packet...");
  // set all bytes in the buffer to 0
  memset(packetBuffer, 0, PACKET_SIZE);//48byte
  // Initialize values needed to form NTP request
  // (see URL above for details on the packets)
  packetBuffer[0] = 0b11100011;   // LI (11), Version (100), Mode (011)3=client
  packetBuffer[1] = 0;     // Stratum, or type of clock
  packetBuffer[2] = 6;     // Polling Interval (2046 sec)
  packetBuffer[3] = 0xEC;  // Peer Clock Precision
  // 8 bytes of zero for Root Delay & Root Dispersion
  packetBuffer[12]  = 49;   //Reference Identifier source identifier or 0 (Quell-IP)
  packetBuffer[13]  = 0x4E; //78
  packetBuffer[14]  = 49;   //            49(1).78(N).49(1).42(*)   192(À).53(5).103(g).103(g)|212(Ô).161(¡).179(³).138(Š)
  packetBuffer[15]  = 52;   //

  // all NTP fields have been given values, now
  // you can send a packet requesting a timestamp:
  udp.beginPacket(address, 123); //NTP requests are to port 123
  udp.write(packetBuffer, PACKET_SIZE);
  udp.endPacket();
}

void myNTP::checkNTPTime(){ 
  int cb = udp.parsePacket();
  if (cb) {
    ntp_timestamp=millis(); //aktuelle CPU-Zeit - um Uhr weiterlaufen zu lassen
    udp.read(packetBuffer, PACKET_SIZE); // read the packet into the buffer (48bytes)
/*
   https://tools.ietf.org/html/rfc958
    0                   1                   2                   3
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |LI |   Status  |      Type     |           Precision           |  0,1,2,3
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                       Estimated Error                         |  4,5,6,7
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                     Estimated Drift Rate                      |  8,9,10,11
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                  Reference Clock Identifier                   | 12,13,14,15
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                                                               |
   |                 Reference Timestamp (64 bits)                 | 16-23
   |                                                               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                                                               |
   |                 Originate Timestamp (64 bits)                 | 24-31
   |                                                               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                                                               |
   |                  Receive Timestamp (64 bits)                  | 32-39
   |                                                               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                                                               |
   |                  Transmit Timestamp (64 bits)                 | 40-43  Sekunden seit dem 1. Januar 1900 00:00:00 Uhr
   |                                                               | 44-47  Sekundenbruchteil
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

    40,41 highWord secsSince1900
    42,43 lowWord  secsSince1900

*/
    unsigned long highWord = word(packetBuffer[40], packetBuffer[41]);
    unsigned long lowWord = word(packetBuffer[42], packetBuffer[43]);
    // combine the four bytes (two words) into a long integer
    // this is NTP time (seconds since Jan 1 1900):
    unsigned long secsSince1900 = highWord << 16 | lowWord;
    //Serial.print("Seconds since Jan 1 1900 = " );
    //Serial.println(secsSince1900);
    //ntp_thetime=secsSince1900;
    // now convert NTP time into everyday time:
    // Unix time starts on Jan 1 1970. In seconds, that's 2208988800:
    const unsigned long seventyYears = 2208988800UL;
    // subtract seventy years:
    unsigned long epoch = secsSince1900 - seventyYears;
    // print Unix time:
    ntp_unixtime=epoch;
    
    ntp_zeitchecker= ntp_zeitcheckeriftime;//Zeit bis nächste Anfrage abgesetzt werden soll
    
	hatntptime=true;
    ntpangefragt=false;
  }
}

//https://github.com/gmag11/NtpClient/blob/master/src/NTPClientLib.cpp
// input parameters: "normal time" for year, month, day, hour and tzHours (0=UTC, 1=MEZ)
bool myNTP::summertime(int year, byte month, byte day, byte hour, byte tzHours){
    if ((month < 3) || (month > 10)) return false; // keine Sommerzeit in Jan, Feb, Nov, Dez
    if ((month > 3) && (month < 10)) return true; // Sommerzeit in Apr, Mai, Jun, Jul, Aug, Sep
    if (month == 3 && (hour + 24 * day) >= (1 + tzHours + 24 * (31 - (5 * year / 4 + 4) % 7)) 
     || month == 10 && (hour + 24 * day) < (1 + tzHours + 24 * (31 - (5 * year / 4 + 1) % 7)))
        return true;
    else
        return false;
}


