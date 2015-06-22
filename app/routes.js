(function(angular, undefined) {
	'use strict';

	/**
	 * Route Config
	 */
	angular
		.module('app')
		.config(RouteConfig);

	function RouteConfig($routeProvider) {

		$routeProvider
			.when('/home', {
				controller:  'HomeController',
				templateUrl: '/app/components/home/home.html'
			})
			.otherwise({
				redirectTo: '/home'
			});
	}

})(window.angular);
