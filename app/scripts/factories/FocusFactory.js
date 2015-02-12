function FocusFactory($timeout)
{
	return function(id)
	{
		$timeout(function() {
			var element = document.getElementById(id);
			if(element) element.focus();
		});
	};
};

angular
	.module('app.factories')
	.factory('focus', ['$timeout', FocusFactory]);
