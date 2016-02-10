(function(angular, undefined) {
	'use strict';

	/**
	 * Geocoder Service
	 */
	angular
		.module('app')
		.service('Geocoder', GeocoderService);

	GeocoderService.$inject = ['$http'];

	function GeocoderService($http) {

		this.searchPlace = function(query) {
			return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
				params: {
					address: query,
					sensor: false
				}
			});
		};

		this.getPlaceInfo = function(lonlat) {
			return $http.get('https://maps.googleapis.com/maps/api/geocode/json', {
				params: {
					latlng: lonlat.lat + ',' + lonlat.lon,
					sensor: false
				}
			});
		};

		this.getGeoIP = function() {
			return $http.jsonp('http://www.telize.com/geoip?callback=JSON_CALLBACK');
		};
	}

})(window.angular);
