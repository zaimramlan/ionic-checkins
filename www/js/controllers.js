angular.module('app.controllers', [])

.run(function($rootScope, LocalStorage){
	$rootScope.checkins = LocalStorage.get('checkins', []);

	// $rootScope.checkins = [
	// 	{
	// 		id: 1,
	// 		latitude: 0,
	// 		longitude: 0,
	// 		address: "Microsoft Malaysia, Tower 1, KLCC",
	// 		descriptions: 'I was here'
	// 	},
	// 	{
	// 		id: 2,
	// 		latitude: 0,
	// 		longitude: 0,
	// 		address: "Microsoft Malaysia, Tower 2, KLCC",
	// 		descriptions: 'I am here'
	// 	},
	// 	{
	// 		id: 3,
	// 		latitude: 0,
	// 		longitude: 0,
	// 		address: "Microsoft Malaysia, Tower 3, KLCC",
	// 		descriptions: 'I was not here'
	// 	}
	// ]	
})
  
.controller('listingCtrl', function($scope, LocalStorage) {
	$scope.deleteCheckin = function(checkin) {
		if(confirm('Are you sure you want to delete this?')) {
			var index = $scope.checkins.indexOf(checkin);
			$scope.checkins.splice(index, 1);
			LocalStorage.update('checkins', $scope.checkins);
		}
	}
})
   
.controller('getLocationCtrl', function(
	$scope,
	$state,
	LocalStorage,
	$cordovaGeolocation,
	ReverseGeoCoder
	) {

	$cordovaGeolocation.getCurrentPosition({
		timeout: 20000,
		maximumAge: 30000,
		enableHighAccuracy: false,
	}).then(function(results){
		console.log(results);
		$scope.latitude = results.coords.latitude;
		$scope.longitude = results.coords.longitude;
		ReverseGeoCoder.get($scope.latitude, $scope.longitude)
		.then(function(results) {
			$scope.address = results.address;
			$scope.maps = results.map;
		})
	}, function(){
		console.log('error');
	})

	// $scope.saveLocation = function() {
	// 	$scope.checkins.push({
	// 		id: $scope.checkins.length + 1,
	// 		latitude: $scope.latitude,
	// 		longitude: $scope.longitude,
	// 		address: $scope.address,
	// 		descriptions: $scope.descriptions,
	// 	});
	// 	$state.go('listing');
	// }

	$scope.storeLocation = function() {
		$scope.checkins.push({
			id: $scope.checkins.length + 1,
			latitude: $scope.latitude,
			longitude: $scope.longitude,
			address: $scope.address,
			descriptions: $scope.descriptions,
			maps: $scope.maps
		});
		LocalStorage.set('checkins', $scope.checkins);
		$state.go('listing');		
	}
})
   
.controller('locationDetailsCtrl', function($scope, $stateParams) {
	$scope.checkin = $scope.checkins.filter(function(checkin){
		return checkin.id == $stateParams.id;
	}).pop();
})

.controller('viewMapCtrl', function(
	$scope,
	$state,
	$cordovaGeolocation
	){

	$cordovaGeolocation.getCurrentPosition({
		timeout: 10000,
		enableHighAccuracy: true
	}).then(function(position){
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;

		var latLng = new google.maps.LatLng(latitude,longitude);
		var mapOptions = {
			center: latLng,
			zoom: 17,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};		

		$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

		google.maps.event.addListenerOnce($scope.map, 'idle', function(){
			var marker = new google.maps.Marker({
				map: $scope.map,
				animation: google.maps.Animation.DROP,
				position: latLng,
			});			

			var infoWindow = new google.maps.InfoWindow({
				content: 'UIA Gombak'
			});

			google.maps.event.addListener(marker, 'click', function(){
				infoWindow.open($scope.map, marker);
			})

			google.maps.event.addListener($scope.map, 'click', function(event){
				var marker = new google.maps.Marker({
					position: event.latLng,
					map: $scope.map,
					animation: google.maps.Animation.DROP,
					draggable: true
				})

				console.log(event.latLng.lat() + " " + event.latLng.lng());
			})			
		})



	}, function(error){
		console.log("could not get location");
	});
});