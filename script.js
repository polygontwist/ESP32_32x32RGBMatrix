"use strict";
//32x32 RGB Matrix

//basics
var getpostData =function(url, auswertfunc,POSTdata,noheader,rh){
		var loader,i;
		try {loader=new XMLHttpRequest();}
		catch(e){
				try{loader=new ActiveXObject("Microsoft.XMLHTTP");}
				catch(e){
						try{loader=new ActiveXObject("Msxml2.XMLHTTP");}
						catch(e){loader  = null;}
				}
			}	
		if(!loader)alert('XMLHttp nicht möglich.');
		var jdata=undefined;
		if(POSTdata!=undefined)jdata=POSTdata;//encodeURI
		
		loader.onreadystatechange=function(){
			if(loader.readyState==4)auswertfunc(loader);
			};
		loader.ontimeout=function(e){console.log("TIMEOUT");}
		loader.onerror=function(e){console.log("ERR",e,loader.readyState);}
		
		if(jdata!=undefined){console.log(">>1",url);
				loader.open("POST",url,true);
				if(rh!=undefined){
						for(i=0;i<rh.length;i++){
							loader.setRequestHeader(rh[i].typ,rh[i].val);
						}
				}
				if(noheader!==true){
					//loader.responseType="text";
					loader.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
					//loader.setRequestHeader("Content-Type","text/plain");
					loader.setRequestHeader('Cache-Control','no-cache');
					loader.setRequestHeader("Pragma","no-cache");
					loader.setRequestHeader("Cache-Control","no-cache");
					jdata=encodeURI(POSTdata);//
				}
				loader.send(jdata);console.log(">>3",url);
			}
			else{
				loader.open('GET',url,true);
				loader.setRequestHeader('Content-Type', 'text/plain');
				loader.send(null);
			}
	}
var cE=function(ziel,e,id,cn){
	var newNode=document.createElement(e);
	if(id!=undefined && id!="")newNode.id=id;
	if(cn!=undefined && cn!="")newNode.className=cn;
	if(typeof ziel==="object"){ziel.appendChild(newNode);console.log("*");}
	return newNode;
	}
var gE=function(id){if(id=="")return undefined; else return document.getElementById(id);}
var addClass=function(htmlNode,Classe){	
	var newClass;
	if(htmlNode!=undefined){
		newClass=htmlNode.className;
 
		if(newClass==undefined || newClass=="")newClass=Classe;
		else
		if(!istClass(htmlNode,Classe))newClass+=' '+Classe;	
 
		htmlNode.className=newClass;
	}			
}
var subClass=function(htmlNode,Classe){
		var aClass,i;
		if(htmlNode!=undefined && htmlNode.className!=undefined){
			aClass=htmlNode.className.split(" ");	
			var newClass="";
			for(i=0;i<aClass.length;i++){
				if(aClass[i]!=Classe){
					if(newClass!="")newClass+=" ";
					newClass+=aClass[i];
					}
			}
			htmlNode.className=newClass;
		}
}
var istClass=function(htmlNode,Classe){
	if(htmlNode.className){
		var i,aClass=htmlNode.className.split(' ');
		for(i=0;i<aClass.length;i++){
				if(aClass[i]==Classe)return true;
		}	
	}		
	return false;
}
var filterJSON=function(s){
	var re=s;
	if(re.indexOf("'")>-1)re=re.split("'").join('"');
	try {re=JSON.parse(re);} 
	catch(e){
		console.log("JSON.parse ERROR:",s,":");
		re={"error":"parseerror"};
		}
	return re;
}
 

var iniseite=function(){
	var dateisysinfo="./";
	var plaingfile="";
	var isplaingbutt=undefined;
	
	var fresultpay=function(data){
		console.log(data.responseText);
	}
	
	var klickplay=function(e){
		var befehl="";
		if(isplaingbutt!=undefined)isplaingbutt.innerHTML="play";
		
		if(plaingfile!=this.data.file)
		{
			plaingfile=this.data.file;
			befehl="play="+plaingfile;
			this.innerHTML="pause";
			isplaingbutt=this;
		}
		else{
			plaingfile="";//stopp
			befehl="stop=stop";
		}
		getpostData(dateisysinfo+'aktion?'+befehl,fresultpay);
		e.preventDefault();
	}
	
	var ini=function(){
		var i,a,s,butt;
		var liste=document.getElementsByTagName('a');
		for(i=0;i<liste.length;i++){
			a=liste[i];
			s=a.getAttribute('href');
			if(typeof s === "string"){
				s=s.toLowerCase();
				if( s.indexOf('.ani')>0
					&&
					s.indexOf('.ani?')<0				
				){
					//if(s.indexOf("?")>0)
					butt=cE(undefined,"a",undefined,"f_play");console.log(a,a.getAttribute('href'));
					butt.href="#";
					butt.innerHTML="play";
					butt.data={file:a.getAttribute('href')};
					butt.addEventListener("click",klickplay);
					a.parentNode.appendChild(butt);
					addClass(a,"isanni");
				}
			}
			
		}
		
	}
	
	
	ini();
}





window.addEventListener('load',function(){new iniseite();},false);
