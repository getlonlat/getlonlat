/*
 * Home Controller
 */
function HomeCtrl($scope, $location, $window, Map)
{
	function _init()
	{
		Map.init({
			id: 'map',
			startZoom: 1,
			startPoint: { lon: -5875255.7412941, lat: -1059111.4637721 },
			onSelectPoint: $scope.onSelectPoint
		});

		angular.element($window).bind('resize', function() { Map.fixMapHeight(); });
	}

	function _applyPhase()
	{
		if(!$scope.$$phase) $scope.$apply();
	};

	$scope.goto = function(to)
	{
		$location.path(to);
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
