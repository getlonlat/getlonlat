angular.module('app', [
	'ngRoute',

	'app.controllers',
	'app.directives',
	'app.services',
	'app.factories',
])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/home', {
			controller:  'HomeCtrl',
			templateUrl: '/app/views/home.html'
		})
		.when('/about', {
			controller:  'AboutCtrl',
			templateUrl: '/app/views/about.html'
		})
		.otherwise({
			redirectTo: '/home'
		});
}]);
