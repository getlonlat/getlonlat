angular.module('app', [
	'ngRoute',
	'focusIt',

	'app.controllers',
	'app.directives',
	'app.services',
])
.config(['$provide', '$routeProvider', function($provide, $routeProvider) {
	$routeProvider
		.when('/home', {
			controller:  'HomeCtrl',
			templateUrl: '/app/views/home.html'
		})
		.otherwise({
			redirectTo: '/home'
		});

	$provide.decorator("$exceptionHandler", function ($delegate) {
		return function (exception, cause) {
			$delegate(exception, cause);
			ga('send', 'event', 'AngularJS error', exception.message, exception.stack, 0, true);
		};
	});
}]);
