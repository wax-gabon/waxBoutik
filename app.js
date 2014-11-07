//_________________________________________________________________ HTTP
var express = require('express');
var app = express();
var server = require('http').Server(app);
var exec = require('child_process').exec;
var busboy = require('connect-busboy');
var nodemailer = require('nodemailer');
var connect = require('connect');
var lwip = require('lwip');

var sys = require('sys');
var fs = require('fs');

//exec("mongod");

app.get('/', function (req, res){
	res.sendFile(__dirname + '/HTML/index.html');
});
app.get('/admin', function (req, res){
	res.sendFile(__dirname + '/HTML/admin.html');
});
app.get('/app.js', function (req, res){
	res.send(404, 'Sorry, we cannot find that!');
});

app.get('/upload', function(req, res) {
	res.sendfile(__dirname + '/HTML/iframe.html');
});

app.use(busboy({highWaterMark: 2 * 1024 * 1024,limits: { fileSize: 10 * 1024 * 1024 }})); 

app.post('/upload', function(req, res){
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		console.log("Uploading: " + filename); 
		fstream = fs.createWriteStream(__dirname + '/HTML/uploads/' + filename);
		file.pipe(fstream);
		fstream.on('finish', function () {
			res.redirect('back');
		});
	});
});

app.use(express.static(__dirname + '/HTML'));

server.listen(8181, function (req, res){
	console.log('waxBoutik écoute sur http://localhost:8181');
});

//_________________________________________________________________ nodemailer
var transporter = nodemailer.createTransport({
	host: 'mail.aquaray.com',
	port: 25,
	auth: {
		user: 'wax@wax-gabon.com',
		pass: 'libreville'
	}
});

//_________________________________________________________________ MongoDB
var Db = require('mongodb').Db,
MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
ReplSetServers = require('mongodb').ReplSetServers,
ObjectID = require('mongodb').ObjectID,
Binary = require('mongodb').Binary,
GridStore = require('mongodb').GridStore,
Grid = require('mongodb').Grid,
Code = require('mongodb').Code,
BSON = require('mongodb').pure().BSON,
assert = require('assert');

var db = new Db('waxBoutik', new Server('localhost', 27017, {
	w: 'majority',
	j: 1,
	auto_reconnect: true
}), {
	safe: true
});

db.open(function (err, db){
	if(!err){
		console.log("et s'est connecté à MongoDB !! ENJOY ツ﻿");
	}
});

var COMMANDE = db.collection('COMMANDE');
var ARTICLE = db.collection('ARTICLE');
var CONTACT = db.collection('CONTACT');
var USER = db.collection('USER');
var CHAT = db.collection('CHAT');

Number.prototype.formatMoney = function(c, d, t){
	var n = this, 
	c = isNaN(c = Math.abs(c)) ? 2 : c, 
	d = d == undefined ? "." : d, 
	t = t == undefined ? "," : t, 
	s = n < 0 ? "-" : "", 
	i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
	j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function timeStamp(date){
	var date = new Date(date);
	var annee=date.getFullYear();
	var mois=date.getMonth()+1;
	var jour=date.getDate();
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	var formattedDate = jour + '/' + mois + '/' + annee;
	var formattedTime = hours + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);
	var formatDate=formattedDate+'<br>'+formattedTime

	return formatDate;
}

//_________________________________________________________________ Socket.io
var io = require('socket.io')(server);

Users = []; 

io.sockets.on('connection', function (socket){

	//_________________________________________________________________ Sur upListeClient
	socket.on('upListeClient', function () {
		var result='<option value="" selected>CLIENTS</option>', 
		cursor = USER.find({type:'CLIENT'},{_id:false,pseudo:true,nom:true}).sort({pseudo:1});
		cursor.each(function(err, doc){
			if(doc){
				result+='<option value="'+doc.pseudo+'">'+doc.pseudo+"-"+doc.nom+'</option>'
			}else{
				socket.emit('upListeClient', result);
				socket.emit('upClient','','','','','','','','','','','','');
			}
		});
	});

	//_________________________________________________________________ Sur findClient
	socket.on('findClient', function (pseudo) {
		USER.findOne({pseudo:pseudo,type:'CLIENT'}, function (err, item){
			if(item){
				socket.emit('upClient', item.pseudo,item.mdp,item.nom,item.email,item.ste,item.tel,item.adresse,item.latitude,item.longitude,item.observation,item.rouge,item.actif);
			}else{
				socket.emit('upClient','','','','','','','','','','','','');
			}
		});
	});

	//_________________________________________________________________ Sur upClient

	socket.on('upClient', function (pseudo,mdp,nom,email,ste,tel,adresse,latitude,longitude,observation,rouge,actif) {
		USER.update({pseudo:pseudo},{$set:{pseudo:pseudo,mdp:mdp,type:'CLIENT',nom:nom,email:email,ste:ste,tel:tel,adresse:adresse,latitude:latitude,longitude:longitude,observation:observation,rouge:rouge,actif:actif,date:new Date().getTime()}},{upsert: true}, function (err, res){
			var result='<option value="" selected>CLIENTS</option>', 
			cursor = USER.find({type:'CLIENT'},{_id:false,pseudo:true,nom:true}).sort({pseudo:1});
			cursor.each(function(err, doc){
				if(doc){
					result+='<option value="'+doc.pseudo+'">'+doc.pseudo+"-"+doc.nom+'</option>'
				}else{
					socket.emit('upListeClient', result);
					socket.emit('upClient','','','','','','','','','','','','');
				}
			});
		});
	});

	//_________________________________________________________________ Sur supClient
	socket.on('supClient', function (pseudo) {
		USER.remove( { pseudo:pseudo}, function (err, res){
			var result='<option value="" selected>CLIENTS</option>', 
			cursor = USER.find({type:'CLIENT'},{_id:false,pseudo:true,nom:true}).sort({pseudo:1});
			cursor.each(function(err, doc){
				if(doc){
					result+='<option value="'+doc.pseudo+'">'+doc.pseudo+"-"+doc.nom+'</option>'
				}else{
					socket.emit('upListeClient', result);
					socket.emit('upClient','','','','','','','','','','','','');
				}
			});
		});
	});



	//_________________________________________________________________ Sur upPosition 
	socket.on('upPosition', function (commande,position) {

		COMMANDE.findAndModify({commande:commande},[['_id', 1]],{$set:{position:position}},{new:true},function (err, item){
			if(item){
				var total=0, result='';
				var formatDate=timeStamp(item.date);
				result='<td class="Gauche" data-title="Date">'+formatDate+'</td>'+
				'<td class="Gauche" data-title="Commande">'+item.commande+'</td>'+
				'<td class="Gauche" data-title="Client">'+item.client+'</td>'+
				'<td class="Gauche" data-title="Article"><div class="listeArt">';

				for(i=0;i<item.stock.length;i++){
					total+=(item.stock[i].prix*item.stock[i].qte);
					result+=item.stock[i].qte+' x '+item.stock[i].article+' : '+(item.stock[i].prix*item.stock[i].qte).formatMoney(0, '.', '.')+'<br>';
				}
				totalCommande=(total).formatMoney(0, '.', '.');
				result+='</div></td>'+
				'<td class="Num Strong" data-title="Total">'+totalCommande+'</td>';
				switch (item.position) {
					case 'ENC':
					result+='<td onclick="upPosition(\''+item.commande+'\',\'LIV\')" id="ENC" class="Centre" data-title="EnCours">&nbsp;</td>';
					break;
					case 'LIV':
					result+='<td onclick="upPosition(\''+item.commande+'\',\'RGT\')"  id="LIV" class="Centre" data-title="Livraison">&nbsp;</td>';
					break;
					case 'RGT':
					result+='<td onclick="upPosition(\''+item.commande+'\',\'ENC\')"  id="RGT" class="Centre" data-title="Réglement">&nbsp;</td>';
					break;
				}
				socket.emit('upPosition',result,item.commande);
				socket.broadcast.emit('upPosition',result,item.commande);
			}
		});
});

	//_________________________________________________________________ Sur listeCommande 
	socket.on('listeCommande', function (client) {

		USER.findOne({pseudo:client}, function (err, item){
			if (item) {
				if (item.type=='ADMIN') {
					option={client:{$ne:'INVITE'}};
					listeCommande(option,'ADMIN');
				}else{
					option={client:client};
					listeCommande(option,'CLIENT');
				}
			}
		});

		function listeCommande(option,type){
			var result='',cursor = COMMANDE.find(option,{_id:false,commande:true,client:true,'stock.article':true,'stock.prix':true,'stock.qte':true,position:true,date:true}).sort([['date',1]]);
			cursor.each(function(err, doc){
				if(doc){
					if(doc.commande!=''){
						var totalCommande='', total=0, result='';
						var formatDate=timeStamp(doc.date);
						result+='<tr id="'+doc.commande+'">'+
						'<td class="Gauche" data-title="Date">'+formatDate+'</td>'+
						'<td class="Gauche" data-title="Commande">'+doc.commande+'</td>'+
						'<td class="Gauche" data-title="Client">'+doc.client+'</td>'+
						'<td class="Gauche" data-title="Article"><div class="listeArt">';

						for(i=0;i<doc.stock.length;i++){
							total+=(doc.stock[i].prix*doc.stock[i].qte);
							result+=doc.stock[i].qte+' x '+doc.stock[i].article+' : '+(doc.stock[i].prix*doc.stock[i].qte).formatMoney(0, '.', '.')+'<br>';
						}
						totalCommande=(total).formatMoney(0, '.', '.');
						result+='</div></td>'+
						'<td class="Num Strong" data-title="Total">'+totalCommande+'</td>';
						switch (doc.position) {
							case 'ENC':
							result+='<td onclick="upPosition(\''+doc.commande+'\',\'LIV\')" id="ENC" class="Centre" data-title="EnCours">&nbsp;</td>';
							break;
							case 'LIV':
							result+='<td onclick="upPosition(\''+doc.commande+'\',\'RGT\')"  id="LIV" class="Centre" data-title="Livraison">&nbsp;</td>';
							break;
							case 'RGT':
							result+='<td onclick="upPosition(\''+doc.commande+'\',\'ENC\')"  id="RGT" class="Centre" data-title="Réglement">&nbsp;</td>';
							break;
						}
						result+='</tr>';
						if (type=='ADMIN') {
							socket.emit('upListeCommandeAdmin',result);
						}else{
							socket.emit('upListeCommande',result);
						}
					}
				}
			});
}
});

	//_________________________________________________________________ Sur addCommande 
	socket.on('addCommande', function (client,commande) {

		USER.findOne({pseudo:client,actif:true}, function (err, item){
			if (item) {

				COMMANDE.findAndModify({commande:commande},[['_id', 1]],{$set:{commande:commande,client:client,position:'ENC',date:new Date().getTime()}},{new:true},function (err, item){
					if(item){
						var total=0, result='';
						var formatDate=timeStamp(item.date);
						result='<tr id="'+item.commande+'">'+
						'<td class="Gauche" data-title="Date">'+formatDate+'</td>'+
						'<td class="Gauche" data-title="Commande">'+item.commande+'</td>'+
						'<td class="Gauche" data-title="Client">'+item.client+'</td>'+
						'<td class="Gauche" data-title="Article"><div class="listeArt">';

						for(i=0;i<item.stock.length;i++){
							total+=(item.stock[i].prix*item.stock[i].qte);
							result+=item.stock[i].qte+' x '+item.stock[i].article+' : '+(item.stock[i].prix*item.stock[i].qte).formatMoney(0, '.', '.')+'<br>';
						}

						totalCommande=(total).formatMoney(0, '.', '.');
						result+='</div></td>'+
						'<td class="Num Strong" data-title="Total">'+totalCommande+'</td>';
						switch (item.position) {
							case 'ENC':
							result+='<td onclick="upPosition(\''+item.commande+'\',\'LIV\')" id="ENC" class="Centre" data-title="EnCours">&nbsp;</td>';
							break;
							case 'LIV':
							result+='<td onclick="upPosition(\''+item.commande+'\',\'RGT\')"  id="LIV" class="Centre" data-title="Livraison">&nbsp;</td>';
							break;
							case 'RGT':
							result+='<td onclick="upPosition(\''+item.commande+'\',\'ENC\')"  id="RGT" class="Centre" data-title="Réglement">&nbsp;</td>';
							break;
						}
						result+='</tr>';
						socket.emit('upCommande',result);
						socket.broadcast.emit('upListeCommandeAdmin',result);
					}
				});

}else{
	socket.emit('alerte','Votre compte client n\'est pas encore activé !!');
}
});
});

	//_________________________________________________________________ Sur supPanier
	socket.on('supPanier', function (commande,article) {
		COMMANDE.update({commande:commande,'stock.article':article},{$inc:{'stock.$.qte':-1}},{upsert:true,w: 1},function (err, res){
			COMMANDE.findOne({commande:commande,'stock.article':article,'stock.qte':0}, function (err, item){
				if (item) {
					COMMANDE.update({commande:commande,'stock.article':article},{$pull: { stock : { article: article }}},{w:1},function (err, res){
						Panier(commande);
					});
				}else{
					Panier(commande);
				}
			});
		});

		function Panier(commande){
			COMMANDE.findOne({commande:commande},{_id:false,commande:true,'stock.article':true,'stock.prix':true,'stock.qte':true},function(err, item){
				var total=0, result='';
				if(item){
					for(i=0;i<item.stock.length;i++){
						total+=(item.stock[i].prix*item.stock[i].qte);
						result+='<li>'+
						'<span class="cd-qty">'+item.stock[i].qte+'x</span> '+item.stock[i].article+
						'<div class="cd-price">'+"F.cfa "+(item.stock[i].prix*item.stock[i].qte).formatMoney(0, '.', '.')+'</div>'+
						'<a href="javascript:supPanier(\''+item.commande+'\',\''+item.stock[i].article+'\')" class="cd-item-remove cd-img-replace">Remove</a>'+
						'</li>';
					}
				}
				total="F.cfa "+(total).formatMoney(0, '.', '.');
				socket.emit('upPanier', commande,result,total);
			});
		}
	});

	//_________________________________________________________________ Sur addPanier
	socket.on('addPanier', function (commande,client,article,prix) {
		if(commande==''){
			COMMANDE.count(function (err, count){
				if (count==0) {
					COMMANDE.insert({commande:'',client:'',date:0,position:'',stock:[{article:'',prix:0,qte:0}]},function (err, res){

					});
					var commande=('1').toString();
				}else{
					var commande=(count).toString();
				}
				addPanier(commande,client,article,parseInt(prix));
			});
		}else{
			addPanier(commande,client,article,parseInt(prix));
		}
		
		function addPanier(commande,client,article,prix){

			COMMANDE.findOne({commande:commande,'stock.article':article},function (err, item){
				if(!item){
					COMMANDE.update({commande:commande},{$set:{commande:commande,client:client,position:'ENC',date:new Date().getTime()},$addToSet: {stock:{article:article,prix:prix}}},{upsert:true,w: 1},function (err, res){
						upQte(commande,client,article,prix);
					});
				}else{
					COMMANDE.update({commande:commande},{$set:{commande:commande,client:client,position:'ENC','stock.$.article':article,'stock.$.prix':prix,date:new Date().getTime()}},{upsert:true,w: 1},function (err, res){
						upQte(commande,client,article,prix);
					});
				}
			});

			function upQte(commande,client,article,prix){
				var prix=parseInt("0"+prix);
				COMMANDE.update({commande:commande,client:client,position:'ENC','stock.article':article},{$inc:{'stock.$.qte':1}},{upsert:true,w: 1},function (err, res){
					COMMANDE.findOne({commande:commande},{_id:false,commande:true,'stock.article':true,'stock.prix':true,'stock.qte':true},function(err, item){
						var total=0, result='';
						if(item){
							for(i=0;i<item.stock.length;i++){
								total+=(item.stock[i].prix*item.stock[i].qte);
								result+='<li>'+
								'<span class="cd-qty">'+item.stock[i].qte+'x</span> '+item.stock[i].article+
								'<div class="cd-price">'+"F.cfa "+(item.stock[i].prix*item.stock[i].qte).formatMoney(0, '.', '.')+'</div>'+
								'<a href="javascript:supPanier(\''+item.commande+'\',\''+item.stock[i].article+'\')" class="cd-item-remove cd-img-replace">Remove</a>'+
								'</li>';
							}
						}
						total="F.cfa "+(total).formatMoney(0, '.', '.');
						socket.emit('upPanier', commande,result,total);
					});
				});
			}
		}
	});


	//_________________________________________________________________ Sur upFamille 
	socket.on('upFamille', function (famille) {

		var pFam='',resultFam='',resultArt='', cursor = ARTICLE.find({},{_id:false,famille:true,article:true,prix:true,descriptif:true,photo:true}).sort({famille:1,article:1});
		cursor.each(function(err, doc){
			if(doc){
				if (famille=='') {
					famille=doc.famille;
				}
				if (pFam!=doc.famille) {
					if (famille==doc.famille) {
						resultFam+='<option value="'+doc.famille+'" selected>'+doc.famille+'</option>';
					}else{
						resultFam+='<option value="'+doc.famille+'">'+doc.famille+'</option>';
					}
					pFam=doc.famille;
				}
				if (famille==doc.famille) {
					resultArt+='<li class="'+doc.famille+'">'+
					'<div class="view view-seventh">'+
					'<img src="'+doc.photo+'" alt="Preview image">'+
					'<div class="mask" style="background:url(\''+doc.photo+'\') no-repeat scroll 0 / cover transparent;">'+
					'<h2>'+doc.article+' - '+"F.cfa "+(doc.prix).formatMoney(0, '.', '.')+'</h2>'+
					'<p>'+doc.descriptif+'</p>'+
					'<a href="javascript:addPanier(\''+doc.article+'\',\''+doc.prix+'\')" class="info Vert">COMMANDER</a>'+
					'</div>'+
					'</div>'+
					'</li>'
				}

			}else{
				socket.emit('upFamille', resultFam , resultArt);
			}
		});
	});

	//_________________________________________________________________ Sur upFamArt 
	socket.on('upFamArt', function () {
		var result='<option value="" selected>PRODUITS</option>', 
		cursor = ARTICLE.find({},{_id:false,famille:true,article:true}).sort({famille:1,article:1});
		cursor.each(function(err, doc){
			if(doc){
				result+='<option value="'+doc.article+'">'+doc.famille+"-"+doc.article+'</option>'
			}else{
				socket.emit('upFamArt', result);
				socket.emit('upArt', '','','','','img/thumb.jpg');
			}
		});
	});

	//_________________________________________________________________ Sur findArt
	socket.on('findArt', function (article) {
		ARTICLE.findOne({article:article}, function (err, item){
			if(item){
				socket.emit('upArt', item.famille,item.article,item.prix,item.descriptif,item.photo);
			}else{
				socket.emit('upArt', '','','','','img/thumb.jpg');
			}
		});
	});

	//_________________________________________________________________ Sur addArt
	socket.on('addArt', function (famille,article,prix,descriptif,photo) {
		var prix=parseInt("0"+prix);
		ARTICLE.update({article:article},{$set:{famille:famille,article:article,prix:prix,descriptif:descriptif,photo:photo,date:new Date().getTime()}},{upsert: true}, function (err, res){
			var result='<option value="" selected>PRODUITS</option>', 
			cursor = ARTICLE.find({},{_id:false,famille:true,article:true}).sort({famille:1,article:1});
			cursor.each(function(err, doc){
				if(doc){
					result+='<option value="'+doc.article+'">'+doc.famille+"-"+doc.article+'</option>'
				}else{
					socket.emit('upFamArt', result);
					socket.emit('upArt', '','','','','img/thumb.jpg');
				}
			});
		});
	});

	//_________________________________________________________________ Sur supArt
	socket.on('supArt', function (article) {
		ARTICLE.remove( { article:article}, function (err, res){
			var result='<option value="" selected>PRODUITS</option>', 
			cursor = ARTICLE.find({},{_id:false,famille:true,article:true}).sort({famille:1,article:1});
			cursor.each(function(err, doc){
				if(doc!=null){
					result+='<option value="'+doc.article+'">'+doc.famille+"-"+doc.article+'</option>'
				}else{
					socket.emit('upFamArt', result);
					socket.emit('upArt', '','','','','img/thumb.jpg');
				}
			});
		});
	});

	//_________________________________________________________________ Sur upLoad
	socket.on('upLoad', function (article,filename) {
		var parts = filename.split(".");
		lwip.open(__dirname +'/HTML/uploads/'+filename, function(err, image){
			if(image){
				var longueur=image.width(),largeur=image.height();
				if(longueur>largeur){
					taille=largeur;
				}else{
					taille=longueur;
				}
				image.batch().crop(taille,taille).writeFile(__dirname +'/HTML/uploads/'+article+'.'+parts[(parts.length-1)], function(err){
					socket.emit('upPhoto','uploads/'+article+'.'+parts[(parts.length-1)]);
					fs.unlinkSync(__dirname +'/HTML/uploads/'+filename);
				});
			}
		});
	});

	//_________________________________________________________________ Sur nodemailer

	socket.on('upMail', function (contact,mail,ste,tel,cmt) {
		var mailOptions = {
			from: mail,
			to: 'hdelmas@gmail.com',
			subject: 'Contact waxBoutik ✔', 
			html: '<b>'+contact+'</b><br>'+ste+'<br>'+tel+'<br>'+cmt+'<br>'
		};
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				socket.emit('upMail',error.message);
			}else{
				socket.emit('upMail','Message : ' + info.response);
				CONTACT.insert({contact:contact,mail:mail,ste:ste,tel:tel,cmt:cmt,date:new Date().getTime()},function (err,res){});
			}
		});
	});

	//_________________________________________________________________ Sur storeOpen
	socket.on('storeOpen', function () {
		var Pos=Users.map(function(e) { return e.type; }).indexOf('ADMIN');
		if (Pos!=-1) {
			socket.emit('storeOpen');
		}else{
			socket.emit('storeClose');
		}
	});

	//_________________________________________________________________ Sur click envoi chat
	socket.on('sendChat', function (pseudo,chat) {
		if (pseudo=='') {
			pseudo='INVITE';
		}
		socket.emit('upChat', pseudo, chat);
		socket.broadcast.emit('upChat', pseudo, chat);
		CHAT.insert({pseudo:pseudo,chat:chat,date:new Date().getTime()},function (err,res){});
	});

	//_________________________________________________________________ Sur ajout d'un pseudo
	socket.on('addUser', function(pseudo,mdp,type){
		USER.findOne({pseudo:pseudo}, function (err, item){
			if (!item & type=='CLIENT') {
				USER.update({pseudo:pseudo,mdp:mdp,type:type},
					{$set:{pseudo:pseudo,mdp:mdp,type:type,date:new Date().getTime()}},
					{upsert: true}, function (err, res){
						socket.emit('cnxUser', pseudo);
						socket.emit('upChat', pseudo, 'Vous êtes enregistré...');
						socket.broadcast.emit('upChat', pseudo, 'C\'est enregistré...');
						CHAT.insert({pseudo:pseudo,chat:'C\'est enregistré...',date:new Date().getTime()},function (err,res){});
					});
			}
			else{
				socket.emit('doublonUser','Désolé ! Ce pseudo existe déjà.\nChoisisez en un autre, svp.');
			}
		});
	});

	//_________________________________________________________________ Sur connexion d'un pseudo
	socket.on('cnxUser', function(pseudo,mdp,type){
		
		function cnxUser(pseudo,mdp,type){
			if (Users.map(function(e) { return e.pseudo; }).indexOf(pseudo)==-1) {
				USER.findOne({pseudo:pseudo,mdp:mdp,type:type}, function (err, item){
					if (item) {
						Users.push({pseudo:pseudo,type:type,latitude:0,longitude:0});
						socket.username = pseudo;
						socket.emit('okUser');
						socket.emit('upChat', pseudo, 'Vous êtes connecté...');
						socket.broadcast.emit('upChat', pseudo, 'C\'est connecté...');
						CHAT.insert({pseudo:pseudo,chat:'C\'est connecté...',date:new Date().getTime()},function (err,res){});

						if (type=='ADMIN') {
							socket.emit('storeOpen');
							socket.broadcast.emit('storeOpen');
						}
					}
					else{
						socket.emit('doublonUser','Désolé ! Je ne vous ai pas trouvé.\nRecommencez svp.');
					}
				});
			}else{
				socket.emit('doublonUser','Désolé ! Vous êtes déjà connecté.\nRecommencez svp.');
			}
		}

		if (type=='ADMIN') {

			USER.findOne({pseudo:pseudo,mdp:mdp,type:type}, function (err, item){
				if (!item) {
					USER.update({pseudo:pseudo,mdp:mdp,type:type},
						{$set:{pseudo:pseudo,mdp:mdp,type:type,date:new Date().getTime()}},
						{upsert: true}, function (err, res){
							cnxUser(pseudo,mdp,type);
						});
				}else{
					cnxUser(pseudo,mdp,type);
				}
			});
		}else{
			cnxUser(pseudo,mdp,type);
		}
	});

	//_________________________________________________________________ Sur supUser
	socket.on('supUser', function(pseudo){
		var Pos=Users.map(function(e) { return e.pseudo; }).indexOf(pseudo);
		if (Pos!=-1) {
			socket.emit('supUser', pseudo);
			socket.broadcast.emit('supUser', pseudo);
			socket.emit('upChat', pseudo, 'Vous êtes déconnecté...');
			socket.broadcast.emit('upChat', pseudo, 'C\'est déconnecté...');
			CHAT.insert({pseudo:pseudo,chat:'C\'est déconnecté...',date:new Date().getTime()},function (err,res){});
			Users.splice(Pos,1);
		}
	});

	//_________________________________________________________________ Sur upUsers
	socket.on('upUsers', function(pseudo,type,latitude,longitude){
		if (pseudo!='') {
			var Pos=Users.map(function(e) { return e.pseudo; }).indexOf(pseudo);
			if (Pos==-1) {
				Users.push({pseudo:pseudo,type:type,latitude:latitude,longitude:longitude});
			}else{
				Users[Pos].latitude=latitude;
				Users[Pos].longitude=longitude;
			}
			if (pseudo!='') {
				USER.update({pseudo:pseudo},{$set:{latitude:latitude,longitude:longitude,date:new Date().getTime()}},{upsert: true}, function (err, res){
					socket.username = pseudo;
					socket.emit('upChat', pseudo, 'Vous êtes géolocalisé...');
					socket.broadcast.emit('upChat', pseudo, 'C\'est géolocalisé...');
					CHAT.insert({pseudo:pseudo,chat:'C\'est géolocalisé...',date:new Date().getTime()},function (err,res){});
				});
			}
		}
		for (var i = 0; i < Users.length; i++) {
			socket.emit('upUser',Users[i].pseudo,Users[i].type,Users[i].latitude,Users[i].longitude);
			socket.broadcast.emit('upUser',Users[i].pseudo,Users[i].type,Users[i].latitude,Users[i].longitude);
		}

	});

	//_________________________________________________________________ Sur deplacement d'un pseudo
	socket.on('moovUser', function(pseudo,latitude,longitude){
		var Pos=Users.map(function(e) { return e.pseudo; }).indexOf(pseudo);
		if (Pos!=-1) {
			Users[Pos].latitude=latitude;
			Users[Pos].longitude=longitude;
			socket.emit('upUser', pseudo,Users[Pos].type,latitude,longitude);
			socket.broadcast.emit('upUser', pseudo,Users[Pos].type,latitude,longitude);
		}
	});

	//_________________________________________________________________ Sur deconnexion
	socket.on('disconnect', function(){
		var Pos=Users.map(function(e) { return e.pseudo; }).indexOf(socket.username);
		if (Pos!=-1) {
			socket.broadcast.emit('supUser', socket.username);
			socket.broadcast.emit('upChat', socket.username, 'C\'est déconnecté...');
			CHAT.insert({pseudo:socket.username,chat:'C\'est déconnecté...',date:new Date().getTime()},function (err,res){});
			Users.splice(Pos,1);
		}
		var Pos=Users.map(function(e) { return e.type; }).indexOf('ADMIN');
		if (Pos==-1) {
			socket.broadcast.emit('storeClose');
		}
		socket.leave(socket);
	});

});


