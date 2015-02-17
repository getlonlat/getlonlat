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
		$scope.latitude  = 0;
		$scope.longitude = 0;
		$scope.separator  = 'comma';
		$scope.projection = 'EPSG:4326';
		$scope.defaultProjection = 'EPSG:4326';

		Map.init({
			id: 'map',
			startZoom: 1,
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
		var point = Map.xy2lonlat({ x: point.lon, y: point.lat });

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

	function _addMarker(point)
	{
		point.icon = map_marker;
		Map.addPoint(point, {
			layer: 'position'
		});

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
	},

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
