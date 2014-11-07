

//_________________________________________________________________ IO
do {
	socket = io();
}
while (!socket);

//_________________________________________________________________ Sur Connexion
socket.on('connect', function(){

});

//_________________________________________________________________  upPosition
socket.on('upPosition', function (result,commande) {
	document.getElementById('loader').style.display = 'none';
	$('#'+commande).html(result);
});

//_________________________________________________________________ upListeCommande
socket.on('upListeCommande', function (result) {
	document.getElementById('loader').style.display = 'none';
	$('#tableCommande tbody').prepend(result);
});
//_________________________________________________________________ upCommande 
socket.on('upCommande', function (result) {
	document.getElementById('loader').style.display = 'none';
	document.getElementById('commande').value ='';
	$('#tableCommande tbody').prepend(result);
	$('#cd-cart h2').html('COMMANDE');
	$('#TOTAL').html('F.cfa 0');
	$('#bValider').fadeOut();
	$('#cd-cart-ul').html('');
});

//_________________________________________________________________ upFamille 
socket.on('upFamille', function (resultFam,resultArt) {
	document.getElementById('loader').style.display = 'none';
	$('#sPRODUIT').html(resultFam);
	$('#cd-gallery-items').html(resultArt);
});

//_________________________________________________________________ upPanier 
socket.on('upPanier', function (commande,panier,total) {
	document.getElementById('loader').style.display = 'none';
	document.getElementById('commande').value = commande;
	$('#cd-cart h2').html('COMMANDE N° '+commande);
	$('#cd-cart-ul').html(panier);
	$('#TOTAL').html(total);
});

//_________________________________________________________________ upListeClient 
socket.on('upListeClient', function (listeClient) {
	document.getElementById('loader').style.display = 'none';
	$('#sCLIENT').html(listeClient);
});
//_________________________________________________________________ upClient
socket.on('upClient', function (pseudoClient,mdpClient,nomClient,emailClient,steClient,telClient,adresseClient,latClient,lonClient,obsClient,rougeClient,actifClient) {
	document.getElementById('loader').style.display = 'none';
	document.getElementById('pseudoClient').value = pseudoClient;
	document.getElementById('mdpClient').value = mdpClient;
	document.getElementById('nomClient').value = nomClient;
	document.getElementById('emailClient').value = emailClient;
	document.getElementById('steClient').value = steClient;
	document.getElementById('telClient').value = telClient;
	document.getElementById('adresseClient').value = adresseClient;
	document.getElementById('latClient').value = latClient;
	document.getElementById('lonClient').value = lonClient;
	document.getElementById('obsClient').value = obsClient;
	document.getElementById('rougeClient').value = rougeClient;
	document.getElementById('actifClient').value = actifClient;
	if(rougeClient==true) {
		document.getElementById("rougeClient").checked = true;
	}else{
		document.getElementById("rougeClient").checked = false;
	}
	if(actifClient==true) {
		document.getElementById("actifClient").checked = true;
	}else{
		document.getElementById("actifClient").checked = false;
	}
	$('#tableCommande tbody').html('');
	socket.emit('listeCommande',document.getElementById('pseudoClient').value);
	if (pseudoClient!='') {
		$('#supClient').fadeIn();
	}else{
		$('#supClient').fadeOut();
	}
});

//_________________________________________________________________ alerte 
socket.on('alerte', function (alerte) {
	document.getElementById('loader').style.display = 'none';
	alert(alerte);
});
//_________________________________________________________________ upFam 
socket.on('upFamArt', function (FamArt) {
	document.getElementById('loader').style.display = 'none';
	$('#sPRODUIT').html(FamArt);
});
//_________________________________________________________________ upArt
socket.on('upArt', function (famille,article,prix,descriptif,photo) {
	document.getElementById('loader').style.display = 'none';
	document.getElementById('famille').value = famille;
	document.getElementById('article').value = article;
	document.getElementById('prix').value = prix;
	document.getElementById('descriptif').value = descriptif;
	document.getElementById("photo").value=photo;
	document.getElementById("photoArticle").style.backgroundImage="url('"+photo+"')";
	if (article!='') {
		$('#supArt').fadeIn();
	}else{
		$('#supArt').fadeOut();
	}
});

//_________________________________________________________________ upPhoto
socket.on('upPhoto', function (photo) {
	document.getElementById('loader').style.display = 'none';
	document.getElementById("photo").value=photo;
	var aleatoir=Math.floor(Math.random() * 1000).toString();
	document.getElementById("photoArticle").style.backgroundImage="url('"+photo+'?'+aleatoir+"')";
});

//_________________________________________________________________ upMail
socket.on('upMail', function (reponse) {
	document.getElementById('loader').style.display = 'none';
	document.getElementById('name').value = '';
	document.getElementById('email_address').value = '';
	document.getElementById('company').value = '';
	document.getElementById("phone_number").value='';
	document.getElementById("The_message").value='';

	alert(reponse);
});

//_________________________________________________________________ Sur storeOpen
socket.on('storeOpen', function(){
	document.getElementById("logoImg").src = 'img/puce/vert.svg';
});

//_________________________________________________________________ Sur storeClose
socket.on('storeClose', function(){
	document.getElementById("logoImg").src = 'img/puce/rouge.svg';
});

//_________________________________________________________________ Sur doublonUser
socket.on('doublonUser', function(message){
	document.getElementById('loader').style.display = 'none';
	if (document.getElementById('type').value=='ADMIN') {
		window.location.replace('http://resto.ga');
	}else{
		document.getElementById('id').value='';
		document.getElementById('pseudo').value='';
		document.getElementById('mdp').value='';
		$('#bEnregistrer').fadeIn();
		$('#bConnexion').fadeIn();
		$('#bDeconnexion').fadeOut();
		alert(message);
	}
});
//_________________________________________________________________ Sur doublonAdmin
socket.on('doublonAdmin', function(){
	window.location.replace('http://'+document.location.host);
});

//_________________________________________________________________ Sur cnxUser 
socket.on('cnxUser', function(){
	if (document.getElementById('pseudo').value!='') {
		socket.emit('supUser',document.getElementById('pseudo').value);
		$('#tableCommande tbody').html('');
	}
	socket.emit('cnxUser',document.getElementById('id').value,document.getElementById('mdp').value,document.getElementById('type').value);
});

//_________________________________________________________________ Sur okUser 
socket.on('okUser', function(){
	document.getElementById('loader').style.display = 'none';
	document.getElementById('pseudo').value=document.getElementById('id').value;
	socket.emit('listeCommande',document.getElementById('pseudo').value);
	if(window.map){
		socket.emit('moovUser',document.getElementById('pseudo').value,document.getElementById('latitude').value,document.getElementById('longitude').value);
	}
	$('#bEnregistrer').fadeOut();
	$('#bConnexion').fadeOut();
	$('#bDeconnexion').fadeIn();
});

//_________________________________________________________________ supUser
socket.on('supUser', function (username) {
	var Pos=jQuery.inArray(username, Users)
	if (Pos != -1) {
		var marker = Markers[Pos];
		marker.setMap(null);
		Users.splice(Pos, 1);
		Markers.splice(Pos, 1);
	}
});

//_________________________________________________________________ upUser
socket.on('upUser', function (pseudo,type,latitude,longitude) {
	var Pos=jQuery.inArray(pseudo, Users)
	if (Pos!=-1) {
			//________________________________________Changer Avatar...
			var latlng = new google.maps.LatLng(latitude,longitude);
			Markers[Pos].setPosition(latlng);
		}else{
			getMarker(pseudo,type,latitude,longitude);
		}
	});


//_________________________________________________________________ createDiv & pseudoMap

function createDiv(pseudo,text){
	var div='<div id="divChat"><div id="divPseudo" onclick="pseudoMap(\''+pseudo+'\')" >'+pseudo+'</div><div id="divClear"></div>'+
	'<div id="divText">'+text+'</div><div id="divClear"></div></div>'
	return div;
}

function pseudoMap(pseudo){
	if (window.map) {
		if (jQuery.inArray(pseudo, Users) != -1) {
			MENU ('GEOLOK');
			map.panTo(Markers[jQuery.inArray(pseudo, Users)].position);
			map.setZoom(18);
		}
		else{alert(pseudo+" n'est pas geolocalisé !");}
	}else{alert("Vous devez vous geolocaliser !");}
}

//_________________________________________________________________ upChat
socket.on('upChat', function (pseudo,text) {
	$('#conversation').prepend(createDiv(pseudo,text));
});

//_________________________________________________________________ Sur envoi de message

function sendChat() {
	var message = $('#chat').val();
	$('#chat').val('');
	if (message!='') {
		socket.emit('sendChat', document.getElementById('pseudo').value, message);
		$('#text').focus();
	};
}

$(function(){
	$('#chat').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur();
			sendChat();
		}
	});
});



