/*
	Version 15-3-2014
TODO: 
-colorpicker
-game

*/

//deutsch:
var thetext={
	stat0:"Version: ",
	stat1:"SD-Karte: ",
	stat2:"aktive Animation: ",

	hm0:"Status",
	hm1:"Dateien",
	hm2:"Editor",
	
	play:"play",
	stop:"stop",
	edit:"edit",
	del:"del",
	upload:"einlesen",
	
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
function cE(t,z){
var e=document.createElement(t);
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

function getXREq(){
	var re;
	try {// Mozilla, Opera, Safari sowie Internet Explorer (ab v7)
			re=new XMLHttpRequest();
			if(re.overrideMimeType)re.overrideMimeType('text/text');
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
		var z=this.z,o=this,ul,li,a,t;
		z.innerHTML="";
		o.m=[];
		o.ma=-1;
		ul=cE("ul",z);
		o.ul=ul;
		for(t=0;t<oList.length;t++){
			li=cE("li",ul);
			a=cE("a",li);
			a.innerHTML=oList[t].txt;
			a.onclick=o.clickMP;
			a.oc=onclick;
			a.bm=o;
			a.href="#";
			a.o=oList[t];
			oList[t].a=a;
			o.m.push(a);
		}
		o.setCSS("menue");
		o.submenue=cE("ul",z);
		o.submenue.id="DDMenue";
	}
	o.clickMP=function(e){
		var o=this;
		if(o.bm.ma!=undefined)o.bm.ma.className="";		
		o.bm.ma=o;
		o.bm.ma.className="aktiv";	
		if(o.oc)o.oc(e);
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
	o.clickDD=function(){
		this.basis.showDDmenue(0,0,0,"");
		if(this.oc)this.oc();
		return false;
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
					a.innerHTML=oList[t].txt;
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

function c_Editor(ziel,wos){
	var o=this;
	o.ziel=ziel;
	o.wos=wos;
	o.url="ani.ANI";
	o.timelineDiv;
	o.timelineUL;
	
	o.toolsDiv;
	
	o.cDIV=undefined;
	o.hatdaten=false;
	
	o.grid={w:32,h:32, div:undefined, z:undefined};
	o.aktivColor="#ffffff";
	o.mouseisdown=false;
	o.waittime=100;
	
	o.frameaktiv=undefined;
	o.isAniplay=false;
	
	o.arrTos=function(a){var s="";for(var t=0;t<a.length;t++)s+=a[t]+'\r\n';return s}
//TODO: überarbeiten, funktioniert nicht mehr so!	
	o.saveAni=function(){
		showSta(tra("statsave"));
		var da="",t,f,v,vda;
		var lies=this.timelineDiv.getElementsByTagName("canvas");
		var inpu=this.timelineDiv.getElementsByTagName("input");
		
		for(t=0;t<lies.length;t++){
			da+=o.arrTos(this.compressFrame(lies[t]));
			v=""+inpu[t].value;
			while(v.length<4)v="0"+v;
			da+="d"+v+"\r\n";//#0d cr #0a lf
		}
		da+=" \r\n";
		console.log(da);
		showSta(tra("statsave")+".");
		
		var mLo=getXREq();		
		if(!mLo)
				console.log('XMLHttp nicht möglich.');		
				else
				{
				mLo.basis=this;
				mLo.z=0;
				mLo.parseFunc=this.parseSaveAni;
				mLo.onreadystatechange=function(){
					this.z++;
					if(this.z==0)
						showSta(tra("statsave")+".*");
					if(this.z==10)	
						showSta(tra("statsave")+"*.");
					if(this.z>19)
						this.z==0;
					
					if(this.readyState==4){
					   if (this.status==200)
							this.parseFunc(this.responseText);
							else 
							console.log("Fehler "+this.status);
					}
				};
				mLo.open("POST","upload?dir=",false);
				srh(mLo,"X-Date",getDatum());//X-Date: jjjjmmtthhmmss
				srh(mLo,"Content-length",da.length);			//TODO: abgeleht!!!!
				srh(mLo,"Connection","close");					//TODO: abgeleht!!!!
				srh(mLo,"Content-Type","multipart/form-data; boundary=---------------------------6675123456789");
				srh(mLo,"Connection","keep-alive");
				srh(mLo,"Pragma","no-cache");
				srh(mLo,"Cache-Control","no-cache");
				vda="\n";
				vda+="---------------------------6675123456789\r\n";
				vda+='Content-Disposition: form-data; name="file"; filename="'+this.url+'"'+"\r\n";
				vda+="Content-Type: text/plain"+"\r\n"+"\r\n";
				vda+=da;
				vda+="---------------------------6675123456789--\r\n";
				showSta(tra("statsave")+"..");
				mLo.send(vda);
				}
	}
	o.parseSaveAni=function(rt){
		alert(tra("dok"));
		o.hatdaten=false;
		showSta("");
		console.log(rt);
	}
	
	o.get_Color444=function(r,g,b){//#rgb  0..F return String
		return r.toString(16)+''+g.toString(16)+''+b.toString(16);	
	}
		
	o.readFrame=function(canvas){//[ [s,s,s,s,...],[s,s,s,...],  ... ] of string
		var p,x,y,r,g,b,z,s,cc,imgd,gh=this.grid.h,gb=this.grid.w,d;
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
			re[y].push(this.get_Color444(r,g,b) );
			}			
		}
		return re;
	}
	
	o.compressData=function(data, art){//data=[ [s,s,s,s,...],[s,s,s,...],  ... ]
		var re=[],x,y,rgb,lastrgb,xstart,ystart,gz,s;
		re.push("f000");//clr
		
		if(art=="v")
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
		
		
		if(art=="h")
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
		return re;
	}	
	
	o.compressFrame=function(canvas){
		var f=this.readFrame(canvas),
		d1=this.compressData(f,"v"),
		d2=this.compressData(f,"h");
		if(d1.length<d2.length)
			return d1;
			else			
			return d2;
	}
	
	
	o.setName=function(s){
		if(s=="")s=this.genName();
		s=s.split('.')[0];
		if(s.length>8)s=s.slice(0, 8);
		this.url=s+".ANI";
		//TODO: check ob es die schon gibt, wenn ja Abfrage "ersetzen"	
	}
	o.genName=function(){//jjmttmmm    m mmm->hex!
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
		this.playpause(1);
		this.hatdaten=false;
		this.f_clearPic("#000000");
		this.timelineUL.innerHTML="";
		li=cE('li',this.timelineUL);
		this.createAddButt(li);
		var s=prompt("Bitte geben Sie einen Namen ein (8 Zeichen).");
		this.setName(s);
	}
	
	o.create=function(menuestat){
		this.ziel.innerHTML="";
		
		var b,h,x,y,a,bb;
		var z=cE('div',this.ziel,this);
		z.id="Editor";
		z.basis=this;
		z.onmouseup		=function(){this.basis.mouseisdown=false;};
		
		b=z.offsetWidth;
		h=z.offsetHeight-90;//90=Timeline
		if(b>h)b=h;
		b=Math.round((b*0.93)/this.grid.w)*this.grid.w;		
		//Pixelmatrix
		var gdiv=cE('div',z,this);
		this.grid.div=gdiv;
		this.grid.z=z;
		gdiv.id="grid";
		gdiv.style.width=b+'px';		
		gdiv.style.height=b+'px';
		bb=Math.round((z.offsetHeight-b-90)*0.5-1);
		gdiv.style.marginTop=Math.round(bb*0.5)+'px';		
		gdiv.style.marginBottom=bb+'px';		
		
		//bb=(b/this.grid.w);
		bb=(100/this.grid.w);
		for(y=0;y<this.grid.h;y++)
		for(x=0;x<this.grid.w;x++)
			{
				a=cE('a',gdiv);
				a.basis=this;
				a.id="pixel_"+x+"_"+y;
				a.style.width= bb+"%";
				a.style.height=bb+"%";
				a.onclick		=this.p_click;
				a.onmousedown	=this.p_down;
				a.onmouseup		=this.p_up;
				a.onmouseover	=this.p_move;
			}
			
			
		if (is_touch_device())
		{
			var ddd=cE('div',gdiv);
			ddd.id="gridtouch";
			ddd.basis=this;
			ddd.addEventListener("touchstart", 	this.atH, !1);
			ddd.addEventListener("touchmove", 	this.atH, !1);
			ddd.addEventListener("touchend",	this.atH, !1);
			ddd.addEventListener("touchcancel",	this.atH, !1);
		}
			
		var toolleiste=	cE('div',z);
		toolleiste.id="toolleisten";
			
		//Zeitleiste darunter
		this.timelineDiv=cE('div',toolleiste);
		this.timelineDiv.id="timeline";
		this.timelineDiv.className="toolsunten";
		
		this.timelineUL=cE('ul',this.timelineDiv);
		li=cE('li',this.timelineUL);
		this.createAddButt(li);
		
		this.toolsDiv=cE('div',toolleiste);
		this.toolsDiv.id="werkzeuge";
		this.toolsDiv.className="toolsunten";
		this.toolsDiv.style.display="none";
		ul=cE('ul',this.toolsDiv);
		
				
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
		
		li=cE('li',ul);
		li.id="tooltext";
		li.innerHTML=tra("move");
		for(t=0;t<bu.length;t++){
			li=cE('li',ul);		
			a=cE('a',li);
			a.innerHTML=bu[t].txt;
			a.typ=bu[t].typ;
			a.basis=this;
			a.href="#";
			a.onclick=this.clickMove;
			a.className="button";
		}
		
		for(t=0;t<menuestat.length;t++)				
				this.ShowTools(menuestat[t].typ,menuestat[t].aktiv);
				
		
				
		this.resize();
	}
	
	o.atH=function(e){
		var to,p,x,y,o=this;
		to = e.changedTouches;
		p=relMouse(e,o);
		if(e.type=="touchmove" || e.type=="touchend"){
		 x=Math.round(o.basis.grid.w/o.offsetWidth*p.x);
		 y=Math.round(o.basis.grid.h/o.offsetHeight*p.y);
		 p=gE("pixel_"+x+"_"+y);
		 p.style.backgroundColor=o.basis.aktivColor;			
		}
		e.preventDefault();
	}
	
	o.clickMove=function(){this.basis.MoveGraphic(this.typ)}
	
	o.MoveGraphic=function(r){
		var mz=[],x,y,p,p1,p2,o=this,gb=o.grid.w,gh=o.grid.h;
		switch(r){
			  case "L": 
			  case "R":
					for(y=0;y<o.grid.h;y++)
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
			  case "clr":o.f_clearPic("#000000");break;
			  case "gtest":o.sendtoArduino(o.compressFrame());break;
			  case "gpic":o.loadpic();break;
		}
	}
	
	o.loadpic=function(){
		var d=new c_loadPicDialog(this.wos.divDialog,this);
		d.show();
		return false;
	}
	o.readpic=function(dlg){
		var input = document.getElementById("picfileupload");
		if ( input.files.length > 0 ){
			var img = new Image;
			img.src = URL.createObjectURL(input.files[0]);
			img.basis=this;
			img.onload = function() {
				var b=this.basis;
				var c=document.createElement("canvas");
				c.width=b.grid.w;
				c.height=b.grid.h;
				c.style.position="absolute";
				var cc=c.getContext("2d");
			
				var bb=this.width;
				if(bb>this.height)bb=this.height;			
				cc.drawImage(this,0,0,bb,bb, 0,0,b.grid.w,b.grid.h);
				imgd=cc.getImageData(0,0,b.grid.w,b.grid.h);
				pix=imgd.data;
				
				var z=gE("infos");
				z.innerHTML="Data:"+this.width+" "+this.height+"<br>";
				z.innerHTML+=pix.length;
				
				for(y=0;y<b.grid.h;y++)
					for(x=0;x<b.grid.w;x++){
						p=gE("pixel_"+x+"_"+y);
						d=(x*4)+(y)*b.grid.w*4;
						fr=Math.round(16/255*pix[d+0])*16;
						fg=Math.round(16/255*pix[d+1])*16;
						fb=Math.round(16/255*pix[d+2])*16;
						
						p.style.backgroundColor="rgb("+fr+","+fg+","+fb+")";
					}
			}
		}	
		
	}
	
	o.sendcounter=0;
	o.senddata=[];
	o.sendtoArduino=function(data){
		data.push("B");//Matrix.swapBuffer
		this.sendcounter=-1;
		this.senddata=data;
		this.sendNexttoArduino();
	}
	o.sendNexttoArduino=function(){
		//TODO: mehrere Befehle zusammenfassen, sonst zu langsam...
		//evt. als temp-file?
		
		var o=this;
		o.sendcounter++;
		var s=o.senddata[o.sendcounter];
		if(o.sendcounter==1)console.log(o.senddata);
		if(o.sendcounter<o.senddata.length){
				showSta("send "+o.sendcounter+"/"+o.senddata.length)
				o.wos.ladeDaten("draw.ard?draw="+s,o.parsesendto,o);
				}
			else{
				o.sendcounter=0;
				o.senddata=[];
				showSta("");
			}
	}
	
	o.parsesendto=function(){this.o.sendNexttoArduino();}
	
	o.zlplaybutt=undefined;
	o.createAddButt=function(z){
		var o=this,clist;
		t=cE('table',z);
		tr=cE('tr',t);
		td=cE('td',tr);		
		a=cE('a',td);
		a.basis=o;
		a.onclick=o.b_addFrame;
		a.className="button";
		a.id="addFrame";
		a.basis=o;
		a.href="#";
		a.innerHTML=tra("zl0");
		clist=agE(o.timelineDiv,"canvas");
		if(clist.length>1){
			td=cE('td',tr);
			a=cE('a',td);
			o.zlplaybutt=a;
			a.basis=o;
			a.onclick=o.b_playpauseFrame;
			a.className="button";
			a.id="playpause";
			a.basis=o;
			a.href="#";
			a.innerHTML=tra("zl3");
		}
	}
	
	o.drawPtoC=function(can){
		var p,x,y,s="",cc=can.getContext("2d");
		for(y=0;y<this.grid.h;y++)
		for(x=0;x<this.grid.w;x++){
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
	
	o.addFrame=function(){
		var o=this,li,ul,lies,cid,c,i;
		o.playpause(1);
		ul=o.timelineUL;
		lies=agE(ul,"li");
		cid=lies.length;
		
		li=lies[lies.length-1];
		li.innerHTML="";
		
		c=cE('canvas',li);
		c.width=64;
		c.height=64;
		c.basis=o;
		c.li=li;
		c.onclick=o.b_selFrame;
		
		//Grafik auf canvas malen
		o.drawPtoC(c);
		
		li2=cE('li',ul);
		c.liTime=li2;
		i=cE('input',li2);
		i.value=o.waittime;
		i.size="4";
		i.maxlength="4";
		i.basis=o;
	    i.onkeyup=function(){
				if(!isNaN(this.value))
					if(this.value!="")this.basis.waittime=this.value;
				}
		i=cE('span',li2);
		i.innerHTML="MilliSec";
		
		i=cE('a',li2);
		i.innerHTML=tra("zl1");
		i.func="del";
		i.href="#";
		i.basis=o;
		i.className="button";
		i.style.margin="0";
		i.li1=li;
		i.li2=li2;
		i.ul=ul;
		i.can=c;
		i.onclick=o.b_drFrame;
		
		c.drbutt=i;
		
		//AddButton
		li=cE('li',ul);
		o.createAddButt(li);		
		
		o.timelineDiv.scrollLeft=o.timelineDiv.offsetWidth;
		o.hatdaten=true;
	}
	
	o.playpause=function(stoppen){
		if(window.playtimer!=undefined)clearTimeout(window.playtimer);
		if(stoppen==1)
			this.isAniplay=false;
			else
			{
			this.isAniplay=!this.isAniplay;		
			if(this.isAniplay){this.framecount =0;this.playnextFrame();}
			}
	}
	
	o.framecount=0;
	
	o.playnextFrameW=function(){window.myBasis.playnextFrame();}
	
	o.playnextFrame=function(){
		var o=this,cl=agE(o.timelineDiv,"canvas"),mlist=agE(o.timelineDiv,"input"),c;
		if(window.myBasis==undefined)window.myBasis=o;		
		c=o.framecount;
		if(c>=cl.length)c=0;
		o.framecount=c;
		if(cl.length==0)return;
		if(cl.length<2)o.playpause(1);
		cl[o.framecount].onclick();
		o.framecount++;
		if(o.framecount>=cl.length)o.framecount=0;
		window.playtimer=window.setTimeout(o.playnextFrameW,mlist[c].value);
	}
	
	o.setColor=function(c){
		this.aktivColor=c;
		if(this.cDIV!=undefined)this.cDIV.style.backgroundColor=c;
	}
	
	o.b_addFrame=function(){this.basis.addFrame();return false;}
		
	o.b_playpauseFrame=function(){
		if(this.basis.isAniplay)
			this.innerHTML=tra("zl3");
			else
			this.innerHTML=tra("zl4");		
		this.basis.playpause();
		return false;
		}
		
	o.b_selFrame=function(){
		var o=this,tb=o.basis,gh=tb.grid.h,gb=tb.grid.w,r,g,b,pix,imgd,p,y,x,cc,d;
		if(o.className!="frameaktiv"){
			if(tb.frameaktiv!=undefined){
						tb.frameaktiv.drbutt.innerHTML=tra("zl1");
						tb.frameaktiv.drbutt.func="del";
						tb.frameaktiv.className="";
						}
			tb.frameaktiv=o;
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
		tb.frameaktiv=undefined;
		o.drbutt.innerHTML="del";
		o.drbutt.func="del";
		}
	}
	
	o.b_drFrame=function(){		
		var o=this;
		if(o.func=="del"){
			if(confirm(tra("dlg5"))){   
				o.ul.removeChild(o.li1);
				o.ul.removeChild(o.li2);
				if(o.basis.zlplaybutt!=undefined){
					o.basis.zlplaybutt.style.display=false;
					o.basis.playpause(1);
					}
			}
		}
		if(o.func=="refresh")o.basis.drawPtoC(o.can)
		return false;
	}
	
	o.p_click=function(){
		this.style.backgroundColor=this.basis.aktivColor;
		this.basis.hatdaten=true;
	};
	o.p_down=function(){this.basis.mouseisdown=true;};
	o.p_up=function(){this.basis.mouseisdown=false;};
	o.p_move=function(){
		if(this.basis.mouseisdown){
			this.style.backgroundColor=this.basis.aktivColor;
			this.basis.hatdaten=true;
		}
	};
	
	o.f_clearPic=function(c){
		for(y=0;y<this.grid.h;y++)
		for(x=0;x<this.grid.w;x++){
			p=gE("pixel_"+x+"_"+y);
			p.style.backgroundColor=c;			
		}
	}
	
	o.drawPixel=function(x,y,c){
		p=gE("pixel_"+x+"_"+y);
		if(p!=null)p.style.backgroundColor=c;
	}
	o.f4=function(s){
		s=Math.round(255/15*parseInt(s,16)).toString(16);
		if(s=="0")s="00";
		return s;
		}
	o.C444toRGB=function(rgb){
		return "#"+o.f4(rgb.slice(0,1))+""+o.f4(rgb.slice(1,2))+""+o.f4(rgb.slice(2,3));
	}
	
	o.showDatei=function(daten,url){
		var lines=daten.split("\n"), t,ta,l,be,v,c,x,y,x2,y2,xx,yy,err,ystep,o=this;
		o.setName(url);
		for(t=0;t<lines.length;t++){		
			l=lines[t];
			be=l[0];		
			v=l.slice(1);laaaaast=t+' '+v+' '+be;			
			if(be=="f")o.f_clearPic(o.C444toRGB(v.slice(0,3)));
			if(be=="p"){//pxxyyrgb
				x=parseInt(v.slice(0,2));	
				y=parseInt(v.slice(2,4));
				c=o.C444toRGB(v.slice(4,7));
				o.drawPixel(x,y,c);
			};
			if(be=="l"){//lxxyyxxyyrgb
				x=parseInt(v.slice(0,2));	
				y=parseInt(v.slice(2,4));	
				x2=parseInt(v.slice(4,6));	
				y2=parseInt(v.slice(6,8));	
				c=o.C444toRGB(v.slice(8,11));
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
					if(steep)o.drawPixel(yy,xx,c);
						else o.drawPixel(xx,yy,c);
					err-=dy;
					if(err<0){yy+=ystep;err+=dx;}
				}
				
			};
			if(be=="d"){
				o.waittime=parseInt(v);
				o.addFrame();
			};			
		}
		showSta("");
	}
	
	o.ShowTools=function(t,v){
	var ti=this.timelineDiv.style,to=this.toolsDiv.style;
	if(t=="zl")if(v)ti.display="block";else ti.display="none";
	if(t=="wz")if(v)to.display="block";else to.display="none";
	this.resize();
	}
	
	o.resize=function(){
		var b,h,z=this.grid.z,g=this.grid.div,tl=gE("toolleisten");		
		if(tl!=null){
		b=z.offsetWidth;
		h=z.offsetHeight-tl.offsetHeight;
		if(b>h)b=h;
		b=Math.round((b*0.93)/this.grid.w)*this.grid.w;
		g.style.width=b+'px';
		g.style.height=b+'px';
		}
	}
	
	o.exit=function(){
		this.playpause(1);
		window.myBasis=undefined;
		this.timelineDiv.innerHTML="";		
	}
	
}

function c_colorDialog(ziel,obj,color){ 
	var o=this;
	o.ziel=ziel;
	o.obj=obj;
	o.info;
	
	o.rgb=color;
	o.cstepp=16;
	o.cFL1;
	o.cneu;
	o.show=function(){
		var o=this,d,e,can,YY,resth,restb,ul,li,b,rand=5;
		o.ziel.innerHTML="";
		o.ziel.style.display="block";	

		d=cE("div",o.ziel);
		d.className="dlg";
		fbr=o.ziel.offsetWidth;
		if(fbr>550){d.style.width="550px";fbr=550;}

		e=cE("h1",d);
		e.innerHTML=tra("cdlg");
		o.info=cE("span",e);

		YY=e.offsetHeight+rand;
		resth=d.offsetHeight-YY;

		can=cE("canvas",d);
		can.id="cpicker";
		can.onclick=o.b_OK;
		can.basis=o;
		o.cFL1=can;

		ul=cE("ul",d);
		b=Math.round((fbr-5)/4);

		li=cE("li",ul);li.style.width=b+"px";
			e=cE("a",li);
			e.href="#";
			e.innerHTML=tra("cdlgAbr");
			e.className="button";
			e.dlg=o.ziel;
			e.onclick=function(){this.dlg.style.display="none";return false}

		li=cE("li",ul);li.style.width=b+"px";
		li.innerHTML=tra("cdlgalt");
			e=cE("div",li);
			e.id="c_old";
			e.className="farbkastel";
			e.style.backgroundColor=o.rgb;

		li=cE("li",ul);li.style.width=b+"px";
		li.innerHTML=tra("cdlgneu");
			e=cE("div",li);
			e.id="c_new";
			e.className="farbkastel";
			e.style.backgroundColor=o.rgb;
		o.cneu=e;

		li=cE("li",ul);li.style.width=b+"px";
			e=cE("a",li);
			e.href="#";
			e.className="button";
			e.innerHTML=tra("cdlgOK");
			e.basis=o;
			e.dlg=o.ziel;
			e.onclick=function(){
					this.basis.obj.setColor(this.basis.rgb);
					this.dlg.style.display="none";
					return false}
		
		resth-=(ul.offsetHeight+rand*4); 
		restb=d.offsetWidth-rand*2;	
		e=Math.round(resth/16);
		can.height=16*e;
		e=Math.round(restb/18);
		can.width=18*e;		
		o.drawColorPicker();
	}
	
	o.b_OK=function(e){
		var cc,p,f,b;
		b=this.basis;
		cc=b.cFL1.getContext("2d");
		p=relMouse(e,b.cFL1);
		f=cc.getImageData(p.x,p.y,1,1);	
		this.basis.cneu.style.backgroundColor="rgb("+f.data[0]+","+f.data[1]+","+f.data[2]+")";
		this.basis.rgb=this.basis.cneu.style.backgroundColor;
		this.basis.info.innerHTML=this.basis.rgb;
	}
	
	o.drawColorPicker=function(){
		var cc=this.cFL1.getContext("2d");
		var hh,ww,aa,z,f,r,g,b,b3;		
		//Farbe
		aa=this.cstepp*0.5;
		zs=18;		
		ww=Math.round(this.cFL1.width /zs);
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
			cc.fillRect(f*ww,0, ww+5 ,this.cFL1.height);
			cc.restore();
		}
		
		//1/2 schwarz zu farbe zu weiß
		hh=8;
		h2=this.cFL1.height*0.5/hh;
		for(z=0;z<(hh-0);z++){
			cc.save();
			cc.fillStyle ="rgba(0,0,0,"+(1-1/(hh-1)*z)+")";
			cc.fillRect(0,z*h2,this.cFL1.width,h2);
			cc.restore();
			
			cc.save();
			cc.fillStyle ="rgba(255,255,255,"+(1/(hh-1)*z)+")";
			cc.fillRect(0,(z-1)*h2+this.cFL1.height*0.5,this.cFL1.width,h2);
			cc.restore();
		}		
		//grau
		zs=this.cstepp;
		ww=Math.round(this.cFL1.width /zs);//15
		for(f=0;f<zs;f++){
			r=Math.round( 255/(zs-1)*f);
			cc.save();
			cc.fillStyle ="rgb("+r+","+r+","+r+")";		
			cc.fillRect(f*ww,this.cFL1.height-h2, ww+5 ,h2);
			cc.restore();
		}		
	}	
	
	o.show();
}

function c_loadPicDialog(ziel,obj){
	var o=this;
	o.ziel=ziel;
	o.obj=obj;
	ziel.style.display="block";
	o.show=function(){
		var o=this,d,e,f;
		o.ziel.innerHTML="";
		o.ziel.style.display="block";	
		d=cE("div",o.ziel);
		d.className="dlg";
		e=cE("h1",d);
		e.innerHTML="Datei auswählen";
		
		f=cE("p",d);
		f.id="infos";
		f.innerHTML="";
		
		var ifile=cE("input",d);
		  ifile.name="Datei";
		  ifile.type="file";
		  ifile.accept="image/*;capture=camera";
		  ifile.size="50";
		  ifile.name="picfileupload";
		  ifile.id="picfileupload";
		  ifile.className="selFile";
		a=cE("input",d);
		a.type="button";
		a.id="buttsenden"
		a.value=tra("upload");
		a.basis=this;
		a.onclick=function(){
					this.basis.obj.readpic(this.basis);
					this.basis.ziel.style.display="none";
					}	 
		
		
		ul=cE("ul",d);
		
		li=cE("li",ul);//li.style.width=b+"px";
			e=cE("a",li);
			e.href="#";
			e.innerHTML=tra("cdlgAbr");
			e.className="button";
			e.dlg=o.ziel;
			e.onclick=function(){this.dlg.style.display="none";return false}
/*
		li=cE("li",ul);//li.style.width=b+"px";
			e=cE("a",li);
			e.href="#";
			e.className="button";
			e.innerHTML=tra("cdlgOK");
			e.basis=o;
			e.dlg=o.ziel;
			e.onclick=function(){
					this.basis.f_lp();//TODO
					this.dlg.style.display="none";
					return false}
*/		
		
	}
}

function wOS(zielid){
    var o=this;
	o.ziel=undefined;
	o.lastMenueAaktiv=undefined;
	o.divDialog;
	o.cMenue;
	o.cDialog;
	o.Menue=[
		{txt:tra("hm0"),url:"status.ard",typ:"status"},
		{txt:tra("hm1"),url:"list.ard"	,typ:"dir"	},
		{txt:tra("hm2"),url:""			,typ:"editor"}		
		];

	o.ladedatenURL="";
	o.ListModus=0; //0=nur .ani 1=alles

	o.ArduinoStatus={
		 "Aniaktiv":"",
		 "SD":"",
		 "PROGversion":"",
		 "frame":""
	};
	o.aktiverOrdner="";
	o.editFile="";

	o.ladeContent=function(url,o){
		this.ziel.innerHTML="laden:"+url;
		this.ladedatenURL=url;
		this.ladeDaten(url,this.parse,o);
	}

	o.postDaten=function(){
		var mLo=getXREq();
		if(!mLo)
			this.error('XMLHttp nicht möglich.');		
			else
			{
			gE('buttsenden').style.display="none";				
			var e=cE("span",gE('upload-form'),this);
			e.className="isupload";
			e.innerHTML=tra("uploding");
			e=gE('file-upload');
			e.style.display="none";
			file = e.files[0];
			var data = new FormData();//oFormular
			data.append('file', file);
			mLo.basis=this;
			mLo.onreadystatechange=function(){
				if(this.readyState==4){
				   if (this.status==200)
						this.basis.listDIR(JSON.parse(this.responseText));
						else 
						this.basis.error("Fehler "+this.status);
				}
			};
			mLo.open("POST","upload.htm?dir="+this.aktiverOrdner,false);
			srh(mLo,"X-Date",getDatum());//X-Date: jjjjmmtthhmmss
			srh(mLo,"Content-length",file.size);
			srh(mLo,"Connection","close");
			mLo.send(data);
			}
		return false;
	}

	o.ladeDaten=function(url,parsefunc,o){
		var mLo=getXREq();
		if(!mLo)
			this.error('XMLHttp nicht möglich.');		
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
							{if(typeof parsefunc==="function")this.parsefunc();} 
							else 
							this.basis.error("Fehler "+this.status);
					}
				};
			mLo.send(null);
			}
	}
	
	o.parse=function(){
	if(this.o.o.typ=="status")this.basis.showStatus(JSON.parse(this.responseText));
	if(this.o.o.typ=="dir")  this.basis.listDIR(JSON.parse(this.responseText));
	}
	
	o.showStatus=function(stat){
	  var z=this.ziel;
	  z.innerHTML="";
	  this.ArduinoStatus=stat;	  
	  cE("p",z,this).innerHTML=tra("stat0")+stat.PROGversion;	  
	  cE("p",z,this).innerHTML=tra("stat1")+stat.SD;
	  cE("p",z,this).innerHTML=tra("stat2")+stat.Aniaktiv;
	  this.aktiveAnimationDatei=stat.Aniaktiv;
	}	
	
	o.listsort=function(a,b){//Odner immer oben
		if(a.n ==undefined || b.n==undefined)return 0;		
		if (a.n.indexOf('.')==-1)return -1;
		else if (b.n.indexOf('.')==-1)return 1;else return 0;
	}
	
	o.listDIR=function(dat){
	  var ziel=this.ziel;
	  ziel.innerHTML="";
	  var ul=cE("ul",ziel,this);
	  ul.className="dateiliste";
	  var a,s,li,ordner=dat.Ordner,listeOff=[],listeDelButt=[];
	  this.ArduinoStatus.Aniaktiv=dat.Aniaktiv;
	  if(dat.Ordner!=undefined)this.aktiverOrdner=dat.Ordner;//
	  if(ordner!="")ordner+="/";
	  dat.List.sort(this.listsort);

	console.log(ordner,dat);			
	  for(var t=0;t<dat.List.length;t++){
		s=dat.List[t];				//  {"d":"2014-01-30 13:59:11","n":"INDEX.HTM","s":12345} d+s optional (kein d+s wenn Ordner oder backlink)
		if(s.n==undefined)break;
		li=cE("li",ul,this);		
		a=cE("span",li,this);
		if(s.d!=undefined)a.innerHTML=s.d;
		
		if(s.s!=undefined)a.innerHTML=a.innerHTML+' '+s.s+'byte';
		
		if(s.n.indexOf('.ANI')==-1){
			li.style.display="none";
			listeOff.push(li);
			}
	//console.log(s.n,ordner,dat);			
		
		var aa=cE("a",li,this);
		aa.basis=this;
		aa.innerHTML=s.n;
		if(s.n!="..")s.n=ordner+s.n;
		aa.href=s.n;
		aa.target="_blank";
		aa.o={typ:"dir"};
		
		aa.obj=s;
		if(s.n.indexOf(".")==-1 || s.n.indexOf("..")>-1){
			aa.href="#";
			aa.theurl="list.ard"+"?dir="+s.n;
			aa.onclick=function(){ 
					this.basis.ladeContent(this.theurl,aa);		
					return false;
					}
		}
		
		if(((s.n.indexOf(".TXT")>-1 || s.n.indexOf(".ANI")>-1)||(s.n.indexOf(".")>0)) 
			&& s.n!="UP.HTM" && s.n.indexOf("..")==-1){
			var a=cE("a",li,this);
			a.innerHTML=tra("del");
			a.basis=this;
			a.href="#";
			a.className="button del";
			a.obj=s;
			a.onclick=this.deleteFile;
			a.style.display="none";
			listeDelButt.push(a);
		}
		
		if(s.n.indexOf(".ANI")>-1){
			if(this.ArduinoStatus.Aniaktiv==s.n){ 
				aa.className="aniaktiv";			
				a=cE("a",li,this);
				a.innerHTML=tra("stop");
				a.basis=this;
				a.href="#";	
				a.className="button";
				a.onclick=this.ANIstop;
				a.obj=s;
			}
			else{
				a=cE("a",li,this);
				a.innerHTML=tra("play");
				a.basis=this;
				a.href="#";	
				a.className="button play";
				a.onclick=this.ANIplay;
				a.obj=s;
			}
			a=cE("a",li,this);
			a.innerHTML=tra("edit");
			a.href="#";	
			a.basis=this;
			a.className="button";			
			a.onclick=this.editFile;//Starte Editor
			a.obj=s;
		}
	  }	
		  
	  ap=cE("a",ziel,this);
	  ap.innerHTML="+";
		ap.href="#";
		ap.className="button showall";
		ap.basis=this;
		ap.listeOff=listeOff;
		ap.listeDel=listeDelButt;
		ap.isplus=true;
		ap.onclick=this.listDIRall;
	  
	  //uploadform post per Script
	  window.thebasis=this;
	  ul=cE("form",ziel,this);
      ul.action="upload.htm";
	  ul.method="POST";
	  ul.enctype="multipart/form-data";
	  ul.id="upload-form";
	  ul.ofo=ul;
	  ul.style.display="none";
	  
	  ap.formular=ul;
	  
	  var ifile=cE("input",ul);
	  ifile.name="Datei";
	  ifile.type="file";
	  ifile.size="50";
	  ifile.name="file-upload";
	  ifile.id="file-upload";
	  ifile.className="selFile";

	  a=cE("input",ul);
	  a.type="button";
	  a.id="buttsenden"
	  a.value=tra("upload");
	  a.basis=this;
	  a.onclick=function(){this.basis.postDaten();}	 

	  if(this.ListModus==1)ap.onclick();
	}
	
	o.listDIRall=function(){
		var o=this,s="",t;
		o.isplus=!o.isplus;
		if(o.isplus)s="none";
		for(t=0;t<o.listeOff.length;t++)o.listeOff[t].style.display=s;
		for(t=0;t<o.listeDel.length;t++)o.listeDel[t].style.display=s;
		o.formular.style.display=s;
		if(o.isplus){
			o.innerHTML="+";
			o.basis.ListModus=0;
			}
			else{
			o.innerHTML="-";
			o.basis.ListModus=1;
			}
	}

	var parsePS=function(data){
		console.log(data);
		//this.basis.parsePlaydat
		//this.basis.parsePlaydat
		//this.basis.parsePlaydat
	};
	
	o.ANIstop=function(e){
		this.basis.ladeDaten("/aktion?stop="+this.obj.n,parsePS,this);//aktion?
		e.preventDefault();
	}	
	o.ANIplay=function(e){
		this.basis.ladeDaten("/aktion?play="+this.obj.n,parsePS,this);//aktion?
		e.preventDefault();
	}
	o.deleteFile=function(e){
		if(confirm(tra("dlg1")))
			this.basis.ladeDaten(this.obj.n+"?delete="+this.obj.n,parsePS,this);
		e.preventDefault();
	}	
	
	o.parsePlaydat=function(){
		this.basis.listDIR(JSON.parse(this.responseText));
	}
	
	o.editFile=function(){
		console.log(this.obj.n);
		this.basis.showEditor(this.obj.n);
	}
	
	o.error=function(s){this.ziel.innerHTML="<p class=\"error\">"+s+"</p>";}
	
	o.ini=function(zielid){
		var m,d,t,o=this;
	    o.ziel=gE(zielid);
		m=gE("menue");
		m.innerHTML="";
		for(t=0;t<o.Menue.length;t++)o.Menue[t].basis=o;
		o.cMenue=new c_menue(m);
		o.showHMenue(0);
		m=agE(document,'body')[0];
		o.divDialog=cE("div",m);
		o.divDialog.id="dialog";
		window.addEventListener('resize',o.resize,false);
		window.o_wos=o;
	}
	
	o.resize=function(){
		if(window.o_wos.cEditor!=undefined)window.o_wos.cEditor.resize();
	}
	
	o.showHMenue=function(nr){var o=this;
		o.cMenue.create(o.Menue,o.clickmenue);
		o.cMenue.set(nr);		
	}
		
	o.clickmenue=function(){//Hauptmenü
		var o=this;
		if(o.o.url!="")
				o.o.basis.ladeContent(o.o.url,o);
				else
				 if(o.o.typ=="editor"){o.o.basis.showEditor("");}
		return false;
	}
	o.cEditor=undefined;
	o.MenueEditor=[
		{txt:tra("<<"),typ:"back"},
		{txt:tra("Ani"),typ:"datei"},
		{txt:tra("Tools"),typ:"tools"},
		{txt:"",typ:"farbe"},
		{txt:"",typ:"astatus"}
		];
	o.MEsub0=[
		{txt:"",typ:"name"},
		{txt:tra("em1Sm1"),typ:"neu"},
		{txt:tra("em1Sm2"),typ:"save"}
		];
	o.MEsub1=[
		{txt:tra("em2Sm0"),typ:"zl",aktiv:true},
		{txt:tra("em2Sm1"),typ:"wz",aktiv:false}
		];
	for(t=0;t<o.MEsub1.length;t++){
		var v=getCo(o.MEsub1[t].typ);
		if(v!=null)o.MEsub1[t].aktiv=(v=="true");
		}
	
	o.clickMESub0=function(){
		var t,s;
		t=t=this.data.typ;
		switch(t){
			case "name":
				var s=prompt(tra("dlg2"),this.o.url.split('.')[0]);
				this.o.setName(s);
			break;
			case "neu":
				if(this.o.hatdaten)
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

	o.clickMESub1=function(){
		this.data.aktiv=!this.data.aktiv;
		setCo(this.data.typ,""+this.data.aktiv);
		this.o.ShowTools(this.data.typ, this.data.aktiv);
	}

	o.clickEditMenue=function(e){
		var ul,p,t,v;
		p=getPos({x:0,y:0},this);
		t=this.o.a.o.typ;
		switch(t){
			case "back":
				if(this.o.basis.cEditor.hatdaten)
					{if(confirm(tra("dlg4"))){
						this.o.basis.cEditor.exit();
						this.o.basis.showHMenue(1);
						}
					}
					else{
						this.o.basis.cEditor.exit();
						this.o.basis.showHMenue(1);
					}
				break;
			case "farbe":
			    //Dialog Farbwahl 
				this.bm.showDDmenue(0,0,0,"");
				var d=new c_colorDialog(this.o.basis.divDialog,this.o.Editor,this.o.Editor.aktivColor);
				break;
			case "tools":
				//Zeitleiste, Werkzeuge				
				ul=this.bm.showDDmenue(this.o.basis.MEsub1,this.o.basis.clickMESub1, this.o.Editor, t);
				ul.style.marginLeft=(p.x*-1)+"px";
				break;
			case "datei":
				//Speichern, laden, neu
				this.o.basis.MEsub0[0].txt=this.o.Editor.url;
				ul=this.bm.showDDmenue(this.o.basis.MEsub0,this.o.basis.clickMESub0,this.o.Editor, t);		
				ul.style.marginLeft=(p.x*-1)+"px";
				break;
		}
	}

	o.showEditor=function(url){
		var o=this,cf,mp,t,m;
		o.cEditor=new c_Editor(o.ziel,o);

		//Menü, Hauptmenü ausblenden
		for(t=0;t<o.MenueEditor.length;t++)	
			{m=o.MenueEditor[t];
			m.basis=o;
			m.Editor=o.cEditor;
			}
		o.cMenue.create(o.MenueEditor,o.clickEditMenue);
		o.cMenue.setCSS("submenue");
		statziel=o.cMenue;
		mp=o.cMenue.getMP("farbe");
		if(mp!=undefined){
			cf=cE("div",mp);
			cf.className="farbkastel";
			o.cEditor.cDIV=cf;
		}
		o.cEditor.create(o.MEsub1);
		if(url!=""){
			showSta(tra("statload"));
			o.ladeDaten(url,o.parseDateitoEditor,o);
			}			
	};

	o.parseDateitoEditor=function(){console.log("geladen",this);
		this.basis.cEditor.showDatei(this.responseText, this.url);
	}
	//------------------end Editor---------------
	
	o.ini(zielid);	
}

window.addEventListener('load',function(){new wOS("content");},false);