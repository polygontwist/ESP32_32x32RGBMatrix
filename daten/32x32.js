"use strict";
/*
	Version 24-04-2018
TODO:
-save File (request von sonoffs20-Timer!)

	Version 15-43-2014
TODO: 
-colorpicker
-game

*/

//deutsch:
var thetext={
	stat0:"Version: ",
	stat1:"Datenspeicher: ",
	stat1used:"benutzt: ",
	stat2:"aktive Animation: ",
	statMac:"MAC: ",

	hm0:"Status",
	hm1:"Dateien",
	hm2:"Editor",
	
	play:"play",
	stop:"stop",
	edit:"edit",
	del:"del",
	upload:"einlesen",
	frei:"frei",
	
	em0:"<<",
	em1:"Ani",
	em2:"Tools",
	
	em1Sm1:"neu",
	em1Sm2:"speichern",
	
	em2Sm0:"Zeitleiste",
	em2Sm1:"Werkzeuge",
	
	zl0:"add Frame",
	zl1:"del",
	zl2:"refresh",
	zl3:"play",
	zl4:"stop",

	move:"Grafik:",
	mol:"move links",
	mou:"move hoch",
	mob:"move runter",
	mor:"move rechts",
	mturn:"90° drehen",
	clr:"leeren",
	gtest:"am Display testen",
	gpic:"Bild einlesen",
	
	cdlg:"Color-Picker",
	cdlgAbr:"abbrechen",
	cdlgOK:"OK",
	cdlgalt:"alt:",
	cdlgneu:"neu:",
	
	dlg1:"Datei wirklich löschen?",
	dlg2:"Bitte geben Sie einen Namen für die neue Animation ein (8 Zeichen).",
	dlg3:"Neu beginnen?\nEingegebene Daten werden nicht gespeichert!",
	dlg4:"Editor verlassen?\nEingegebene Daten werden nicht gespeichert!",
	dlg5:"Frame wirklich löschen?",

	uploding:"Datei wird übertragen, bitte warten...",
	statload:"loading...",
	statsave:"speichern...",
	dok:"Datei wurde gespeichert."
	
};
function tra(id){
var r=thetext[id]+'';
if(r=="undefined")r=id;
return r; 
}
function gE(id){return document.getElementById(id)}
function agE(o,s){return o.getElementsByTagName(s)}
function cE(t,z,id){
var e=document.createElement(t);
if(id!=undefined)e.id=id;
z.appendChild(e);
return e
}

function getMouseP(e){
return{x:document.all ? window.event.clientX : e.pageX,y:document.all ? window.event.clientY : e.pageY};
}
function getPos(re,o){
while(o!=undefined){
if(o.offsetLeft!=undefined){re.x-=o.offsetLeft;re.y-=o.offsetTop;}
o=o.parentNode;
}
return re;
}
function relMouse(e,o){return getPos(getMouseP(e),o);}

function is_touch_device(){return !!('ontouchstart' in window)|| !!('onmsgesturechange' in window);}

function isLS(){try{return 'localStorage' in window && window['localStorage']!==null;}catch(e){return false}}
function setCo(id,s){if(isLS())localStorage.setItem(id,s);}
function getCo(id){if(isLS())return localStorage.getItem(id);else return ''}



var addClass=function(node,C){	
	var newC;
	if(node!=undefined){
		newC=node.className;
		if(newC==undefined || newC=="")newC=C;
		else
		if(!istClass(node,C))newC+=' '+C;	
		node.className=newC;
	}			
}
 
var subClass=function(node,C){
	var CL,i;
	if(node!=undefined && node.className!=undefined){
		CL=node.className.split(" ");	
		var newC="";
		for(i=0;i<CL.length;i++){
			if(CL[i]!=C){
				if(newC!="")newC+=" ";
				newC+=CL[i];
				}
		}
		node.className=newC;
	}
}
 
var istClass=function(node,C){
	if(node.className){
		var i,CL=node.className.split(' ');
		for(i=0;i<CL.length;i++){
				if(CL[i]==C)return true;
		}	
	}		
	return false;
}



function getXREq(){
	var re;
	try {// Mozilla, Opera, Safari sowie Internet Explorer 
			re=new XMLHttpRequest();
			//if(re.overrideMimeType)re.overrideMimeType('text/text');
			} 
			catch(e){
				try {re=new ActiveXObject("Microsoft.XMLHTTP");} 
				catch(e){
					try {re=new ActiveXObject("Msxml2.XMLHTTP");}
					catch(e){re=null;}
				}
			}
	return re;
}					

var statziel=undefined;
function showSta(s){if(statziel!=undefined)statziel.getMP("astatus").innerHTML=s}

function getDatum(){//jjmttmmm m mmm->hex!
		var d=new Date(),y=d.getFullYear(),mo=d.getMonth()+1,ta=d.getDate(),hh=d.getHours(),mm=d.getMinutes(),ss=d.getSeconds();
		if(mo<10)mo="0"+mo;
		if(ta<10)ta="0"+ta;
		if(hh<10)hh="0"+hh;
		if(mm<10)mm="0"+mm;
		if(ss<10)ss="0"+ss;
		return y+""+mo+""+ta+""+hh+""+mm+""+ss;
	}

function c_menue(ziel){
	var o=this;
	o.z=ziel;
	o.ma=undefined;
	o.m=[];
	o.ul=undefined;
	o.submenue=undefined;
	o.create=function(oList,onclick){
		var o=this,ul,li,a,t;
		ziel.innerHTML="";
		o.m=[];
		o.ma=-1;
		ul=cE("ul",ziel);
		o.ul=ul;
		for(t=0;t<oList.length;t++){
			li=cE("li",ul);
			a=cE("a",li);
			a.innerHTML=oList[t].txt;
			a.data=oList[t];
			a.onclick=clickMP;
			a.oc=onclick;
			a.bm=o;
			a.href="#";
			a.o=oList[t];
			oList[t].a=a;
			o.m.push(a);
		}
		o.setCSS("menue");
		o.submenue=cE("ul",ziel,"DDMenue");
	}
	var clickMP=function(e){
		var o=this;
		if(typeof o.bm.ma==="object")o.bm.ma.className="";		
		o.bm.ma=o;
		o.bm.ma.className="aktiv";	
		if(o.oc)o.oc(e);
		if(e)e.preventDefault();
	}
	o.setCSS=function(s){
		this.ul.className=s;
	}
	o.set=function(nr){
		this.m[nr].onclick();
	}
	o.getMP=function(typ){
		var t,o=this;
		for(t=0;t<o.m.length;t++)
			if(o.m[t].o.typ==typ)return o.m[t];
		return undefined;
	}

	o.DDmenueaktiv="";
	o.clickDD=function(e){
		this.basis.showDDmenue([],null,0,"");
		if(this.oc)this.oc();
		e.preventDefault();
	}
	o.showDDmenue=function(oList,onclick,o, id){
		var li,t,a,ul=this.submenue;
		ul.innerHTML="";		
		ul.style.display="none";
		if(this.DDmenueaktiv!=id && id!=""){
			for(t=0;t<oList.length;t++){
					li=cE("li",ul);
					a=cE("a",li);
					a.href="#";
					a.o=o;
					a.data=oList[t];
					a.liste=oList;
					a.innerHTML=oList[t].txt;//.split('/').join('');
					a.onclick=this.clickDD;
					a.menue=ul;
					a.basis=this;
					a.oc=onclick;
					if(oList[t].aktiv!=undefined){if(oList[t].aktiv)a.className="aktiv";}else a.className="normal";
				}
			ul.style.display="block";
			this.DDmenueaktiv=id;
		}else this.DDmenueaktiv="";
		return ul;
	}
}
function srh(z,a,b){
	z.setRequestHeader(a,b);
}

function uploadgeneratedfile(dateiname,dateidaten,retfunc,statechangefunc){
	var postData =function(url, auswertfunc,POSTdata,rh){
		var loader,i;
		try {loader=new XMLHttpRequest();}
		catch(e){
				try{loader=new ActiveXObject("Microsoft.XMLHTTP");}
				catch(e){
					try{loader=new ActiveXObject("Msxml2.XMLHTTP");}
					catch(e){loader=null;}
				}
			}	
		if(!loader)alert('XMLHttp nicht möglich.');
		loader.onreadystatechange=function(){			
			if(loader.readyState==4)auswertfunc(loader);
				else
				if(typeof statechangefunc==="function" )statechangefunc(loader);
			};
		loader.ontimeout=function(e){console.log("TIMEOUT");}
		loader.onerror=function(e){console.log("ERR",e,loader.readyState);}
		
		if(POSTdata!=undefined){
				loader.open("POST",url,true);
				if(rh!=undefined){
						for(i=0;i<rh.length;i++){
							loader.setRequestHeader(rh[i].typ,rh[i].val);
						}
				}
				loader.send(POSTdata);
			}else{
				alert("Keine Daten zum senden vorhanden.");
			}
	}

	
	var id= (new Date()).getTime();
	var header=[];
	header.push({typ:"Content-Type",val:"multipart/form-data; boundary=---------------------------"+id});
	
	var senddata="-----------------------------"+id+"\r\n";//CR LF
	senddata+="Content-Disposition: form-data; name=\"upload\"; filename=\""+dateiname+"\"\r\n";
	senddata+="Content-Type: multipart/form-data; boundary=---------------------------"+id+"\r\n";
	senddata+="Content-Type: text/plain\r\n";
	senddata+=dateidaten;
	senddata+="-----------------------------"+id+"--\r\n";
	postData("./upload?rel=no", 
				function(data){if(retfunc)retfunc(data); else console.log("uploadstatus",data);},
				senddata,
				header
	);
	
}


function c_Editor(ziel,wos){
	var o=this,
	url="ani.ANI",
	timelineDiv,timelineUL,toolsDiv,
	cDIV=undefined,
	hatdaten=false,
	grid={w:32,h:32, div:undefined, z:undefined},
	aktivColor="#ffffff",
	mouseisdown=false,
	waittime=100,
	frameaktiv=undefined,
	isAniplay=false,
	framecount=0
	;
	
	o.setcDIV=function(div){cDIV=div};
	o.hatdaten=function(){return hatdaten;};
	o.getaktivColor=function(){return aktivColor;}
	o.geturl=function(){return url;}
	
	o.arrTos=function(a){var s="";for(var t=0;t<a.length;t++)s+=a[t]+'\r\n';return s}
	o.saveAni=function(){
		showSta(tra("statsave"));
		var da="",t,f,v,vda;
		var lies=timelineDiv.getElementsByTagName("canvas");
		var inpu=timelineDiv.getElementsByTagName("input");
		
		for(t=0;t<lies.length;t++){
			da+=o.arrTos(compressFrame(lies[t]));
			v=""+inpu[t].value;
			while(v.length<4)v="0"+v;
			da+="d"+v+"\r\n";//#0d cr #0a lf
		}
		console.log(da);
		showSta(tra("statsave")+".");
		
		var statz=0;
		uploadgeneratedfile(url,da,uploadauswertung, 
				function(loader){ 
						statz++;
						if(statz>9)statz=0;
						var s="";
						for(var i=0;i<statz;i++)s+=".";
						showSta(tra("statsave")+s); 
						}
			);
	}
	var uploadauswertung=function(data){
		if(data.status==200){
			showSta("");
			alert(tra("dok"));
			hatdaten=false;
		}
		else{
			showSta("uploadfehler "+data.status);
			console.log(data);
		} 
	}
	
	var get_Color444=function(r,g,b){//#rgb  0..F return String
		return r.toString(16)+''+g.toString(16)+''+b.toString(16);	
	}
		
	var readFrame=function(canvas){//[ [s,s,s,s,...],[s,s,s,...],  ... ] of string
		var p,x,y,r,g,b,z,s,cc,imgd,gh=grid.h,gb=grid.w,d,pix;
		var re=[]; 
		if(canvas!=undefined){cc=canvas.getContext("2d");imgd=cc.getImageData(0,0,gb*2,gh*2);pix=imgd.data;}
		for(y=0;y<gh;y++){
			re.push([]);
			for(x=0;x<gb;x++){
			if(canvas!=undefined){
					d=(x*4*2)+(y*2)*gb*4*2;					
					r=parseInt(15/255*pix[d]);//0..F
					g=parseInt(15/255*pix[d+1]);//0..F
					b=parseInt(15/255*pix[d+2]);//0..F
				}
				else{
					p=gE("pixel_"+x+"_"+y);
					s=p.style.backgroundColor;	
					if(s.length>0){
						s=s.split('rgb').join('').split('(').join('').split(')').join('');		
						s=s.split(' ').join('').split(',');					
						r=parseInt(15/255*s[0]);//0..F
						g=parseInt(15/255*s[1]);//0..F
						b=parseInt(15/255*s[2]);//0..F
					}
					else
					{
						r=0;g=0;b=0;
					}
				}
			re[y].push(get_Color444(r,g,b) );
			}			
		}
		return re;
	}
	
	var compressData=function(data, art){//data=[ [s,s,s,s,...],[s,s,s,...],  ... ]
		var re=["f000"],//clr
			x,y,rgb,x2,y2,lastrgb,xstart,ystart,gz,s,temp;
		
		var checkblock=function(data,qx,qy,rgb){
			//suche größtmögliche zusammenhängende rechteckige Fläche, min 2x2
			var re="",c,tx,ty,
				sizeX=1,
				sizeY=2,
				sizemaxX=data[0].length-qx,
				sizemaxY=data.length-qy,
				fertig=false,
				fertigX=false,
				fertigY=false,
				b=0,h=0,
				counterbreak=0,
				test="b";
		
			if(rgb!="000")
			while(!fertig){
				//test neue Breite
				if(!fertigX){
					sizeX++;
					if(sizeX>sizemaxX){
						if(b==0){
							b=sizemaxX;
							fertigX=true;
						}
						sizeX=sizemaxX;
					}
					else
					for(ty=qy;ty<qy+sizeY;ty++){
					for(tx=qx;tx<qx+sizeX;tx++){
						c=data[ty][tx];
						if(c!=rgb && b==0){
							b=sizeX-1;
							fertigX=true;
							sizeX--;
							}
						}
					}
				}
				//test neue Höhe
				if(!fertigY){
					sizeY++;
					if(sizeY>sizemaxY){
						if(h==0){
							h=sizemaxY;
							fertigY=true;
						}
						sizeY=sizemaxY;
					}
					else
					for(ty=qy;ty<qy+sizeY;ty++){
					for(tx=qx;tx<qx+sizeX;tx++){
						c=data[ty][tx];
						if(c!=rgb && h==0){
							h=sizeY-1;
							fertigY=true;
							sizeY--;
							}
						}
					}
				}
				
				
				if(b>0 && h>0)fertig=true;
				if(fertigX && fertigY)fertig=true;
			}
			if(b>1 && h>1){
				re="r";
				if(qx<10)re+="0";
				re+=qx;
				if(qy<10)re+="0";
				re+=qy;
				if(b<10)re+="0";
				re+=b;
				if(h<10)re+="0";
				re+=h;
				re+=rgb;
				
				if(b==sizemaxX && h==sizemaxY && qx==0 && qy==0)re="f"+rgb;
				
				for(ty=qy;ty<qy+h;ty++)
				for(tx=qx;tx<qx+b;tx++){
					if(data[ty][tx]==rgb)//nur relevante pixel 
						data[ty][tx]="000";
				}
				
			}
			return re;
		};
		
		for(y=0;y<data.length-1;y++)
		for(x=0;x<data[y].length-1;x++){
			rgb=data[y][x];//ausgangspixel
			if(rgb!="000"){
				//rechecke finden
				temp=checkblock(data,x,y,rgb);
				if(temp!="")re.push(temp);
				if(
					data[y  ][x+1]==rgb &&
					data[y+1][x  ]==rgb &&
					data[y+1][x+1]==rgb
					){//2x2 Block
						s="r";
						if(x<10)s+="0";
						s+=x;
						if(y<10)s+="0";
						s+=y;
						s+="0202";
						s+=rgb;
						re.push(s);
						
						//Pixel auf schwarz setzen, nicht mehr zu beachten für line/pixel
						data[y  ][x  ]="000";
						data[y  ][x+1]="000";
						data[y+1][x  ]="000";
						data[y+1][x+1]="000";
					}
			}
		}
		
		
		if(art=="v")//Zeile für Zeile
		for(y=0;y<data.length;y++){
			lastrgb="000";
			xstart=0;
			gz=0;
			for(x=0;x<data[y].length;x++){
				rgb=data[y][x];
				if(x==0) 
					lastrgb=rgb;
				else{
					if(lastrgb==rgb)
						gz++;
						else{
							if(lastrgb!="000"){
								if(gz>0){
									s="l";
									temp=xstart;if(temp<10)temp="0"+temp;
									s+=temp;
									temp=y;if(y<10)temp="0"+temp;
									s+=temp;
									temp=(xstart+gz);if(temp<10)temp="0"+temp;
									s+=temp;
									temp=y;if(y<10)temp="0"+temp;
									s+=temp;									
									s+=lastrgb;									
									re.push(s);
								}
								else{
									s="p";
									temp=xstart;if(temp<10)temp="0"+temp;
									s+=temp;
									temp=y;if(temp<10)temp="0"+temp;
									s+=temp;
									s+=lastrgb;	
									re.push(s);
								}
							
							}
							gz=0;
							xstart=x;
						}
				
				}
				lastrgb=rgb;
			}//x
			if(lastrgb!="000"){
								if(gz>0){
									s="l";
									temp=xstart;if(temp<10)temp="0"+temp;
									s+=temp;
									temp=y;if(y<10)temp="0"+temp;
									s+=temp;
									temp=(xstart+gz);if(temp<10)temp="0"+temp;
									s+=temp;
									temp=y;if(y<10)temp="0"+temp;
									s+=temp;									
									s+=lastrgb;									
									re.push(s);
								}
								else{
									s="p";
									temp=(data[y].length-1);if(temp<10)temp="0"+temp;
									s+=temp;
									temp=y;if(temp<10)temp="0"+temp;
									s+=temp;
									s+=lastrgb;	
									re.push(s);
								}
			}
		}
		
		
		if(art=="h")//Spalte für Spalte
		for(x=0;x<data[0].length;x++){
			lastrgb="000";
			ystart=0;
			gz=0;
			for(y=0;y<data.length;y++){
				rgb=data[y][x];
				if(y==0) 
					lastrgb=rgb;
				else{
					if(lastrgb==rgb)
						gz++;
						else{
							if(lastrgb!="000"){
								if(gz>0){
									s="l";
									temp=x;if(temp<10)temp="0"+temp;
									s+=temp;
									temp=ystart;if(temp<10)temp="0"+temp;
									s+=temp;
									temp=x;if(temp<10)temp="0"+temp;
									s+=temp;									
									temp=(ystart+gz);if(temp<10)temp="0"+temp;
									s+=temp;
									s+=lastrgb;									
									re.push(s);
								}
								else{
									s="p";
									temp=x;if(temp<10)temp="0"+temp;
									s+=temp;
									temp=ystart;if(temp<10)temp="0"+temp;
									s+=temp;
									s+=lastrgb;	
									re.push(s);
								}
							
							}
							gz=0;
							ystart=y;
						}
				
				}
				lastrgb=rgb;
			}//y
			if(lastrgb!="000"){
								if(gz>0){
									s="l";
									temp=x;if(temp<10)temp="0"+temp;
									s+=temp;
									temp=ystart;if(temp<10)temp="0"+temp;
									s+=temp;
									temp=x;if(temp<10)temp="0"+temp;
									s+=temp;									
									temp=(ystart+gz);if(temp<10)temp="0"+temp;
									s+=temp;
									s+=lastrgb;									
									re.push(s);
								}
								else{
									s="p";
									temp=x;if(temp<10)temp="0"+temp;
									s+=temp;
									temp=(data.length-1);if(temp<10)temp="0"+temp;
									s+=temp;
									s+=lastrgb;	
									re.push(s);
								}
			}
		}
		
		//console.log(re,art);
		
		return re;
	}	
	
	var compressFrame=function(canvas){
		var d1=compressData(readFrame(canvas),"v"),
			d2=compressData(readFrame(canvas),"h");
		if(d1.length<d2.length)
			return d1;
			else			
			return d2;
	}
	
	
	var setName=function(s){
		if(s=="")s=genName();
		s=s.split('.')[0];
		if(s.length>8)s=s.slice(0, 8);
		url=s+".ANI";
		//TODO: check ob es die schon gibt, wenn ja Abfrage "ersetzen"	
	}
	this.settheName=function(s){setName(s)}
	var genName=function(){//jjmttmmm    m mmm->hex!
		var d=new Date();
		var m=""+(d.getHours()*60+d.getMinutes()).toString(16);
		while(m.length<3)m="0"+m;
		var h=""+d.getDate();
		while(h.length<2)h="0"+h;
		var mo=""+d.getMonth().toString(16);
		var y=""+(d.getYear()-100);
		while(y.length<2)y="0"+y;
		return y+""+mo+""+h+""+m;
	}
	
	o.newAni=function(){
		var li,s;
		playpause(1);
		hatdaten=false;
		f_clearPic("#000000");
		timelineUL.innerHTML="";
		li=cE('li',timelineUL);
		createAddButt(li);
		s=prompt("Bitte geben Sie einen Namen ein (8 Zeichen).");
		setName(s);
	}
	
	o.create=function(menuestat){
		ziel.innerHTML="";
		
		var b,h,x,y,a,bb,li,ul,t;
		var z=cE('div',ziel,"Editor");
		z.basis=this;
		z.onmouseup		=function(){mouseisdown=false;};
		
		b=z.offsetWidth;
		h=z.offsetHeight-90;//90=Timeline
		if(b>h)b=h;
		b=Math.round((b*0.93)/grid.w)*grid.w;		
		//Pixelmatrix
		var gdiv=cE('div',z,"grid");
		grid.div=gdiv;
		grid.z=z;
		gdiv.style.width=b+'px';		
		gdiv.style.height=b+'px';
		bb=Math.round((z.offsetHeight-b-90)*0.5-1);
		gdiv.style.marginTop=Math.round(bb*0.5)+'px';		
		gdiv.style.marginBottom=bb+'px';		
		
		//bb=(b/grid.w);
		bb=(100/grid.w);
		for(y=0;y<grid.h;y++)
		for(x=0;x<grid.w;x++)
			{
				a=cE('a',gdiv,"pixel_"+x+"_"+y);
				a.style.width= bb+"%";
				a.style.height=bb+"%";
				a.onclick		=p_click;
				a.onmousedown	=p_down;
				a.onmouseup		=p_up;
				a.onmouseover	=p_move;
			}
			
			
		if (is_touch_device())
		{
			var ddd=cE('div',gdiv,"gridtouch");
			ddd.addEventListener("touchstart", 	atH, !1);
			ddd.addEventListener("touchmove", 	atH, !1);
			ddd.addEventListener("touchend",	atH, !1);
			ddd.addEventListener("touchcancel",	atH, !1);
		}
			
		var toolleiste=	cE('div',z,"toolleisten");
			
		//Zeitleiste darunter
		timelineDiv=cE('div',toolleiste,"timeline");
		timelineDiv.className="toolsunten";
		
		timelineUL=cE('ul',timelineDiv);
		li=cE('li',timelineUL);
		createAddButt(li);
		
		toolsDiv=cE('div',toolleiste,"werkzeuge");
		toolsDiv.className="toolsunten";
		toolsDiv.style.display="none";
		ul=cE('ul',toolsDiv);
		
				
		//Toolbuttons ...
		var bu=[{txt:tra("mol"),typ:"L"},
				{txt:tra("mou"),typ:"T"},
				{txt:tra("mob"),typ:"B"},
				{txt:tra("mor"),typ:"R"},
				{txt:tra("mturn"),typ:"turn"},
				{txt:tra("clr"),typ:"clr"},
				{txt:tra("gtest"),typ:"gtest"},
				{txt:tra("gpic"),typ:"gpic"}
				];
		
		li=cE('li',ul,"tooltext");
		li.innerHTML=tra("move");
		for(t=0;t<bu.length;t++){
			li=cE('li',ul);		
			a=cE('a',li);
			a.innerHTML=bu[t].txt;
			a.typ=bu[t].typ;
			a.href="#";
			a.onclick=clickMove;
			a.className="button";
		}
		
		for(t=0;t<menuestat.length;t++)				
				this.ShowTools(menuestat[t].typ,menuestat[t].aktiv);
				
		
				
		this.resize();
	}
	
	var atH=function(e){
		var to,p,x,y,o=this;
		to = e.changedTouches;
		p=relMouse(e,o);
		if(e.type=="touchmove" || e.type=="touchend"){
		 x=Math.round(grid.w/o.offsetWidth*p.x);
		 y=Math.round(grid.h/o.offsetHeight*p.y);
		 p=gE("pixel_"+x+"_"+y);
		 p.style.backgroundColor=aktivColor;			
		}
		e.preventDefault();
	}
	
	var clickMove=function(e){MoveGraphic(this.typ);e.preventDefault();}
	
	var MoveGraphic=function(r){
		var mz=[],x,y,p,p1,p2,o=this,gb=grid.w,gh=grid.h,s;
		switch(r){
			  case "L": 
			  case "R":
					for(y=0;y<grid.h;y++)
				   {
					if(r=="L")p=gE("pixel_"+0+"_"+y);else p=gE("pixel_"+(gb-1)+"_"+y);
					s=p.style.backgroundColor;	
					mz.push(s);
				   }
				   for(x=1;x<gb;x++)
				   for(y=0;y<gh;y++){
					if(r=="L"){
						p1=gE("pixel_"+(x-1)+"_"+y);
						p2=gE("pixel_"+x+"_"+y);}
						else{
						p1=gE("pixel_"+(gb-x)+"_"+y);
						p2=gE("pixel_"+(gb-x-1)+"_"+y);
						}					
					p1.style.backgroundColor=p2.style.backgroundColor;			
				   }				   
					for(y=0;y<gh;y++)
				   {if(r=="L")p=gE("pixel_"+(gb-1)+"_"+y);else p=gE("pixel_"+0+"_"+y);
					p.style.backgroundColor=mz[y];	
				   }		  
			  break;
			 
			  case "T": 
			  case "B": 
			  		for(x=0;x<gb;x++)
				   {if(r=="T")p=gE("pixel_"+x+"_"+0);else p=gE("pixel_"+x+"_"+(gh-1));
					s=p.style.backgroundColor;	
					mz.push(s);
				   }				   
				   for(y=1;y<gh;y++)
				   for(x=0;x<gb;x++){
					if(r=="T"){
						p1=gE("pixel_"+x+"_"+(y-1));					
						p2=gE("pixel_"+x+"_"+y);}
						else{
						p1=gE("pixel_"+x+"_"+(gh-y));
						p2=gE("pixel_"+x+"_"+(gh-y-1));
						}
					p1.style.backgroundColor=p2.style.backgroundColor;			
				   }
					for(x=0;x<gb;x++)
				   {if(r=="T")p=gE("pixel_"+x+"_"+(gh-1));else p=gE("pixel_"+x+"_"+0);
					p.style.backgroundColor=mz[x];	
				   }
			  break;
			  case "turn":			 
				   for(y=0;y<gh;y++)
				   for(x=0;x<gb;x++)
				   {p=gE("pixel_"+x+"_"+y);
					s=p.style.backgroundColor;	
					mz.push(s);
				   } 
				   for(y=0;y<gh;y++)
				   for(x=0;x<gb;x++)
				   {s=mz[x+y*gb];
					p=gE("pixel_"+(gh-1-y)+"_"+(x));
					p.style.backgroundColor=s;
				   }			  
			  break;
			  case "clr":f_clearPic("#000000");break;
			  case "gtest":sendtoArduino(compressFrame());break;
			  case "gpic":loadpic();break;
		}
	}
	
	var loadpic=function(){
		var d=new c_loadPicDialog(wos.getdivDialog(),readpic);
	}
	var readpic=function(){
		var input = document.getElementById("picfileupload"),
			imgd,img;
		
		if ( input.files.length > 0 ){
			img = new Image;
			img.src = URL.createObjectURL(input.files[0]);
			img.basis=this;
			img.onload = function() {
				var b=this.basis,
					c=document.createElement("canvas"),
					cc,bb,z,x,y,p,d,fr,fg,fb,pix;
				c.width=grid.w;
				c.height=grid.h;
				c.style.position="absolute";
				cc=c.getContext("2d");
			
				bb=this.width;
				if(bb>this.height)bb=this.height;			
				cc.drawImage(this,0,0,bb,bb, 0,0,grid.w,grid.h);
				imgd=cc.getImageData(0,0,grid.w,grid.h);
				pix=imgd.data;
				
				z=gE("infos");
				z.innerHTML="Data:"+this.width+" "+this.height+"<br>";
				z.innerHTML+=pix.length;
				
				for(y=0;y<grid.h;y++)
					for(x=0;x<grid.w;x++){
						p=gE("pixel_"+x+"_"+y);
						d=(x*4)+(y)*grid.w*4;
						fr=Math.round(16/255*pix[d+0])*16;
						fg=Math.round(16/255*pix[d+1])*16;
						fb=Math.round(16/255*pix[d+2])*16;
						
						p.style.backgroundColor="rgb("+fr+","+fg+","+fb+")";
					}
			}
		}	
		
	}
	
	var sendcounter=0;
	var senddata=[];
	var sendtoArduino=function(data){
		data.push("B");//Matrix.swapBuffer, Bildende
		sendcounter=0;
		senddata=data;
		sendNexttoArduino();
	}
	var sendNexttoArduino=function(){
		var s="",o=this,c2=0;
		
		while(s.length<200 && sendcounter<senddata.length ){
			if(c2>0)s+=",";
			s+=senddata[sendcounter];
			c2++;
			sendcounter++;
		}
		console.log(sendcounter,s);
		
		if(s.length>0){
				showSta("send "+sendcounter+"/"+senddata.length);
				wos.ladeDaten("draw.ard?draw="+s,parsesendto,o);
				}
			else{
				sendcounter=0;
				senddata=[];
				showSta("");
			}
	}
	
	var parsesendto=function(){sendNexttoArduino();}
	
	var zlplaybutt=undefined;
	var createAddButt=function(z){
		var clist,t,tr,td,a;
		t=cE('table',z);
		tr=cE('tr',t);
		td=cE('td',tr);		
		a=cE('a',td,"addFrame");
		a.onclick=b_addFrame;
		a.className="button";
		a.href="#";
		a.innerHTML=tra("zl0");
		clist=agE(timelineDiv,"canvas");
		if(clist.length>1){
			td=cE('td',tr);
			a=cE('a',td,"playpause");
			a.onclick=b_playpauseFrame;
			a.className="button";
			a.href="#";
			a.innerHTML=tra("zl3");
			zlplaybutt=a;
		}
	}
	
	var drawPtoC=function(can){
		var p,x,y,s="",cc=can.getContext("2d");
		for(y=0;y<grid.h;y++)
		for(x=0;x<grid.w;x++){
			p=gE("pixel_"+x+"_"+y);
			s=p.style.backgroundColor;
			if(s=="")s="#000000"
			cc.beginPath();
			cc.rect(x*2,y*2,2,2);
			cc.fillStyle = s;
			cc.fill();
			cc.closePath();
		}
	}
	
	var addFrame=function(){
		var li,ul,lies,cid,c,i,li2;
		playpause(1);
		ul=timelineUL;
		lies=agE(ul,"li");
		cid=lies.length;
		
		li=lies[lies.length-1];
		li.innerHTML="";
		
		c=cE('canvas',li);
		c.width=64;
		c.height=64;
		c.li=li;
		c.onclick=b_selFrame;
		
		//Grafik auf canvas malen
		drawPtoC(c);
		
		li2=cE('li',ul);
		c.liTime=li2;
		i=cE('input',li2);
		i.value=waittime;
		i.size="4";
		i.maxlength="4";
		i.onkeyup=function(){
				if(!isNaN(this.value))
					if(this.value!=""){
						waittime=this.value;
						hatdaten=true;
					}
				}
		i=cE('span',li2);
		i.innerHTML="MilliSec";
		
		i=cE('a',li2);
		i.innerHTML=tra("zl1");
		i.func="del";
		i.href="#";
		i.className="button";
		i.style.margin="0";
		i.li1=li;
		i.li2=li2;
		i.ul=ul;
		i.can=c;
		i.onclick=b_drFrame;
		
		c.drbutt=i;
		
		//AddButton
		li=cE('li',ul);
		createAddButt(li);		
		
		timelineDiv.scrollLeft=timelineDiv.offsetWidth;
		
	}
	
	var playpause=function(stoppen){
		if(window.playtimer!=undefined)clearTimeout(window.playtimer);
		if(stoppen==1)
			isAniplay=false;
			else
			{
			isAniplay=!isAniplay;		
			if(isAniplay){framecount =0;playnextFrame();}
			}
	}
	
	var playnextFrame=function(){
		var o=this,cl=agE(timelineDiv,"canvas"),mlist=agE(timelineDiv,"input"),c;
		if(window.myBasis==undefined)window.myBasis=o;		
		c=framecount;
		if(c>=cl.length)c=0;
		framecount=c;
		if(cl.length==0)return;
		if(cl.length<2)playpause(1);
		cl[framecount].onclick();
		framecount++;
		if(framecount>=cl.length)framecount=0;
		window.playtimer=window.setTimeout(function(){playnextFrame();},mlist[c].value);
	}
	
	o.setColor=function(c){
		aktivColor=c;
		if(cDIV!=undefined)cDIV.style.backgroundColor=c;
	}
	
	var b_addFrame=function(e){addFrame();hatdaten=true;e.preventDefault();}
		
	var b_playpauseFrame=function(e){
		if(isAniplay)
			this.innerHTML=tra("zl3");
			else
			this.innerHTML=tra("zl4");		
		playpause();
		e.preventDefault();
		}
		
	var b_selFrame=function(e){
		var o=this,tb=o.basis,gh=grid.h,gb=grid.w,r,g,b,pix,imgd,p,y,x,cc,d;
		if(o.className!="frameaktiv"){
			if(frameaktiv!=undefined){
						frameaktiv.drbutt.innerHTML=tra("zl1");
						frameaktiv.drbutt.func="del";
						frameaktiv.className="";
						}
			frameaktiv=o;
			cc=o.getContext("2d");
			o.className="frameaktiv";			
			imgd=cc.getImageData(0,0,gb*2,gh*2);//r,g,b,a,r,g,b,a,...
			pix=imgd.data;			
			for(y=0;y<gh;y++)
			for(x=0;x<gb;x++){
				p=gE("pixel_"+x+"_"+y);
				d=(x*4*2)+(y*2)*gb*4*2;
				p.style.backgroundColor="rgb("+pix[d+0]+","+pix[d+1]+","+pix[d+2]+")";
			}
			o.drbutt.innerHTML=tra("zl2");
			o.drbutt.func="refresh";
		}
		else
		{o.className="";
		frameaktiv=undefined;
		o.drbutt.innerHTML="del";
		o.drbutt.func="del";
		}
		if(typeof e==="object")e.preventDefault();
	}
	
	var b_drFrame=function(e){		
		var o=this;
		if(o.func=="del"){
			if(confirm(tra("dlg5"))){   
				o.ul.removeChild(o.li1);
				o.ul.removeChild(o.li2);
				if(zlplaybutt!=undefined){
					zlplaybutt.style.display=false;
					playpause(1);
					}
			}
		}
		if(o.func=="refresh")drawPtoC(o.can)
		e.preventDefault();
	}
	
	var p_click=function(e){
		this.style.backgroundColor=aktivColor;
		hatdaten=true;
		//e.preventDefault();
	};
	var p_down=function(e){mouseisdown=true;};
	var p_up=function(e){mouseisdown=false;};
	var p_move=function(e){
		if(mouseisdown){
			this.style.backgroundColor=aktivColor;
			hatdaten=true;
		}
		var s=this.id.split('_');
		showSta(s[1]+','+s[2]+' '+this.style.backgroundColor);
	};
	
	var f_clearPic=function(c){
		var x,y,p;
		for(y=0;y<grid.h;y++)
		for(x=0;x<grid.w;x++){
			p=gE("pixel_"+x+"_"+y);
			p.style.backgroundColor=c;			
		}
	}
	
	var drawPixel=function(x,y,c){
		var p=gE("pixel_"+x+"_"+y);
		if(p!=null)p.style.backgroundColor=c;
	}
	var C444toRGB=function(rgb){
		var f4=function(s){
			s=Math.round(255/15*parseInt(s,16)).toString(16);
			if(s=="0")s="00";
			return s;
			}
		return "#"+f4(rgb.slice(0,1))+""+f4(rgb.slice(1,2))+""+f4(rgb.slice(2,3));
	}
	
	o.showDatei=function(daten,url){
		var lines=daten.split("\n"), t,ta,l,be,v,c,x,y,x2,y2,xx,yy,err,ystep,o=this,steep,dx,dy;
		setName(url);
		for(t=0;t<lines.length;t++){		
			l=lines[t];
			be=l[0];		
			v=l.slice(1);		
			if(be=="f")f_clearPic(C444toRGB(v.slice(0,3)));
			if(be=="p"){//pxxyyrgb
				x=parseInt(v.slice(0,2));	
				y=parseInt(v.slice(2,4));
				c=C444toRGB(v.slice(4,7));
				drawPixel(x,y,c);
			};
			if(be=="l"){//lxxyyxxyyrgb
				x=parseInt(v.slice(0,2));	
				y=parseInt(v.slice(2,4));	
				x2=parseInt(v.slice(4,6));	
				y2=parseInt(v.slice(6,8));	
				c=C444toRGB(v.slice(8,11));
				steep=Math.abs(y2-y)>Math.abs(x2-x);
				if(steep){ta=x;x=y;y=ta;ta=x2;x2=y2;y2=ta;}
				if(x>x2){ta=x;x=x2;x2=ta;ta=y;y=y2;y2=ta;}
				dx=x2-x;
				dy=Math.abs(y2-y);				
				err=dx/2;
				ystep=-1;				
				if(y<y2)ystep=1;
				yy=y;
				for(xx=x;xx<=x2;xx++){
					if(steep)drawPixel(yy,xx,c);
						else drawPixel(xx,yy,c);
					err-=dy;
					if(err<0){yy+=ystep;err+=dx;}
				}
				
			};
			if(be=="r"){
				x=parseInt(v.slice(0,2));	
				y=parseInt(v.slice(2,4));	
				x2=parseInt(v.slice(4,6));	
				y2=parseInt(v.slice(6,8));	
				c=C444toRGB(v.slice(8,11));
				for(xx=x;xx<x+x2;xx++){
					for(yy=y;yy<y+y2;yy++)
						drawPixel(xx,yy,c);
				}
			}
			if(be=="d"){
				waittime=parseInt(v);
				addFrame();
			};			
		}
		showSta("");
	}
	
	o.ShowTools=function(t,v){
	var ti=timelineDiv.style,to=toolsDiv.style;
	if(t=="zl")if(v)ti.display="block";else ti.display="none";
	if(t=="wz")if(v)to.display="block";else to.display="none";
	this.resize();
	}
	
	o.resize=function(){
		var b,h,z=grid.z,g=grid.div,tl=gE("toolleisten");		
		if(tl!=null){
		b=z.offsetWidth;
		h=z.offsetHeight-tl.offsetHeight;
		if(b>h)b=h;
		b=Math.round((b*0.93)/grid.w)*grid.w;
		g.style.width=b+'px';
		g.style.height=b+'px';
		}
	}
	
	o.exit=function(){
		playpause(1);
		window.myBasis=undefined;
		timelineDiv.innerHTML="";		
	}
	
}

function c_colorDialog(ziel,oEditor,color){ 
	var o=this,info,cFL1,cneu,
		cstepp=16;
	var create=function(){
		var d,node,can,resth,restb,ul,li,b,rand=5,fbr;
		ziel.innerHTML="";
		ziel.style.display="block";	

		d=cE("div",ziel);
		d.className="dlg";
		fbr=ziel.offsetWidth;
		if(fbr>550){d.style.width="550px";fbr=550;}

		node=cE("h1",d);
		node.innerHTML=tra("cdlg");
		info=cE("span",node);

		resth=d.offsetHeight-node.offsetHeight+rand;

		can=cE("canvas",d,"cpicker");
		can.addEventListener('click',b_OK);
		cFL1=can;

		ul=cE("ul",d);
		b=Math.round((fbr-5)/4);

		li=cE("li",ul);li.style.width=b+"px";
		node=cE("a",li);
			node.href="#";
			node.innerHTML=tra("cdlgAbr");
			node.className="button";
			node.onclick=function(e){ziel.style.display="none";e.preventDefault();}

		li=cE("li",ul);li.style.width=b+"px";
		li.innerHTML=tra("cdlgalt");
		node=cE("div",li,"c_old");
			node.className="farbkastel";
			node.style.backgroundColor=color;

		li=cE("li",ul);li.style.width=b+"px";
		li.innerHTML=tra("cdlgneu");
		node=cE("div",li,"c_new");
			node.className="farbkastel";
			node.style.backgroundColor=color;
		cneu=node;

		li=cE("li",ul);li.style.width=b+"px";
		node=cE("a",li);
			node.href="#";
			node.className="button";
			node.innerHTML=tra("cdlgOK");
			node.onclick=function(e){
					oEditor.setColor(color);
					ziel.style.display="none";
					e.preventDefault();}
		
		resth-=(ul.offsetHeight+rand*4); 
		restb=d.offsetWidth-rand*2;	
		can.height=16*Math.round(resth/16);
		can.width=18*Math.round(restb/18);		
		drawColorPicker();
	}
	
	var b_OK=function(e){
		var cc,p,f;
		cc=cFL1.getContext("2d");
		p=relMouse(e,cFL1);
		f=cc.getImageData(p.x,p.y,1,1);	
		cneu.style.backgroundColor="rgb("+f.data[0]+","+f.data[1]+","+f.data[2]+")";
		color=cneu.style.backgroundColor;
		info.innerHTML=color;
	}
	
	var drawColorPicker=function(){
		var cc=cFL1.getContext("2d"),
			hh,ww,aa,z,f,r,g,b,b3,zs,h2;		
		//Farbe
		aa=cstepp*0.5;
		zs=18;		
		ww=Math.round(cFL1.width /zs);
		b3=zs/6;
		for(f=0;f<zs;f++){
			if(f<b3)
				r=255;
			else
			if(f>=b3*1 && f<b3*2)  
				r=255-Math.round( 255/ b3 *(f-b3)   +0.5);	
			else
			if(f>=b3*2 && f<b3*4)  
			    r=0;
			else
			if(f>=b3*4 && f<b3*5)
			    r=Math.round( 255/ b3 *(f-b3*4)   +0.5);
			else
				r=255;	
			if(f<b3)
				g=Math.round(255/b3 * f+0.5);
			else
			if(f>=b3*1 && f<b3*3) 
				g=255;
			else
			if(f>=b3*3 && f<b3*4) 
				g=255-Math.round(255/b3 * (f-b3*3)+0.5);
			else
				g=0;
				
			if(f<b3*2)	
				b=0;
			else
			if(f>=b3*2 && f<b3*3) 
				b=Math.round(255/b3 * (f-b3*2)+0.5);
			else
			if(f>=b3*3 && f<b3*5) 
				b=255;
			else
				b=255-Math.round(255/b3 * (f-b3*5)+0.5);			
			cc.save();			
			cc.fillStyle ="rgb("+r+","+g+","+b+")";//rot->gelb			
			cc.fillRect(f*ww,0, ww+5 ,cFL1.height);
			cc.restore();
		}
		
		//1/2 schwarz zu farbe zu weiß
		hh=8;
		h2=cFL1.height*0.5/hh;
		for(z=0;z<(hh-0);z++){
			cc.save();
			cc.fillStyle ="rgba(0,0,0,"+(1-1/(hh-1)*z)+")";
			cc.fillRect(0,z*h2,cFL1.width,h2);
			cc.restore();
			
			cc.save();
			cc.fillStyle ="rgba(255,255,255,"+(1/(hh-1)*z)+")";
			cc.fillRect(0,(z-1)*h2+cFL1.height*0.5,cFL1.width,h2);
			cc.restore();
		}		
		//grau
		ww=Math.round(cFL1.width /cstepp);//15
		for(f=0;f<cstepp;f++){
			r=Math.round( 255/(cstepp-1)*f);
			cc.save();
			cc.fillStyle ="rgb("+r+","+r+","+r+")";		
			cc.fillRect(f*ww,cFL1.height-h2, ww+5 ,h2);
			cc.restore();
		}		
	}	
	
	create();
}

function c_loadPicDialog(ziel,readpicfunc){
	ziel.style.display="block";
	var create=function(){
		var ifile,ul,li,node,div;
		ziel.innerHTML="";
		ziel.style.display="block";	
		div=cE("div",ziel);
		div.className="dlg";
		node=cE("h1",div);
		node.innerHTML="Datei auswählen";
		
		node=cE("p",div,"infos");
		node.innerHTML="";
		
		ifile=cE("input",div,"picfileupload");
		ifile.name="Datei";
		ifile.type="file";
		ifile.accept="image/*;capture=camera";
		ifile.size="50";
		ifile.name="picfileupload";
		ifile.className="selFile";
		node=cE("input",div,"buttsenden");
		node.type="button";
		node.value=tra("upload");
		node.onclick=function(e){
					readpicfunc();
					ziel.style.display="none";
					e.preventDefault();
					}	 
		
		
		ul=cE("ul",div);
		li=cE("li",ul);
		node=cE("a",li);
		node.href="#";
		node.innerHTML=tra("cdlgAbr");
		node.className="button";
		node.onclick=function(e){ziel.style.display="none";e.preventDefault();}
	}
	create();
}

function formatbytes(bytes){
	if (bytes < 1024){
		return (bytes) + "B";
	}
	else 
	if (bytes < (1024 * 1024)) {
		return Math.floor(bytes / 1024.0 *10)/10 + "KB";
	} 
	else 
	if (bytes < (1024 * 1024 * 1024)) {
		return Math.floor(bytes / 1024.0 / 1024.0*10)/10 + "MB";
	} 
	else 
	{
		return Math.floor(bytes / 1024.0 / 1024.0 / 1024.0*10)/10 + "GB";
	}
}

var wOS=function(zielid){
    var o=this,t,
		divDialog,cMenue,
		ladedatenURL="",
		ListModus=0, //0=nur .ani 1=alles
		Menue=[
			{txt:tra("hm0"),url:"data.json", typ:"status"},
			{txt:tra("hm1"),url:"data.json"	,typ:"dir"	},
			{txt:tra("hm2"),url:""			,typ:"editor"}		
			],
		MenueEditor=[
			{txt:tra("<<"),typ:"back"},
			{txt:tra("Ani"),typ:"datei"},
			{txt:tra("Tools"),typ:"tools"},
			{txt:"",typ:"farbe"},
			{txt:"",typ:"astatus"}
			],
		MEsub0=[
			{txt:"",typ:"name"},
			{txt:tra("em1Sm1"),typ:"neu"},
			{txt:tra("em1Sm2"),typ:"save"}
			],
		MEsub1=[
			{txt:tra("em2Sm0"),typ:"zl",aktiv:true},
			{txt:tra("em2Sm1"),typ:"wz",aktiv:false}
			],
			
		ArduinoStatus={
			"Aniaktiv":"",
			"SD":"",
			"PROGversion":"",
			"frame":""
			},
		aktiverOrdner="",
		cEditor=undefined,
		ziel=undefined
	;
	o.getdivDialog=function(){return divDialog;}

	for(t=0;t<MEsub1.length;t++){
		var v=getCo(MEsub1[t].typ);
		if(v!=null)MEsub1[t].aktiv=(v=="true");
	}	
			
	
	var ladeContent=function(url,data){
		ziel.innerHTML="laden:"+url;
		ladedatenURL=url;
		ladeDaten(url,parseContent ,data);
	}

	var ladeDaten=function(url,parsefunc,data){
		var mLo=getXREq();
		if(!mLo)
			error('XMLHttp nicht möglich.');		
			else
			{	
			mLo.basis=this;
			mLo.url=url;
			if(url.indexOf("?")==-1)url=url+"?";
			var d=new Date();
			url=url+'&ti='+d.getTime(); //chache entgegenwirken
			mLo.open("GET",url,true); 
			mLo.parsefunc=parsefunc;
			mLo.o=o;
			mLo.onreadystatechange = function(){
					if(this.readyState==4){							
					   if (this.status==200||this.status==304||this.status==0)
							{if(typeof parsefunc==="function")this.parsefunc(data);} 
							else 
							error("Fehler "+this.status);
					}
				};
			mLo.send(null);
			}
	}
	o.ladeDaten=ladeDaten;
	
	var parseContent=function(data){
		if(data.typ=="status")showStatus(JSON.parse(this.responseText));
		if(data.typ=="dir")   listDIR(JSON.parse(this.responseText));
	}
	
	var showStatus=function(stat){
	  var p,a,z=ziel;
	  z.innerHTML="";
	  ArduinoStatus=stat;	  
	  cE("p",z).innerHTML=tra("stat0")+stat.progversion;	  
	  cE("p",z).innerHTML=tra("statMac")+stat.macadresse;
	  p=cE("p",z);
	  p.innerHTML=tra("stat2")+stat.aniaktiv;
	  if(stat.aniaktiv!=""){
		  a=cE("a",p);
		  a.innerHTML=tra("stop");
		  a.href="#";
		  a.className="button aniaktiv";
		  a.addEventListener('click',function(e){
										ladeDaten("/aktion?stop=0", 
													function(d){
														ladeDaten("data.json",parseContent,{"typ":"status"});
													}  
												);
												})
		}
	  
	  cE("p",z).innerHTML=tra("stat1")+formatbytes(stat.fstotalBytes)+' '+tra("stat1used")+stat.fsused;
	  cE("p",z).innerHTML="<a href=\"setup.htm\" target=\"blank\">setup</a>";
	}	
	
	
	
	var listDIR=function(dat){
	  ziel.innerHTML="";
	  var ul=cE("ul",ziel);
	  ul.className="dateiliste";
	  var a,s,li,listeOff=[],listeDelButt=[];
	  ArduinoStatus.Aniaktiv=dat.aniaktiv;
	
console.log(dat);	
	
	  for(var t=0;t<dat.files.length;t++){
		s=dat.files[t];
		if(s.fileName==undefined)break;
		li=cE("li",ul,this);		
		a=cE("span",li,this);		
		if(s.fileSize!=undefined)a.innerHTML=s.fileSize+'byte';
		
		if(s.fileName.indexOf('.ANI')==-1){
			li.style.display="none";
			listeOff.push(li);
			}
		
		var aa=cE("a",li,this);
		aa.basis=this;
		aa.innerHTML=s.fileName.split('/').join('');
		if(s.fileName!="..")s.fileName=s.fileName;
		aa.href=s.fileName;
		aa.target="_blank";
		aa.o={typ:"dir"};
		
		aa.obj=s;
		if(s.fileName.indexOf(".")==-1 || s.fileName.indexOf("..")>-1){
			aa.href="#";
			aa.theurl="list.ard"+"?dir="+s.fileName;
			aa.onclick=function(){ 
					ladeContent(this.theurl,{typ:"datei"});		
					return false;
					}
		}
		
		if(((s.fileName.indexOf(".TXT")>-1 || s.fileName.indexOf(".ANI")>-1)||(s.fileName.indexOf(".")>0)) 
			&& s.fileName!="UP.HTM" && s.fileName.indexOf("..")==-1){
			var a=cE("a",li,this);
			a.innerHTML=tra("del");
			a.basis=this;
			a.href="#";
			a.className="button del";
			a.obj=s;
			a.onclick=deleteFile;
			a.style.display="none";
			listeDelButt.push(a);
		}
		
		if(s.fileName.indexOf(".ANI")>-1){
			if(ArduinoStatus.Aniaktiv==s.fileName){ 
				aa.className="aniaktiv";			
				a=cE("a",li,this);
				a.innerHTML=tra("stop");
				a.basis=this;
				a.href="#";	
				a.className="button";
				a.onclick=ANIplay;
				a.stat="isplaing";
				a.obj=s;
				a.filea=aa;
				aktivanibutt=a;
			}
			else{
				a=cE("a",li,this);
				a.innerHTML=tra("play");
				a.basis=this;
				a.href="#";	
				a.className="button play";
				a.onclick=ANIplay;
				a.stat="";
				a.filea=aa;
				a.obj=s;
			}
			a=cE("a",li,this);
			a.innerHTML=tra("edit");
			a.href="#";	
			a.basis=this;
			a.className="button";			
			a.onclick=editFile;//Starte Editor
			a.obj=s;
		}
	  }	
	 
	  cE("p",ziel).innerHTML=tra("stat1")+formatbytes(dat.fstotalBytes)+' '+tra("stat1used")+dat.fsused+' '+tra("frei")+': '+formatbytes(dat.fstotalBytes-dat.fsusedBytes);
	  
		  
	  var ap=cE("a",ziel,this);
	  ap.innerHTML="+";
		ap.href="#";
		ap.className="button showall";
		ap.basis=this;
		ap.listeOff=listeOff;
		ap.listeDel=listeDelButt;
		ap.isplus=true;
		ap.onclick=listDIRall;
	  
	  //uploadform post per Script
	  window.thebasis=this;
	  ul=cE("form",ziel,"upload-form");
      ul.action="/upload?rel=no";
	  ul.method="POST";
	  ul.enctype="multipart/form-data";
	  ul.ofo=ul;
	  ul.style.display="none";
	  
	  ap.formular=ul;
	  
	  var ifile=cE("input",ul,"file-upload");
	  ifile.name="Datei";
	  ifile.type="file";
	  ifile.size="50";
	  ifile.name="file-upload";
	  ifile.className="selFile";

	  a=cE("input",ul,"buttsenden");
	  a.type="submit";
	  a.value=tra("upload");

	  if(ListModus==1)ap.onclick();
	}
	
	var listDIRall=function(){
		var o=this,s="",t;
		o.isplus=!o.isplus;
		if(o.isplus)s="none";
		for(t=0;t<o.listeOff.length;t++)o.listeOff[t].style.display=s;
		for(t=0;t<o.listeDel.length;t++)o.listeDel[t].style.display=s;
		o.formular.style.display=s;
		if(o.isplus){
			o.innerHTML="+";
			ListModus=0;
			}
			else{
			o.innerHTML="-";
			ListModus=1;
			}
	}

	var parseDelFile=function(data){
		ladeDaten("data.json",parseContent,{"typ":"dir"});
	};
	
	var aktivanibutt=undefined;
	var resetPlayButt=function(){
		if(aktivanibutt!=undefined){
			aktivanibutt.innerHTML=tra("play");
			aktivanibutt.stat="";
			addClass(aktivanibutt,"play");
			subClass(aktivanibutt.filea,"aniaktiv");
		}
	}
	var ANIplay=function(e){
		if(this.stat==""){
			resetPlayButt();
			ladeDaten("/aktion?play="+this.obj.fileName);
			aktivanibutt=this;
			this.stat="p";
			this.innerHTML=tra("stop");
			subClass(this,"play");//aniaktiv
			addClass(this.filea,"aniaktiv");
		}
		else{
			resetPlayButt();
			ladeDaten("/aktion?stop=0");
		}
		e.preventDefault();
	}
	var deleteFile=function(e){
		if(confirm(tra("dlg1")))
			ladeDaten(this.obj.fileName+"?delete="+this.obj.fileName,parseDelFile);
		e.preventDefault();
	}	
	
	var editFile=function(e){
		this.obj.fileName=this.obj.fileName.split('/').join('');
		console.log(this.obj.fileName);
		showEditor(this.obj.fileName);
	}
	
	var error=function(s){ziel.innerHTML="<p class=\"error\">"+s+"</p>";}
	
	var ini=function(zid){
		var m,d,t,o=this;
	    ziel=gE(zid);
		m=gE("menue");
		m.innerHTML="";
		for(t=0;t<Menue.length;t++)Menue[t].basis=o;
		cMenue=new c_menue(m);
		showHMenue(0);
		divDialog=cE("div",agE(document,'body')[0],"dialog");
		window.addEventListener('resize',resize,false);
		window.o_wos=o;
	}
	
	var resize=function(){
		if(cEditor!=undefined)cEditor.resize();
	}
	
	var showHMenue=function(nr){var o=this;
		cMenue.create(Menue,clickmenue);
		cMenue.set(nr);		
	}
		
	var clickmenue=function(){//Hauptmenü
		console.log(this.data);
		if(this.data.url!="")
				ladeContent(this.data.url,{typ:this.data.typ});//.typ=status|dir|editor
				else
				if(this.data.typ=="editor"){showEditor("");}
		return false;
	}
	
	var clickMESub0=function(){
		var t,s;
		t=t=this.data.typ;
		switch(t){
			case "name":
				var s=prompt(tra("dlg2"),this.o.geturl().split('.')[0]);
				this.o.settheName(s);
			break;
			case "neu":
				if(this.o.hatdaten())
					{
						if(confirm(tra("dlg3")))
							this.o.newAni();
					}
					else
					this.o.newAni();
			break;
			case "save":
				this.o.saveAni();
			break;
		}
	}

	var clickMESub1=function(){
		this.data.aktiv=!this.data.aktiv;
		setCo(this.data.typ,""+this.data.aktiv);
		this.o.ShowTools(this.data.typ, this.data.aktiv);
	}

	var clickEditMenue=function(e){
		var ul,p,t,v;
		p=getPos({x:0,y:0},this);
		t=this.o.a.o.typ;
		switch(t){
			case "back":
				if(cEditor.hatdaten())
					{if(confirm(tra("dlg4"))){
						cEditor.exit();
						showHMenue(1);
						}
					}
					else{
						cEditor.exit();
						showHMenue(1);
					}
				break;
			case "farbe":
			    //Farbwahl 
				this.bm.showDDmenue([],null,0,"");
				new c_colorDialog(divDialog,this.o.Editor,this.o.Editor.getaktivColor());
				break;
			case "tools":
				//Zeitleiste, Werkzeuge				
				ul=this.bm.showDDmenue(MEsub1,clickMESub1, this.o.Editor, t);
				ul.style.marginLeft=(p.x*-1)+"px";
				break;
			case "datei":
				//name, neu, speichen
				MEsub0[0].txt=this.o.Editor.geturl();
				ul=this.bm.showDDmenue(MEsub0,clickMESub0,this.o.Editor, t);		
				ul.style.marginLeft=(p.x*-1)+"px";
				break;
		}
	}

	var showEditor=function(url){
		var cf,mp,t;
		cEditor=new c_Editor(ziel,o);

		//Menü, Hauptmenü ausblenden
		for(t=0;t<MenueEditor.length;t++){
				MenueEditor[t].Editor=cEditor;
			}
		cMenue.create(MenueEditor,clickEditMenue);
		cMenue.setCSS("submenue");
		statziel=cMenue;
		mp=cMenue.getMP("farbe");
		if(mp!=undefined){
			cf=cE("div",mp);
			cf.className="farbkastel";
			cEditor.setcDIV(cf);
		}
		cEditor.create(MEsub1);
		if(url!=""){
			showSta(tra("statload"));
			ladeDaten(url,parseDateitoEditor);
			}			
	};

	var parseDateitoEditor=function(d){
		cEditor.showDatei(this.responseText, this.url);
	}
	//------------------end Editor---------------
	
	ini(zielid);	
}

window.addEventListener('load',function(){new wOS("content");},false);