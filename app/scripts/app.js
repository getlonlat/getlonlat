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
		.otherwise({
			redirectTo: '/home'
		});
}]);
