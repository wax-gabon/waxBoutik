
map = null, marker = null; 
Users=[];
Markers=[];


//_________________________________________________________________ Sur connexion GoogleMap
function getOpen()
{
	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(getMap,showError);
	}
	else{alert("Geolocation is not supported by this browser.");}
}

//_________________________________________________________________ getMap
function getMap(position)
{
	var mapCenter = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
	var mapOptions = {
		zoom: 14,
		center: mapCenter,
		styles: [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}]
	};
	var mapElement = document.getElementById('map_canvas');
	map = new google.maps.Map(mapElement, mapOptions);

	if(!window.map){
		alert("Carte non chargée !!\nRecommencez svp...");
		getOpen();
	}
	else{
		document.getElementById('latitude').value = position.coords.latitude;
		document.getElementById('longitude').value = position.coords.longitude;
		google.maps.event.trigger(map, 'resize');
		map.panTo(new google.maps.LatLng(document.getElementById('latitude').value,document.getElementById('longitude').value));
		
		socket.emit('upUsers',document.getElementById('pseudo').value,document.getElementById('type').value,document.getElementById('latitude').value,document.getElementById('longitude').value);
		
		document.getElementById('loader').style.display = 'none';
		getPosition(position);
	}
}

//_________________________________________________________________ getLocation / getPosition
function getLocation()
{
	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(getPosition,showError);
	}
	else{
		alert("Geolocation impossible.");
	}
}
function getPosition(position)
{
	if (document.getElementById('drag').value==false) {
		if (document.getElementById('latitude').value != position.coords.latitude || document.getElementById('longitude').value != position.coords.longitude) {

			document.getElementById('latitude').value = position.coords.latitude;
			document.getElementById('longitude').value = position.coords.longitude;

			if (document.getElementById('pseudo').value!='') {
				socket.emit('moovUser',document.getElementById('pseudo').value,document.getElementById('latitude').value,document.getElementById('longitude').value);
			}
		}
		setTimeout(function(){getLocation()},5000);
	}
}

//_________________________________________________________________ getMarker
function getMarker(uti,type,lat,lon)
{
	if(window.map){

		if (type=='ADMIN') {
			var size=new google.maps.Size(50, 50);
			var anchor=new google.maps.Point(25, 25);
			var contenu = '<div id="contentMap">'+
			'<h1>'+uti+'</h1>'+
			'<p>Resto OUVERT !!</p>'+
			'<p><a href="http://wax-gabon.com">http://wax-gabon.com</a></p></div>';
		}else{
			var size=new google.maps.Size(20, 20);
			var anchor=new google.maps.Point(10, 10);
			if (uti==document.getElementById('pseudo').value) {
				var contenu = '<div id="contentMap">'+
				'<h1>'+uti+'</h1>'+
				'<p>Vous pouvez déplacer votre poineur à l\'endroit exact ou vous voulez etre livré !!</p>'+
				'<p>Bon app ツ﻿</p></div>';
			}else{
				var contenu = '<div id="contentMap"><p>'+uti+' ツ﻿</p></div>';
			}
		}

		if (uti==document.getElementById('pseudo').value) {
			var drag=true;
			if (document.getElementById('type').value=='ADMIN') {
				var avatar='img/pulse.png';
			}else{
				var avatar='img/puceVerte.png';
			}
		}else{

			var avatar='img/puce.png';
			if (type=='ADMIN') {
				var avatar='img/pulse.png';
			}
			var drag=false;
		}

		var pinImage = {
			url: avatar,
			size: size,
			anchor: anchor
		};

		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(lat,lon),
			animation: google.maps.Animation.DROP,
			icon: pinImage,
			draggable:drag,
			map: map
		});

		var infowindow01 = new google.maps.InfoWindow({content: contenu});
		var infowindow02 = new google.maps.InfoWindow({content: contenu});

		google.maps.event.addListener(map, "click", function () {
			infowindow01.close(map,this);
		});


		//_________________________________________________________________ Création du listener du clic de souris sur le marqueur
		google.maps.event.addListener(marker, 'dragend', function() 
		{
			document.getElementById('drag').value = 'true';
			document.getElementById('latitude').value = marker.position.k;
			document.getElementById('longitude').value = marker.position.B;
			socket.emit('upUsers',document.getElementById('pseudo').value,document.getElementById('type').value,document.getElementById('latitude').value,document.getElementById('longitude').value);
			socket.emit('moovUser',
				document.getElementById('pseudo').value,
				document.getElementById('latitude').value,
				document.getElementById('longitude').value);
		});

		//_________________________________________________________________ Création du listener du clic de souris sur le marqueur
		google.maps.event.addListener(marker, 'click', function() {
			infowindow02.close(map,this);
			infowindow01.open(map,this);
		});

    	//_________________________________________________________________ Création du listener du mouseover de souris sur le marqueur
    	google.maps.event.addListener(marker, 'mouseover', function() {
    		infowindow02.open(map,this);
    	});

		//_________________________________________________________________ Création du listener du mouseout de souris sur le marqueur
		google.maps.event.addListener(marker, 'mouseout', function() {
			infowindow02.close(map,this);
		});

		//_________________________________________________________________ Ajout marker dans Markers
		var Pos=jQuery.inArray(uti, Users)
		if (Pos == -1 | Users.length==0) {
			Users[Users.length] = uti;
			Markers[Markers.length] = marker;
			$('#son')[0].play();
		}else{
			Markers[Pos] = marker;
		}
	}
}
//_________________________________________________________________ Erreurs GoogleMap
function showError(error)
{
	if(confirm("Erreur de geolocalisation ...\nVoulez vous vous reconnecter ?")){getLocation();}

}


