'use strict';
/**
 * Route Config
 */
function RouteConfig($routeProvider) {

	$routeProvider
		.when('/home', {
			controller:  'HomeController',
			templateUrl: '/app/components/home/home.html'
		})
		.otherwise({
			redirectTo: '/home'
		});
};

angular
	.module('app')
	.config(RouteConfig);
