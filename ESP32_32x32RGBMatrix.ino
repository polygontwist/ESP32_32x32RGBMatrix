/*
 * ESP32 Dev Module 80MHz
 * WROOM32 it will indeed be 4MB (= 32Mbit).
 * 
 * 
 * Serial input:
 *  setssid=      SSID for WLAN
 *  setpass=      Passwort for WLAN
 *  ESP=reboot    reboot ESP
 *  ESP=getssid   show SSID
 *  ESP=getpass   show Password
 *  ESP=gettime   show lokaltime
 *  ESP=getdate   show lokaldate
 *  ESP=hatntp    show true when set time/date from NTP
 *  ESP=getwifistat 
 *  
 *  
  https://github.com/bbx10/WebServer_tng
  https://github.com/gmag11/NtpClient/blob/master/src/NTPClientLib.cpp
  https://github.com/arduino-libraries/NTPClient/issues/36
  https://tools.ietf.org/html/rfc958
  https://github.com/esp8266/Arduino/blob/master/doc/filesystem.rst
  http://esp-idf.readthedocs.io/en/latest/api-guides/wifi.html#system-event-sta-connected

  https://github.com/VGottselig/ESP32-RGB-Matrix-Display
  https://techtutorialsx.com/2017/05/09/esp32-running-code-on-a-specific-core/
  https://techtutorialsx.com/2017/10/07/esp32-arduino-timer-interrupts/
  http://www.iotsharing.com/2017/07/how-to-configure-esp32-multicore-arduino-esp32.html
  http://esp-idf.readthedocs.io/en/latest/api-reference/system/freertos.html
  https://techtutorialsx.com/2017/05/09/esp32-running-code-on-a-specific-core/
  http://hit-karlsruhe.de/hit-info/info-ws17/Drehteller_Revisited/0403Softwaredoku.html
  https://www.studocu.com/en-gb/document/deakin-university/modern-data-science/lecture-notes/kolban-esp32-esp32-documents-for-iot/1423897/view

*/


#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <time.h>

//https://github.com/bbx10/WebServer_tng
#include "WebServer.h" 

#include "FS.h"
#include "SPIFFS.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "Adafruit_GFX.h"
#include "ESP32RGBmatrixPanel.h"
/*#define COLUMNS 32
#define ROWS 32*/

WebServer server(80); 



ESP32RGBmatrixPanel matrix;

//32x32*3 =3072byte/Frame = 3kb   10 Frames=30kb

#define BUFSIZ 255
int anifilepos=0;
int anifileframecounter=0;


//ESP32RGBmatrixPanel matrix(23, 22, 03, 17, 16, 04, 00, 02, 15, 21, 19, 18, 5); //Flexible connection
//Default connection
//uint8 OE = 23;
//uint8 CLK = 22;
//uint8 LAT = 03;
//uint8 CH_A = 21;
//uint8 CH_B = 19;
//uint8 CH_C = 18;
//uint8 CH_D = 5;
//uint8 R1 = 17;
//uint8 G1 = 16;
//uint8 BL1 = 4;
//uint8 R2 = 0;
//uint8 G2 = 2;
//uint8 BL2 = 15;

const char* progversion  = "32x32 RGB-Matrix V0.46 ota fs ntp ti ini rgb";//

String ssid = "42";  //set per serial: setssid=
String password = "";//set per serial: setpass=
#define ARDUINO_HOSTNAME  "rgbmatrix" //esp32-30aea43897c4

#define LED_PIN 2        //gpio05 D1

unsigned int localPort = 2390;      // local port to listen for UDP packets
IPAddress timeServerIP; // time.nist.gov NTP server address
const char* ntpServerName = "0.europe.pool.ntp.org";
/*
time.nist.gov
pool.ntp.org
0.europe.pool.ntp.org
1.europe.pool.ntp.org
2.europe.pool.ntp.org
3.europe.pool.ntp.org
*/

File fsUploadFile;                      //Hält den aktuellen Upload

String basichtml = "<html><head><title>esp32 "+String(progversion)+"</title>\r\n"
    "<meta charset=\"utf-8\"/>"
    "<link rel=\"shortcut icon\" href=\"favicon.ico\">"
    "<link rel=\"STYLESHEET\" type=\"text/css\" href=\"style.css\">"
    "<script type=\"text/javascript\" src=\"script.js\"></script>"
    "</head><body>\r\n";

uint8_t MAC_array[6];
char MAC_char[18];
String macadresse="";
bool wifiaktiv=false;

const int NTP_PACKET_SIZE = 48; // NTP time stamp is in the first 48 bytes of the message
byte packetBuffer[ NTP_PACKET_SIZE]; //buffer to hold incoming and outgoing packets
WiFiUDP udp;
unsigned long ntp_previousMillis=0;
unsigned long ntp_previousMillisWaitNTP=0;
unsigned long ntp_zeitchecker= 15000;//ms = 10sec 
unsigned long ntp_zeitcheckeriftime= 5*60*1000;//5min
unsigned long ntp_zeitcheckerWaitNTP= 1000;//ms = 1sec
byte ntp_zcheckerversuche=0;
byte ntp_zcheckerversuchemax=5;
unsigned long ntp_thetime=0;
unsigned long ntp_timestamp=0;//ms
unsigned long ntp_unixtime=0;
unsigned long ntp_timeDIFF=1*60*60;//sec -> unixtime+1h ->MESZ

int ntp_year=0;
byte ntp_month=0;
byte ntp_day=0;

byte ntp_wochentag=0;
byte ntp_stunde=0;
byte ntp_minute=0;
byte ntp_secunde=0;
byte last_minute=0;
bool hatntptime=false;
bool ntpangefragt=false;
bool sommerzeitchecked=false;

unsigned long uhr_previousMillis=0;
unsigned long uhr_zeitchecker= 1000;//ms = 1sec
unsigned long tim_previousMillis=0;
unsigned long tim_zeitchecker= 15*1000;//15sec

bool istupdating=false;

TaskHandle_t xHandleRenderTask;
TaskHandle_t xHandleDrawTask;
TaskHandle_t xHandleCoreTask;

String playfile="";
bool DisplayOn=true;

bool timeriststopped=false;
int requeststopp=0;

//https://github.com/espressif/arduino-esp32/issues/855
//IRAM_ATTR tells the complier, that this code Must always be in the 
//ESP32's IRAM, the limited 128k IRAM.  use it sparingly.
hw_timer_t* displayUpdateTimer = NULL;
void IRAM_ATTR onDisplayUpdate() {
   matrix.update();//16x16x10
}


void IRAM_ATTR playafileframe(int16_t framedelay){//40ms=25fps
   File aniFile;
   int zeichen=0;
   char clientline[BUFSIZ+1];  //inputzeile
   int buffpos=0;
   int filesize=0;
   bool framereading=true;
   
   anifileframecounter-=framedelay;//verstrichene Zeit abziehen
   if(anifileframecounter>0)return;//abzuwartende Zeit noch nicht vergangen, abrechen und warten
   //Zeit abgelaufen, lese Frame
   anifileframecounter=0;
  
   //Frame laden? ansonsten nix machen - frameinhalt bleibt stehen
   
//portMUX_TYPE adc_spinlock = portMUX_INITIALIZER_UNLOCKED;
//taskENTER_CRITICAL();
//portENTER_CRITICAL(&adc_spinlock);  
//portDISABLE_INTERRUPTS();

// timerAlarmDisable(displayUpdateTimer);//     
   stoppTimer(false);

   //open file
   aniFile= SPIFFS.open(playfile, "r");
   if(aniFile){
     //seek pos
     filesize=aniFile.size();
     if(anifilepos>filesize-1)anifilepos=0;
   
     //Serial.print(filesize,DEC);
     //Serial.print(" seekto:");
     //Serial.println(anifilepos,DEC);
     if(!aniFile.seek(anifilepos, SeekSet)){//offset, mode-> SeekSet from bytes from the beginning
       //error
       // Serial.println("seekerror");
     };
     
     //read frame
     while (framereading){//Zeilenweise lesen
        zeichen=aniFile.read(); //->block interrrupt!
        anifilepos++;
        buffpos=0;
        
        while(zeichen>31){ //Dateiende(-1)oder eine Zeileende ('\n'=13)
          clientline[buffpos] =zeichen;//Array of Chars
          buffpos++;
          if (buffpos >= BUFSIZ-1){framereading=false;break;}//Buffer am überlaufen, abbrechen
          zeichen=aniFile.read();
          anifilepos++;
        }
        clientline[buffpos]=0; //null terminierunng

        if(buffpos>1){//Zeile auswerten
            //zeilenende, zeile auswerten & zeichnen
            if (clientline[0]=='d'){
              //Frame fertig, set new delaytime
              anifileframecounter=get_int(clientline,1,4)-framedelay;//
              if(anifileframecounter<0)anifileframecounter=0;
              framereading=false;
              //fertig break->while (iniFile.available())
            }
            //Zeichenbefehle
            drawBefehl(clientline);
        }
        
        if(zeichen<0 || !aniFile.available()){ //dateiende         
          anifilepos=0;//Dateizeiger auf Anfang
          framereading=false; //fertig break->while (iniFile.available())
        }/**/
        //framereading=false;
        //anifileframecounter=40*25;//1sec
     }
     
   }
   aniFile.close();//close
   
startTimer();
   //taskEXIT_CRITICAL();
//portEXIT_CRITICAL(&adc_spinlock);
//portENABLE_INTERRUPTS();

// timerAlarmEnable(displayUpdateTimer);

}

void drawTask( void * pvParameters ){
    //String taskMessage = ">>>Task running on core ";
   // taskMessage = taskMessage + xPortGetCoreID();
   int lavercounter = 0;
   int stepp=16;
   int steppDir=1;
   while(true){
      if(DisplayOn){  
           if(playfile!=""){
              playafileframe(40);
              
           }else{
            //testscreen of off
                 String s="";
                if(ntp_stunde<10)s+="0";
                s+=String(ntp_stunde)+":";
                if(ntp_minute<10)s+="0";
                s+=String(ntp_minute);
                  
                //text
                matrix.setBrightness(10);//0..10
                //matrix.setTextWrap(false);
                //matrix.setTextSize(1);
                matrix.black();//alles löschen

                //blinkender richtungsloser Fleck
                lavercounter+=(stepp*steppDir);
                if(lavercounter>=255){steppDir=-1;lavercounter=255;}
                if(lavercounter<=0)  {steppDir= 1;lavercounter=0;}
                matrix.fillCircle(15, 16, 11, matrix.AdafruitColor(lavercounter,lavercounter,0) );//int16_t
  
                //testlines RGBW
                byte i;
                for(i=0;i<32;i++){
                    matrix.drawPixel(i, 28, i*8, 0, 0);
                    matrix.drawPixel(i, 29, 0,i*8, 0);
                    matrix.drawPixel(i, 30, 0,0,i*8);
                    matrix.drawPixel(i, 31, i*8,i*8,i*8);
                }

                //Time
                matrix.setCursor(1, 0);
                matrix.setTextColor(matrix.AdafruitColor(0,255,0));
                matrix.println(s);
                
                //Secunden
                matrix.setTextColor(matrix.AdafruitColor(255,255,255));
                matrix.setCursor(10, 10);
                s="";
                if(ntp_secunde<10)s="0";
                s+=String(ntp_secunde);
                matrix.println(s);
              }

      }else{
        matrix.black();
      }
      //delay(40);//40ms=25fps
      delay(40);//25fps
   }
}

bool beginWiFi(){
 //get ssid/pass wenn definiert
  String s;
  s=getINI("ssid");
  if(s.length()>0){
      Serial.println("get SSID "+s);
      ssid=s;
  }
  s=getINI("pass");
  if(s.length()>0){
      //Serial.println("get pass "+s);
      Serial.println("get pass ***");
      password=s;
  }

  if(ssid.length()==0 || password.length()==0){
    Serial.print(":-/  please");
    if(ssid.length()==0)
      Serial.print("set SSID (setssid=) ");
    if(password.length()==0)
      Serial.print("set Pass (setpass=) ");    
    Serial.println(String(ssid.length())+" "+String(password.length()));
    return false;
   }
  
  char charBufSSID[255];
  char charBufPASS[255];
  ssid.toCharArray(charBufSSID,255);
  password.toCharArray(charBufPASS,255);
  WiFi.begin(charBufSSID,charBufPASS);
  return true;
}


void setup() {
  Serial.begin(115200);
  Serial.print("Booting ");
  Serial.println(progversion);
  
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, true);

  //SPIFFS
  SPIFFS.begin();
 
  //WIFI
  WiFi.mode(WIFI_STA);
  WiFi.onEvent(WiFiEvent);  
  if(!beginWiFi()){Serial.println("no WIFI");return;}
  WiFi.setHostname(ARDUINO_HOSTNAME);// !
  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.println("Connection Failed! Rebooting...");
    delay(6000);
    ESP.restart();
  }
  wifiaktiv=true;
  //get MAC
  WiFi.macAddress(MAC_array);
  for (int i = 0; i < sizeof(MAC_array); ++i) {
    if(i>0) macadresse+=":";
    macadresse+= String(MAC_array[i], HEX);
    //sprintf(MAC_char, "%s%02x:", MAC_char, MAC_array[i]);
  }
  Serial.print("MAC: ");
  Serial.println(macadresse);

  //Online Update 
  ArduinoOTA
    .onStart([]() {
      stoptasks();
     
      String type;
      if (ArduinoOTA.getCommand() == U_FLASH)
        type = "sketch";
      else // U_SPIFFS
        type = "filesystem";

      // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
      Serial.println("Start updating " + type);
    })
    .onEnd([]() {
      istupdating=false;
      Serial.println("\nEnd");
    })
    .onProgress([](unsigned int progress, unsigned int total) {
      digitalWrite(LED_PIN, true);
      Serial.print(".");
      if( (progress / (total / 100)) == int(progress / (total / 100)/10 )*10 ){
          Serial.printf(" %u%%\r ", (progress / (total / 100)));
          Serial.println("");
          digitalWrite(LED_PIN, false);
        }
    })
    .onError([](ota_error_t error) {
      Serial.printf("Error[%u]: ", error);
      if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
      else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
      else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
      else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
      else if (error == OTA_END_ERROR) Serial.println("End Failed");
    });

  ArduinoOTA.begin();


  //Webserver
  server.on("/",handleRoot); 
  server.on("/index.htm",handleRoot); 
  server.on("/index.html",handleRoot);
   
  server.on("/data.json", handleData);
  server.on("/setup.htm",handleSetup);

  server.on("/aktion",handleaktion);

  // server.on("/*.ani",handleSetup); + start der so ->rgbmatrix
 /*
    ?stop
    ?play
    ?delete
 */
  //server.on("/status.ard", handle );//infos
  /* 
      {"PROGversion":"", "SD":"", "Aniaktiv":""}
  */
  
  //server.on("/list.ard", handle );//Dateiliste komplett
  /*
      {
      "Ordnert":"",
      "List":[
          {"d":"2014-01-30 13:59:11","n":"INDEX.HTM","s":12345} d+s optional (kein d+s wenn Ordner oder backlink)
      ]}
  */
  //upload.htm
   
  server.on("/upload", HTTP_POST, []() {
    stoppTimer(true);
    server.send(200, "text/plain", "");
  }, handleFileUpload);
  
  server.onNotFound(handleNotFound);//Dateien vom Speicher oder 404
  
  server.begin();
  udp.begin(localPort);

  digitalWrite(LED_PIN, false);

  Serial.println("TaskCreate");
  
  //RGBMatrix
// Adafruit_GFX
  matrix.setBrightness(10);//0..10
  matrix.setTextWrap(false);
  matrix.setTextSize(1);


//"PRO_CPU" and "APP_CPU".

  
  //Serial.println("Starting to create task on core 1");  
 /* xTaskCreatePinnedToCore(
                    renderTask,   // Function to implement the task 
                    "renderTask", // Name of the task 
                    10000,      // Stack size in words 
                    NULL,       //Task input parameter 
                    1,          // 2 | portPRIVILEGE_BIT Priority of the task 
                    &xHandleRenderTask,       // Task handle.
                    1);  // tskNO_AFFINITY  0/1 Core where the task should run 
*/
  xTaskCreatePinnedToCore(
                    drawTask,   // Function to implement the task 
                    "drawTask", // Name of the task 
                    10000,      // Stack size in words 
                    NULL,       //Task input parameter 
                    2 ,          // 1 Priority of the task 
                    &xHandleDrawTask,       // Task handle.
                    0);  // tskNO_AFFINITY  0/1 Core where the task should run 

  xTaskCreatePinnedToCore(
                    coreTask,   // Function to implement the task 
                    "coreTask", // Name of the task 
                    10000,      // Stack size in words 
                    NULL,       //Task input parameter 
                    1,          // 1| portPRIVILEGE_BIT Priority of the task 
                    &xHandleCoreTask,       // Task handle.
                    0); 


   //us 1 second is 1.000.000us = 1000ms  1ms=1000us 1us=0,001ms 2us=0,002ms
  // 1 tick take 1/(80MHZ/80) = 1us so we set divider 80 and count up 
  displayUpdateTimer = timerBegin(0, 80, true);//id,divider,countUp, true=edge type     
  // Attach onTimer function to our timer 
  timerAttachInterrupt(displayUpdateTimer, &onDisplayUpdate, true);//timer,function,
  timerAlarmWrite(displayUpdateTimer, 2, true);//2  *timer,interruptAt,autoreload
                                              //2=ms wenn  80 for the prescaler
  timerAlarmEnable(displayUpdateTimer);

/**/
  //Serial.println(portPRIVILEGE_BIT);=0
  Serial.println("Ready");
}


void stoppTimer(bool matrixblank){
   requeststopp++;
   if(timeriststopped)return;
   timeriststopped=true;
   if(matrixblank){
      matrix.black();
      matrix.update();  
      matrix.update();  
   }
   timerDetachInterrupt(displayUpdateTimer);
   timerStop(displayUpdateTimer);
   timerAlarmDisable(displayUpdateTimer);//  
   timerEnd(displayUpdateTimer);
   displayUpdateTimer=NULL;   
}
void startTimer(){
  requeststopp--;
  if(!timeriststopped)return;
  if(requeststopp>0)return;
  displayUpdateTimer = timerBegin(0, 80, true);//id,divider,countUp, true=edge type 
  timerAttachInterrupt(displayUpdateTimer, &onDisplayUpdate, true);//timer,function,
  timerAlarmWrite(displayUpdateTimer, 2, true);//2  *timer,interruptAt,autoreload
   //timerStart(displayUpdateTimer);
   timerAlarmEnable(displayUpdateTimer);
   timeriststopped=false;
}

void stoptasks(){
   istupdating=true;
   stoppTimer(true);   
   //vTaskDelete(xHandleCoreTask);
   vTaskDelete(xHandleDrawTask);
   //vTaskDelete(xHandleRenderTask);
   Serial.println("Task & Timer stopped");
}



#define RenderWait 16
int renderupdatecountermax=36;

void renderTask( void * pvParameters ){//80Mhz 80000000Hz (240 MHz)
    int ic;
    int i;
    int iloop;
    byte temp=0;
//4 Bitebenen = 320 + 640 + 1280 + 2560 = 4800 Ticks pro Zeile
 //32x32 208,33 Hz ~200Hz  200 t/sec -> 5ms

//1.000.000us=1.000ms = 1sec
 
    Serial.println("rendertaskt "+String(portTICK_PERIOD_MS));//1
    while(true){
        //10 lops for brightness

        for(ic=0;ic<15;ic++){
          for(i=0;i<16;i++){//row/2
           matrix.updateRow();//2x16 Zeilen
           matrix.updateOn();
           delayMicroseconds(renderupdatecountermax); //26 223 319 11
          
           //vTaskDelay(1); //vTaskDelay(timeValInMillisecs/portTICK_PERIOD_MS)

           }
        }
       /* for(ic=0;ic<15;ic++){
          for(i=0;i<16;i++){
              matrix.updateOff();
              matrix.updateOn();
              delayMicroseconds(renderupdatecountermax);
          }
         // delayMicroseconds(renderupdatecountermax); //1490
       }*/
        //matrix.updateOff();
        //delayMicroseconds(renderupdatecountermax); 

// 60/sec  

/*
  (10*Helligkeit)
  
   15* für alle Farbabstufungen  -
   32 Spalten                    /
    2x16 Zeilen(2 gleichzeitig)  -> drawRow()+on()
  
*/

         //10 lops for brightness
        //matrix.update(); //Display OFF-time (25 µs). / 10 //call every 1-3µs!
       /* delayMicroseconds(RenderWait); //2µs
        matrix.update();//..|  9
        delayMicroseconds(RenderWait); //2µs
        matrix.update();//  |  8
        delayMicroseconds(RenderWait); //2µs
        matrix.update();//  |  7 
        delayMicroseconds(RenderWait); //2µs
        matrix.update();//  on 6
        delayMicroseconds(RenderWait); //2µs
        matrix.update();//  on 5
        delayMicroseconds(RenderWait); //2µs
        matrix.update();//  on 4
        delayMicroseconds(RenderWait); //2µs
        matrix.update();//  on 3
        delayMicroseconds(RenderWait); //2µs
        matrix.update();//  on 2
        delayMicroseconds(RenderWait); //2µs
        matrix.update();//..on 1
          //2µs
          */
        //*16
       
       // 16 MHz, for example, 1600 instructions in 0.1 ms.
       // 80 MHz, for example, 8000 instructions in 0.1 ms.?
     /*  */
      //2 = 500
      //800,154,190,210,216,603
      //156
     /*   int v;
      for(i=0;i<renderupdatecountermax;i++){
         v++;
       }
*/ 
      //portTICK_PERIOD_MS = 10;
      // vTaskDelay(1000 / portTICK_PERIOD_MS);
    
     // vTaskDelay(1);//Delay a task for a given number of ticks
      
      //delay(1);//ms
       // yield();
    }
 
}



void coreTask( void * pvParameters ){
  String taskMessage = ">>>Task running on core ";
  taskMessage = taskMessage + xPortGetCoreID();
  int ctcounter=0;
  while(true){
    handleSerial();
    if(!istupdating){
        if(wifiaktiv){
          ArduinoOTA.handle();
          server.handleClient();
          handleTime();
        }
        /*  */
        ctcounter++;
       // if(int(ctcounter/10.0)*10==ctcounter) Serial.println('>'+String(ctcounter));
        if(ctcounter>10){
          String s=taskMessage+" coreTask ";
          if(ntp_stunde<10)s+="0";
          s+=String(ntp_stunde)+":";
          if(ntp_minute<10)s+="0";
          s+=String(ntp_minute)+":";
          if(ntp_secunde<10)s+="0";
          s+=String(ntp_secunde)+" ";
          //s+=String(ctcounter,DEC);
          if(wifiaktiv==true)
            s+=" *";
            else
            s+=" -";
         if(sommerzeitchecked==true)
            s+=" SZ:checked";
            else
            s+=" SZ:nochecked";
           
          Serial.println(s);
          ctcounter=0;
        }
    }
    delay(100);   
  }
  vTaskDelete( NULL );
}



void loop() {// the main loop functions execute on core 1 
  // while (true){}
}


//------------------------------------------------------------------------------------------

void handleTime(){
  unsigned long currentMillis = millis();
  if( currentMillis - ntp_previousMillis > ntp_zeitchecker){//alle 5min
     ntp_previousMillis = currentMillis;
     getNTPTime();
     ntp_zcheckerversuche=0;
  }
  if(ntpangefragt && currentMillis - ntp_previousMillisWaitNTP > ntp_zeitcheckerWaitNTP){//1sec
     ntp_previousMillisWaitNTP = currentMillis;
     Serial.print("check NTP...");
     ntp_zcheckerversuche++;
     Serial.println(ntp_zcheckerversuche);
     if(hatntptime && ntp_zcheckerversuche>ntp_zcheckerversuchemax){
      ntpangefragt=false;
      ntp_zcheckerversuche=0;
     }
     checkNTPTime();
  }
  if(hatntptime && currentMillis - uhr_previousMillis > uhr_zeitchecker){//Uhr alle Sec aktualisieren
      uhr_previousMillis = currentMillis;
      
      unsigned long diff = (millis()-ntp_timestamp)/1000;
      unsigned long epoch = ntp_unixtime + diff + ntp_timeDIFF;//sec
      bool szchecked=false;
      if(ntp_year>0){
        if(summertime (ntp_year,ntp_month, ntp_day, ntp_stunde, 1)){
          epoch +=3600;//sec=1h; Sommerzeit +1h 
        }
        szchecked=true;
      }
      unsigned long tday = epoch / 86400L + 3;
     
      ntp_wochentag=(tday) % 7;            // Since January 1, 1970 was a Thursday the results are: 0=Do
      ntp_stunde=(epoch  % 86400L) / 3600;
      ntp_minute=(epoch  % 3600) / 60;
      ntp_secunde=epoch % 60;

     
      time_t rawtime = epoch;
      struct tm * ti;
      ti = localtime (&rawtime);
      ntp_year=ti->tm_year + 1900;
      ntp_month=ti->tm_mon + 1;
      ntp_day=ti->tm_mday;

      if(szchecked)sommerzeitchecked=true;
      /*
      ti->tm_hour; ti->tm_min;ti->tm_sec;
      */
  }
 /* if(hatntptime && currentMillis - tim_previousMillis > tim_zeitchecker){//Timer alle 30sec checken
      tim_previousMillis = currentMillis;
      if(last_minute!=ntp_minute){//nur 1x pro min
        checktimer();
        last_minute=ntp_minute;
     }
   }
  */  
}


//-----INI-----
String getINI(String name){//setup, serial.read
  String re="";
  File iniFile;
  String zeile;
  char zeichen;
  int pos;
  if(SPIFFS.exists("/setup.ini")){
    iniFile = SPIFFS.open("/setup.ini", "r");
    if(iniFile){
      while (iniFile.available()){
           zeichen=char(iniFile.read());  
           if(zeichen==char(10)){
              pos=zeile.indexOf("=");
              String sname =zeile.substring(0,pos);
              String svalue=zeile.substring(pos+1);
              pos=svalue.indexOf(";");
              if(pos>0)svalue=svalue.substring(0,pos);
              if(sname==name){
                re=svalue;
              }
              zeile="";
           }else{
             zeile +=zeichen;
           }
      }
    }
  }
  return re;
}

bool setINI(String name,String wert){
  bool re=false;
  bool ersetzt=false;
  File iniFile;
  String zeile;
  String newfiledata="";
  char zeichen;
  int pos;
  
  Serial.print("saveINI "+name+"="+wert+" ");
  //save in setup.ini
  if(SPIFFS.exists("/setup.ini")){
    iniFile = SPIFFS.open("/setup.ini", "r");
    if(iniFile){
      //chek ob Wert vorhanden, wenn dann Zeile ersetzen
      zeile="";
      while (iniFile.available()){
           zeichen=char(iniFile.read());  
           if(zeichen==char(10)){
              pos=zeile.indexOf("=");
              String sname =zeile.substring(0,pos);
              if(sname==name){
                 if(wert.length()>0)
                    newfiledata+=name+"="+wert+";"+char(10);
                  else{
                    Serial.print("deleted ");
                  }
                 ersetzt=true;
                }
              else
                newfiledata+=zeile+char(10);
              
              zeile="";
           }else{
             zeile +=zeichen;
           }
      }
     iniFile.close();

     if(!ersetzt){//add wenn nicht existent und nicht leer
       if(wert.length()>0)
          newfiledata+=name+"="+wert+";"+char(10);
     }
     
     //save
     iniFile = SPIFFS.open("/setup.ini", "w");
     if(iniFile){
       iniFile.print(newfiledata);
       re=true;Serial.println("OK");
     }
    }
  }
  else{
    iniFile = SPIFFS.open("/setup.ini", "w");
    if(iniFile){
      iniFile.println(name+"="+wert+";");
      re=true;
      Serial.println(" create OK");
    } 
  }
   iniFile.close();
  if(re==false) Serial.println("ERR");

  return re;
}

//------Serial----------
void handleSerial(){
 int serialcountin=Serial.available();
 if (serialcountin > 0) {//Get the number of bytes (characters) available for reading from the serial port
      // read the incoming byte:
      String instr="";
      byte inp;
      int pos;
      for(int i=0;i<serialcountin;i++){
        inp=Serial.read();//10=LF
        if(inp>31)
          instr+= (char)inp;
      }

      pos=instr.indexOf("=");//befehl=value
      if(pos>-1){
        String sname=instr.substring(0,pos);
        String svalue=instr.substring(pos+1);
        Serial.println("Serialinput Name:"+sname+" Wert:"+svalue);
        
        if(sname=="setssid")
          {ssid=svalue;     
           stoppTimer(false);
           setINI("ssid",svalue);
           startTimer();
          }
        else
      if(sname=="setpass")
          {
            ssid=svalue;     
            stoppTimer(false);
            setINI("pass",svalue);
            startTimer();
          }
       else
       if(sname=="ESP" ){
            Serial.print("ESP ");
            if(svalue=="reboot"){
               Serial.println("start reboot");
               ESP.restart();
             }
            else
            if(svalue=="getssid")
                {
                   Serial.println(getINI("ssid"));
                }
            else
            if(svalue=="getpass")
                {
                   Serial.println(getINI("pass"));
                }
            else
            if(svalue=="gettime")
                {
                  if(ntp_stunde<10)Serial.print("0");
                  Serial.print(String(ntp_stunde)+":");
                  if(ntp_minute<10)Serial.print("0");
                  Serial.print(String(ntp_minute)+":");
                  if(ntp_secunde<10)Serial.print("0");
                  Serial.println(String(ntp_secunde));
                }
            else 
            if(svalue=="getdate")
                {
                  if(ntp_day<10)Serial.print("0");
                  Serial.print(String(ntp_day)+".");
                  if(ntp_month<10)Serial.print("0");
                  Serial.println(String(ntp_month)+"."+String(ntp_year));
                }
            else 
            if(svalue=="getwifistat")
                {
                  if(wifiaktiv)
                    Serial.println("true");
                    else
                    Serial.println("false");
                }
           else 
            if(svalue=="hatntp")
                {
                  if(hatntptime)
                    Serial.println("true");
                    else
                    Serial.println("false");
                }
            else
            {
               Serial.println(svalue);
            }
        }else{
         // saveINI(sname,svalue);
         //Serial.println("read "+sname+'='+svalue);
        }
        
      }
      else{
        // say what you got:
        Serial.print("I received: "+instr+" ");
        Serial.print(serialcountin);
        Serial.println(" byte");
      }
      //Serial.println(incomingByte, DEC);
   }   
}

void handleaktion(){//HTTP: /aktion?refresh=605
  stoppTimer(true);
  

  String message = "{\r\n";
  String aktionen = "";
  
  for (uint8_t i = 0; i < server.args(); i++) {
    if (server.argName(i) == "settimekorr") {
       ntp_timeDIFF= server.arg(i).toInt();
       aktionen +="set_timekorr ";
       message +="\"settimekorr\":\"true\",\r\n";
    }
    if (server.argName(i) == "refresh") {
      aktionen+="setrenderupdatecountermax ";
      if(server.arg(i).length()>0){
        renderupdatecountermax=server.arg(i).toInt();
        message +="\"renderupdatecountermax\":\""+String(renderupdatecountermax,DEC)+"\",\r\n";
      }else{
        message +="\"renderupdatecountermax\":\""+String(renderupdatecountermax,DEC)+"\",\r\n";
      }
    }
    if (server.argName(i) == "play") {
       //load file to playfiledata
       Serial.print("play ");
       Serial.println(server.arg(i));
       setplayfiledata(server.arg(i));
       aktionen +="play ";
       message +="\"play\":\""+server.arg(i)+"\",\r\n";
    }
    if (server.argName(i) == "stop") {
       playfile="";
       aktionen +="stop ";
       message +="\"stop\":\""+server.arg(i)+"\",\r\n";
       Serial.println("stop");
    }
    
    if (server.argName(i) == "display") {
       message +="\"display\":";
       if (server.arg(i) == "on" ){
            DisplayOn=true;
            message +="true";
        }
        else{
          DisplayOn=false;
          message +="false";
         }
        message +=",\r\n";
    }
   /* if (server.argName(i) == "led") {
       if (server.arg(i) == "on" ){
            digitalWrite(LED_PIN, true);
             aktionen +="LED_ON ";
        }
       if (server.arg(i) == "off"){
            digitalWrite(LED_PIN, false);
             aktionen +="LED_OFF ";
       }
    }*/
  }
  message +="\"aktionen\":\""+aktionen+"\"\r\n";
  message +="}";
  server.send(200, "text/html", message ); 
   
  startTimer();
}

void handleRoot()
{
  stoppTimer(true);
  if(!handleFileRead("/index.htm")){
    String html = basichtml;
    html+="<h1>"+String(progversion)+"</h1>\r\n";
    html+="<p>:-)</p>\r\n";
    html+="<nav>";
    html+="<a href=\"/setup.htm\">setup</a>\r\n";
    html+="</nav>";
    html+="</body>\r\n</html>\r\n";
    server.setContentLength(html.length());
    server.send(200,"text/html",html);
  }
  startTimer();
}


void handleSetup(){//setup, upload,...
  stoppTimer(true);
  String html = basichtml;
  html+="<h1>Setup - "+String(progversion)+"</h1>\r\n";
  html+="<nav>";
  html+="<a href=\"/index.htm\">index</a>\r\n";
  html+="</nav>";
   
  
  String tmp="<table class=\"files\">\n";  
  String fileName;       
  File root = SPIFFS.open("/");
  if(root.isDirectory()){
        File file = root.openNextFile();
        while(file){
                if(!file.isDirectory()){//nur root
                    fileName=file.name();
                    Serial.print(fileName);
                    Serial.print(" ");
                    Serial.println(file.size());
                    tmp+="<tr>\r\n";
                    tmp+="\t<td><a target=\"_blank\" href =\"" + fileName + "\"" ;
                    if(isdownload(fileName)){
                      tmp+= " download=\"" + fileName+ "\"" ;
                      tmp+= " class=\"dl\"";
                      tmp+= " title=\"Download\"";
                    }else{
                       tmp+= " title=\"show\"";
                    }
                    tmp+= " >" + fileName.substring(1) + "</a>";
                    tmp+="</td>\n\t<td class=\"size\">" + formatBytes(file.size())+"</td>\n\t<td class=\"action\">";
                    tmp+="<a href =\"" + fileName + "?delete=" + fileName + "\" class=\"fl_del\"> löschen </a>";
                    tmp+="</td>\r\n</tr>\r\n";
            
                }
                file = root.openNextFile();
        }
        //static
        tmp+="<tr>\n";
        tmp+="\t<td><a target=\"_blank\" href =\"data.json\" title=\"show\">data.json</a>";
        tmp+= "</td>\n\t<td class=\"size\"></td>\n\t<td class=\"action\">";
        tmp+="\t</td>\n</tr>\n";
        

        tmp += "<tr><td colspan=\"3\">";
        
        tmp += formatBytes(SPIFFS.usedBytes()); //502
        tmp += " von ";
        tmp += formatBytes(SPIFFS.totalBytes()); //1374476byte=1.31MB 
        tmp += " (";
        tmp += float(int(100.0/SPIFFS.totalBytes()*SPIFFS.usedBytes()*100.0)/100.0);
        tmp += "%)";
        Serial.print("SPIFFS usedBytes:");
        Serial.print(SPIFFS.usedBytes());
        Serial.print(" total:");
        Serial.print(SPIFFS.totalBytes());
        Serial.println("");
        tmp+="</td></tr></table>\n";
  }
  html+=tmp;
  
  html+="<form class=\"upload\" method=\"POST\" action=\"/upload\" enctype=\"multipart/form-data\">";
  html+="<input type=\"file\" name=\"upload\" required>\r\n";
  html+="<input type=\"submit\" value=\"Upload\" class=\"button\">\n</form>\r\n";

  html+="</body>\r\n</html>\r\n";
  server.setContentLength(html.length());
  server.send(200,"text/html",html);

  startTimer();
}

void handleData(){// data.json
 stoppTimer(true);
 Serial.println("GET>data.json");
 
  String message = "{\r\n";
  String aktionen = "";

  //übergabeparameter?
  for (uint8_t i = 0; i < server.args(); i++) {
    aktionen +=server.argName(i);
    aktionen +=server.arg(i);
   /*if (server.argName(i) == "settimekorr") {
       ntp_timeDIFF= server.arg(i).toInt();
       aktionen +="set_timekorr ";
    }
    if (server.argName(i) == "led") {
       if (server.arg(i) == "on" ){
            digitalWrite(LED_PIN, true);
             aktionen +="LED_ON ";
        }
       if (server.arg(i) == "off"){
            digitalWrite(LED_PIN, false);
             aktionen +="LED_OFF ";
       }
    }*/
  }
 Serial.println(" >"+aktionen);
 
  message +="\"aktionen\":\""+aktionen+"\",\r\n";
  message +="\"progversion\":\""+String(progversion)+"\",\r\n";
  
  message +="\"cpu_freq\":\""+String(ESP.getCpuFreqMHz())+"\",\r\n";
  message +="\"chip_ChipRevision\":\""+String(ESP.getChipRevision())+"\",\r\n";
  message +="\"chip_FreeHeap\":\""+String(ESP.getFreeHeap())+"\",\r\n";
  message +="\"chip_CycleCount\":\""+String(ESP.getCycleCount())+"\",\r\n";
  message +="\"chip_SdkVersion\":\""+String(ESP.getSdkVersion())+"\",\r\n";
  message +="\"chip_FlashChipSize\":\""+String(ESP.getFlashChipSize())+"\",\r\n";
  message +="\"chip_FlashChipSpeed\":\""+String(ESP.getFlashChipSpeed())+"\",\r\n";
  message +="\"chip_FlashChipMode\":\""+String(ESP.getFlashChipMode())+"\",\r\n";

  message +="\"aniaktiv\":\""+getINI("aniaktiv")+"\",\r\n";
 

//  ntp_stunde
  message +="\"lokalzeit\":\"";
  if(ntp_stunde<10)message+="0";
  message+=String(ntp_stunde)+":";
  if(ntp_minute<10)message+="0";
  message+= String(ntp_minute)+":";
  if(ntp_secunde<10)message+="0";
  message+=String(ntp_secunde);
  message +="\",\r\n";
  
  message +="\"tag\":"+String(ntp_wochentag)+",\r\n";

  message +="\"datum\":{\r\n";
  message +=" \"year\":"+String(ntp_year)+",\r\n";
  message +=" \"month\":"+String(ntp_month)+",\r\n";
  message +=" \"day\":"+String(ntp_day)+",\r\n";

// input parameters: "normal time" for year, month, day, hour and tzHours (0=UTC, 1=MEZ)  
  if(summertime (ntp_year,ntp_month, ntp_day, ntp_stunde, 1))
    message +=" \"summertime\":true\r\n";
  else
    message +=" \"summertime\":false\r\n";
  message +="},\r\n";

  message +="\"timekorr\":"+String(ntp_timeDIFF);
  /**/
 
   message +="\"macadresse\":\""+macadresse+"\",\r\n";
   message +="\"requeststopp\":\""+String(requeststopp)+"\",\r\n";

    message +="\"fstotalBytes\":"+String(SPIFFS.totalBytes())+",\r\n";
    message +="\"fsusedBytes\":"+String(SPIFFS.usedBytes())+",\r\n";
    message +="\"fsused\":\"";
    message +=float(int(100.0/SPIFFS.totalBytes()*SPIFFS.usedBytes()*100.0)/100.0);
    message +="%\",\r\n";

    message +="\"files\":[\r\n";
    String fileName;
    uint8_t counter=0;
    File root = SPIFFS.open("/");
    if(root.isDirectory()){
          File file = root.openNextFile();
          while(file){
                  if(!file.isDirectory()){//nur root
                      fileName=file.name();
                      if(counter>0)  message +=",\r\n";
                      message +=" {";
                      message +="\"fileName\":\""+fileName+"\", ";
                      message +="\"fileSize\":"+String(file.size());
                      message +="}";
                      counter++; 
                  }
                  file = root.openNextFile();
          }
     }
    message +="\r\n]\r\n";
       

  message +="\r\n}";
  
  server.send(200, "text/html", message );
  Serial.println("send data.json");
   
  startTimer();
}



void handleFileUpload() {          // Dateien ins SPIFFS schreiben
  stoppTimer(true);
  setplayfiledata("");
  HTTPUpload& upload = server.upload();
  if (upload.status == UPLOAD_FILE_START) {
    String filename = upload.filename;
    Serial.print("handleFileUpload Name: "); Serial.println(filename);
    if (filename.length() > 30) {
      int x = filename.length() - 30;
      filename = filename.substring(x, 30 + x);
    }
    filename = server.urlDecode(filename);
    filename = "/" + filename;
    Serial.print("handleFileUpload Name: "); Serial.println(filename);
    fsUploadFile = SPIFFS.open(filename, "w");
    if(!fsUploadFile) Serial.println("!! file open failed !!");
   
    //filename = String();
    
  } else if (upload.status == UPLOAD_FILE_WRITE) {
    if (fsUploadFile){
        Serial.print("handleFileUpload Data: "); Serial.println(upload.currentSize);
        fsUploadFile.write(upload.buf, upload.currentSize);
      }
  } else if (upload.status == UPLOAD_FILE_END) {
    if (fsUploadFile){
      fsUploadFile.close();
      Serial.println("close");
    }
    yield();
    Serial.print("handleFileUpload Size: "); Serial.println(upload.totalSize);
    server.sendContent("HTTP/1.1 303 OK\r\nLocation:/setup.htm\r\nCache-Control: no-cache\r\n\r\n");
    startTimer();
  }
}
void handleNotFound() {
 stoppTimer(true);

  //--check Dateien im SPIFFS--
 if(!handleFileRead(server.uri())){ 
    //--404 als JSON--
    String html = basichtml;
    html+="<h1>404</h1>\r\n";
    html+="<p>"+server.uri()+" not found</p>\r\n";
    html+="</body>\r\n</html>\r\n";
    server.setContentLength(html.length());
    server.send(404,"text/html",html); 
   
    String message = "404,";
    message += server.uri();
    message += ",";
    message += (server.method() == HTTP_GET) ? "GET" : "POST";
    Serial.println( message); 
  }
   
  startTimer();
}

void WiFiEvent(WiFiEvent_t event)
{
    //2 4 7 
    switch(event) {
    case SYSTEM_EVENT_STA_START://2 
        Serial.println("STA_START");
        break;
    case SYSTEM_EVENT_STA_CONNECTED://4
        Serial.println("STA_CONNECTED");
        wifiaktiv=true;
        break;
    case SYSTEM_EVENT_STA_GOT_IP://7
        Serial.print("GOT_IP: ");
        Serial.println(WiFi.localIP());
        break;
    case SYSTEM_EVENT_STA_DISCONNECTED:
        Serial.println("STA_DISCONNECTED: WiFi lost connection");
        wifiaktiv=false;
        break;
    case SYSTEM_EVENT_STA_WPS_ER_SUCCESS:           //ESO32 station wps succeeds in enrollee mode
        Serial.println("SYSTEM_EVENT_STA_WPS_ER_SUCCESS");
        break;
    default:
        Serial.printf("[WiFi-event] event: %d\n", event);
    }
    /*http://esp-idf.readthedocs.io/en/latest/api-guides/wifi.html#system-event-sta-connected
     SYSTEM_EVENT_STA_START
     SYSTEM_EVENT_STA_STOP
     SYSTEM_EVENT_STA_CONNECTED
     SYSTEM_EVENT_STA_AUTHMODE_CHANGE
     SYSTEM_EVENT_AP_STA_GOT_IP6
    */
}


//----------helper-----------
//format bytes
String formatBytes(size_t bytes) {
  if (bytes < 1024) {
    return String(bytes) + "B";
  } else if (bytes < (1024 * 1024)) {
    return String(bytes / 1024.0) + "KB";
  } else if (bytes < (1024 * 1024 * 1024)) {
    return String(bytes / 1024.0 / 1024.0) + "MB";
  } else {
    return String(bytes / 1024.0 / 1024.0 / 1024.0) + "GB";
  }
}
String getContentType(String filename) {              // ContentType für den Browser
  if (filename.endsWith(".htm")) return "text/html";
  else if (filename.endsWith(".html")) return "text/html";
  //else if (filename.endsWith(".json")) return "text/plain";
  else if (filename.endsWith(".css")) return "text/css";
  else if (filename.endsWith(".js")) return "application/javascript";
  else if (filename.endsWith(".png")) return "image/png";
  else if (filename.endsWith(".gif")) return "image/gif";
  else if (filename.endsWith(".jpg")) return "image/jpeg";
  else if (filename.endsWith(".ico")) return "image/x-icon";
  else if (filename.endsWith(".xml")) return "text/xml";
  else if (filename.endsWith(".pdf")) return "application/x-pdf";
  else if (filename.endsWith(".zip")) return "application/x-zip";
  else if (filename.endsWith(".gz")) return "application/x-gzip";
  return "text/plain";
}
bool isdownload(String filename) {     // download oder anzeigen im Browser
  if (filename.endsWith(".htm")) return false;
  else if (filename.endsWith(".json")) return false;
  else if (filename.endsWith(".html")) return false;
  else if (filename.endsWith(".css")) return false;
  else if (filename.endsWith(".js")) return false;
  else if (filename.endsWith(".xml")) return false;
  else if (filename.endsWith(".txt")) return false;
  else if (filename.endsWith(".png")) return false;
  else if (filename.endsWith(".gif")) return false;
  else if (filename.endsWith(".jpg")) return false;
  else if (filename.endsWith(".svg")) return false;
  else if (filename.endsWith(".ico")) return false;
  else if (filename.endsWith(".pdf")) return false;
  else if (filename.endsWith(".ini")) return false;
  return true;
}

#define STREAMFILE_BUFSIZE 2*1460

bool handleFileRead(String path) {
  if(server.hasArg("delete")) {
    Serial.print("delete: ");
    Serial.print(server.arg("delete"));
    if(SPIFFS.remove(server.arg("delete")))                    //hier wir gelöscht
        Serial.println(" OK");
        else
        Serial.println(" ERR");
    server.sendContent("HTTP/1.1 303\nLocation:/setup.htm\r\nCache-Control: no-cache\r\n\r\n");
    return true;
  }
  //if (path.endsWith("/")) path += "index.html";
  path = server.urlDecode(path);
  String pathWithGz = path + ".gz";
  String msg="GET "+path;
  if (SPIFFS.exists(pathWithGz)) path += ".gz";
  if (SPIFFS.exists(path)) {
    msg+=" send "+path+" ";
    File file = SPIFFS.open(path, "r");
    //https://github.com/bbx10/WebServer_tng   
    size_t totalBytesOut = server.streamFile(file, getContentType(path));
    file.close();
    msg+=String(totalBytesOut)+" byte";
    Serial.println(msg);
    return true;
  }
  Serial.println(msg+" 404");

  return false;
}

//NTP
// send an NTP request to the time server at the given address
unsigned long sendNTPpacket(IPAddress& address)
{
  Serial.println("sending NTP packet...");
  // set all bytes in the buffer to 0
  memset(packetBuffer, 0, NTP_PACKET_SIZE);//48byte
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
  udp.write(packetBuffer, NTP_PACKET_SIZE);
  udp.endPacket();
}
void getNTPTime(){
  Serial.print("ServerNTP:");
  Serial.print(ntpServerName);
  Serial.print(" ");
  if(WiFi.hostByName(ntpServerName, timeServerIP)){
    Serial.println(timeServerIP);
    sendNTPpacket(timeServerIP); // send an NTP packet to a time server
    ntpangefragt=true;
  }
  else{
     Serial.println("noIP");
     ntpangefragt=false;
     if ( WiFi.status() != WL_CONNECTED ) Serial.println("no connect");
     //Reeboot ?
     //OTA.setup(WIFI_SSID, WIFI_PASSWORD, ARDUINO_HOSTNAME);

    //digitalWrite(LED_PIN, true);
    //delay(500);
    //digitalWrite(LED_PIN, false);
    //delay(250);
  }
  yield();
}
void checkNTPTime(){ 
  int cb = udp.parsePacket();
  if (cb) {
    ntp_timestamp=millis();
    //Serial.print("empfangen NTP:");
    //Serial.println(cb);
    udp.read(packetBuffer, NTP_PACKET_SIZE); // read the packet into the buffer (48bytes)
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
    Serial.print("Seconds since Jan 1 1900 = " );
    Serial.println(secsSince1900);
    ntp_thetime=secsSince1900;
    // now convert NTP time into everyday time:
    Serial.print("Unix time = ");
    // Unix time starts on Jan 1 1970. In seconds, that's 2208988800:
    const unsigned long seventyYears = 2208988800UL;
    // subtract seventy years:
    unsigned long epoch = secsSince1900 - seventyYears;
    
    // print Unix time:
    ntp_unixtime=epoch;
    Serial.println(epoch);
    
    Serial.print("The UTC time is ");       // UTC is the time at Greenwich Meridian (GMT)
    Serial.print((epoch  % 86400L) / 3600); // print the hour (86400 equals secs per day)

    ntp_stunde=(epoch  % 86400L) / 3600;
    
    Serial.print(':');
    if ( ((epoch % 3600) / 60) < 10 ) {
      // In the first 10 minutes of each hour, we'll want a leading '0'
      Serial.print('0');
    }
    Serial.print((epoch  % 3600) / 60); // print the minute (3600 equals secs per minute)
    ntp_minute=(epoch  % 3600) / 60;
    
    Serial.print(':');
    if ( (epoch % 60) < 10 ) {
      // In the first 10 seconds of each minute, we'll want a leading '0'
      Serial.print('0');
    }
    Serial.println(epoch % 60); // print the second
    ntp_secunde=epoch % 60;

    ntp_zeitchecker= ntp_zeitcheckeriftime;
    hatntptime=true;
    ntpangefragt=false;
  }
}


//https://github.com/gmag11/NtpClient/blob/master/src/NTPClientLib.cpp
// input parameters: "normal time" for year, month, day, hour and tzHours (0=UTC, 1=MEZ)
bool summertime (int year, byte month, byte day, byte hour, byte tzHours)
{
    if ((month < 3) || (month > 10)) return false; // keine Sommerzeit in Jan, Feb, Nov, Dez
    if ((month > 3) && (month < 10)) return true; // Sommerzeit in Apr, Mai, Jun, Jul, Aug, Sep
    if (month == 3 && (hour + 24 * day) >= (1 + tzHours + 24 * (31 - (5 * year / 4 + 4) % 7)) 
     || month == 10 && (hour + 24 * day) < (1 + tzHours + 24 * (31 - (5 * year / 4 + 1) % 7)))
        return true;
    else
        return false;
}

//------------------------RGBMatrix----------------------------------
void getRGB(int hue, int sat, int val, int colors[3]) {
   int r;
   int g;
   int b;
   int base;

   if (sat == 0) { // Acromatic color (gray). Hue doesn't mind.
     colors[0] = val;
     colors[1] = val;
     colors[2] = val;
   }
   else {

     base = ((255 - sat) * val) >> 8;

     switch (hue / 60) {
     case 0:
       r = val;
       g = (((val - base)*hue) / 60) + base;
       b = base;
       break;

     case 1:
       r = (((val - base)*(60 - (hue % 60))) / 60) + base;
       g = val;
       b = base;
       break;

     case 2:
       r = base;
       g = val;
       b = (((val - base)*(hue % 60)) / 60) + base;
       break;

     case 3:
       r = base;
       g = (((val - base)*(60 - (hue % 60))) / 60) + base;
       b = val;
       break;

     case 4:
       r = (((val - base)*(hue % 60)) / 60) + base;
       g = base;
       b = val;
       break;

     case 5:
       r = val;
       g = base;
       b = (((val - base)*(60 - (hue % 60))) / 60) + base;
       break;
     }

     colors[0] = r;
     colors[1] = g;
     colors[2] = b;
   }
 }

//----------------Animation auswerten und anzeigen----------------------------


bool setplayfiledata(String filname){
  if (SPIFFS.exists(filname)){
    anifilepos=0;
    anifileframecounter=0;
    playfile=filname;
    return true;
   }
   else{//nicht existent
    playfile="";
    anifilepos=0;
    anifileframecounter=0;
    return false;
  }
}

//Helper
uint8_t getByte(char wert){ //0..F -> 0..15  halbes Byte
  if(wert>47 && wert<58)  //0123456789     //48=ASCII"0"
     return wert-48; 
  if(wert>64 && wert<71)  //ABCDEF
     return wert-65+10; 
  if(wert>96 && wert<104)  //abcdef
     return wert-97+10; 
  return 0; 
}
uint16_t get_color(char *cahrlist, uint8_t pos){//rgb 0..F für Color444
  uint8_t r=getByte(cahrlist[pos]);
  pos++;
  uint8_t g=getByte(cahrlist[pos]);
  pos++;
  uint8_t b=getByte(cahrlist[pos]);
  //color444
  uint16_t re=((r & 0xF) << 12) | ((r & 0x8) << 8) |
       ((g & 0xF) <<  7) | ((g & 0xC) << 3) |
       ((b & 0xF) <<  1) | ((b & 0x8) >> 3);
  return re;
}

uint32_t get_int(char *cahrlist, uint8_t pos,uint16_t len){
  uint32_t re=0;
  uint32_t t=0;
  uint32_t mul=1;   //uint16_t nur bis 65535 
  int posi;
  for(t=0;t<len;t++){
    posi=pos+len-1-t;
    re=re+getByte(cahrlist[posi]) * mul;
    mul=mul * 10;//Zahl ist dezimal
  }
  return re;
}

void drawBefehl(char *clientline){
  if(clientline[0]=='f'){
    matrix.fillScreen(get_color(clientline,1)); 
  }
  if(clientline[0]=='l'){
           /* matrix.drawLine(get_int(clientline,1,2),
                            get_int(clientline,3,2),
                            get_int(clientline,5,2),
                            get_int(clientline,7,2),
                            get_color(clientline,9)
                            );*/
            matrix.drawLine(get_int(clientline,1,2),
                            get_int(clientline,3,2),
                            get_int(clientline,5,2),
                            get_int(clientline,7,2),
                            matrix.AdafruitColor( 
                                get_int(clientline,9,1)*16,
                                get_int(clientline,10,1)*16,
                                get_int(clientline,11,1)*16
                                )
                            );
  }
  if(clientline[0]=='p'){
          /*  matrix.drawPixel(get_int(clientline,1,2),
                             get_int(clientline,3,2), 
                             get_color(clientline,5)
                            );*/
            matrix.drawPixel(get_int(clientline,1,2),
                             get_int(clientline,3,2), 
                             matrix.AdafruitColor( 
                                get_int(clientline,5,1)*16,
                                get_int(clientline,6,1)*16,
                                get_int(clientline,7,1)*16
                                )
                            );//*16
  }
  
  if(clientline[0]=='B'){
     // matrix.swapBuffers(false);
  }
  //if(cahrlist[0]=="d"){}//wurde schon ausgewertet
  
}




/*

if (SPIFFS.exists(filname)){
    playfile=filname;
    File aniFile;
    char zeichen;
    aniFile= SPIFFS.open(filname, "r");
      if(aniFile){
          //playfiledata=aniFile.readString();
        while (iniFile.available()){
               zeichen=char(iniFile.read());  
               playfiledata+=zeichen;
          }
          re=true;
          playfile=filname;// "/filename.ani";
      }
    aniFile.close();*/

