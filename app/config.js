(function(angular, undefined) {
	'use strict';

	/**
	 * App Config
	 */
	angular
		.module('app')
		.config(AppConfig);

	function AppConfig($provide) {

		$provide.decorator("$exceptionHandler", function ($delegate) {
			return function (exception, cause) {
				$delegate(exception, cause);
				ga('send', 'event', 'AngularJS error', exception.message, exception.stack, 0, true);
			};
		});
	}

})(window.angular);
