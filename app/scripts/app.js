angular.module('app', [
	'ngRoute',
	'focusIt',

	'app.controllers',
	'app.directives',
	'app.services',
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
