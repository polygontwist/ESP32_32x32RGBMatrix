#ifndef __myNTP__
#define __myNTP__

#include <Arduino.h>
#include <time.h>
#include <WiFiUDP.h>


//esp8266
//#include <ESP8266WiFi.h>
//#include <ESP8266WebServer.h>

//esp32
#include <WiFi.h>



class myNTP{
		
private:	
	

	unsigned int localPort = 2390;      // local port to listen for UDP packets
	IPAddress timeServerIP; 			// time.nist.gov NTP server address
	const char* ntpServerName = "0.europe.pool.ntp.org";
	/*
	time.nist.gov
	pool.ntp.org
	0.europe.pool.ntp.org
	1.europe.pool.ntp.org
	2.europe.pool.ntp.org
	3.europe.pool.ntp.org
	*/	
	const int PACKET_SIZE = 48; // NTP time stamp is in the first 48 bytes of the message
	byte packetBuffer[ 48 ]; 	//buffer to hold incoming and outgoing packets
	
	byte ntp_timeDIFF=1;//unixtime+1h = Berlin
	
	
	unsigned long ntp_getMillis;
	unsigned long ntp_zeitchecker		= 	15000;//ms = 15sec 
	unsigned long ntp_zeitcheckeriftime	=	5*60*1000;//5min, wenn zeit mal geholt
		
	unsigned long requestWait=0;
	unsigned long ntp_zeitcheckerWaitNTP=1000;//ms = 1sec
	
	unsigned long uhr_previousMillis=0;
	unsigned long uhr_zeitchecker	=1000;//ms = 1sec intervall, Uhr aktualisieren
	
	byte versuche=0;
	byte versuchemax=5;
	bool ntpangefragt=false;
	bool hatntptime=false;
	bool issummertimechecked=false;
	
	unsigned long ntp_timestamp;//Zeit von NTP-Zeit ankam
	unsigned long ntp_unixtime; //Zeit aus dem netz
	
	
	int ntp_year=0;
	byte ntp_month=0;
	byte ntp_day=0;

	byte ntp_wochentag=0;
	byte ntp_stunde=0;
	byte ntp_minute=0;
	byte ntp_secunde=0;
	
	
	WiFiUDP udp;

	void getNTPTime();
	void sendNTPpacket(IPAddress& address);
	void checkNTPTime();
	bool summertime(int year, byte month, byte day, byte hour, byte tzHours);
	
public:
	void begin();
	void update();
	
	void setTimeDiff(byte t);
	
	bool hatTime();
	bool istTimeWHM(byte wochentag,byte hh, byte min);
	bool isSummertime();
	
	int getyear();
	byte getmonth();
	byte getday();
	byte getwochentag();
	byte getstunde();
	byte getminute();
	byte getsecunde();
	byte getUTCtimediff();	

};
#endif
