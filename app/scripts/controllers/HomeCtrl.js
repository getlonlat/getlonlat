/*
 * Home Controller
 */
function HomeCtrl($scope, $location, $window, Map)
{
	var map_marker = '/img/target.png';

	function _init()
	{
		$scope.year 		 = (new Date()).getFullYear();
		$scope.zoom 		 = 1;
		$scope.zooms 		 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
		$scope.latitude  = 0;
		$scope.longitude = 0;

		$scope.baselayer  = 0;
		$scope.separator  = 'comma';
		$scope.projection = 'EPSG:4326';
		$scope.defaultProjection = 'EPSG:4326';

		Map.init({
			id: 'map',
			startZoom: $scope.zoom,
			startPoint: { lon: 0, lat: 0 },
			onSelectPoint: $scope.onSelectPoint
		});

		Map.getActualZoom(function(zoom) {
			$scope.zoom = zoom;
			_applyPhase();
		});

		Map.enableDragPoint(function(point) {
			_updateValues(point);
		});

		$scope.dropMarker();

		angular.element($window).bind('resize', function() { Map.fixMapHeight(); });
	}

	function _applyPhase()
	{
		if(!$scope.$$phase) $scope.$apply();
	};

	function _separator()
	{
		switch($scope.separator)
		{
			case 'space': return ' ';
			case 'comma': return ', ';
		}
	};

	function _updateValues(point)
	{
		$scope.actualPoint = point;

		var lonlat = { x: point.lon, y: point.lat }
		var point = Map.xy2lonlat(lonlat);

		if($scope.projection !== $scope.defaultProjection)
		{
			point = Map.transform(point, $scope.defaultProjection, $scope.projection);
		}

		$scope.longitude = point.lon;
		$scope.latitude  = point.lat;
		$scope.latlon = point.lat + _separator() + point.lon;
		$scope.lonlat = point.lon + _separator() + point.lat;

		_applyPhase();
	};

	function _addMarker(point, opts)
	{
		opts 			 = opts || {};
		point.icon = map_marker;

		Map.addPoint(point, { layer: 'position' });

		if(opts.hasOwnProperty('center') && opts.center)
		{
			Map.setCenterMap(point, opts.zoom);
		}

		_updateValues(point);
	};

	$scope.goto = function(to)
	{
		$location.path(to);
	};

	$scope.dropMarker = function(point)
	{
		if (!point)
		{
			point = Map.getCenter();
		}

		_addMarker(point);
	};

	$scope.getPosition = function()
	{
		$scope.gettingPosition = true;

		Map.getPosition(function(point) {
			_addMarker(point, { center: true, zoom: 14 });
		}, function(errorMessage) {
			window.alert(errorMessage);
		}, function() {
			// always execute after success and error
			$scope.gettingPosition = false;
		});
	};

	$scope.updateValues = function()
	{
		_updateValues($scope.actualPoint);
	};

	$scope.searchPlace = function(query)
	{
		$scope.searchingPlaces = true;

		Map.searchPlace(query)
			.success(function(response) {
				$scope.places = response.results;
				$scope.searchingPlaces = false;
				_applyPhase();
			});
	};

	$scope.selectPlace = function(place)
	{
		$scope.places 		= [];
		$scope.queryPlace	= '';

		var point = {
			lon: place.geometry.location.lng,
			lat: place.geometry.location.lat
		};
		point = Map.transform(point, $scope.defaultProjection, 'EPSG:900913');

		_addMarker(point, { center: true, zoom: 13 });
		_applyPhase();
	};

	$scope.changeZoom = function(zoom)
	{
		Map.setZoom(zoom);
	};

	$scope.changeBaselayer = function(baselayer)
	{
		Map.setBaseLayer(baselayer);
	};

	$scope.onSelectPoint = function(feature)
	{
		var content = '<h4>' + feature.data.place + '<br>' + feature.data.temperatures + '</h4>';

		Map.showPopup({
			content:  content,
			position: feature.geometry
		});
	};

	_init();
};

angular
	.module('app.controllers')
	.controller('HomeCtrl', ['$scope', '$location', '$window', 'Map', HomeCtrl]);
