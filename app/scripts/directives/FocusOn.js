
function focusOn(focus)
{
	return function(scope, elem, attr) {
		elem.on(attr.focusOn, function() {
			focus(attr.focusId);
		});

		scope.$on('$destroy', function() {
			elem.off(attr.focusOn);
		});
	}
};

angular
	.module('app.directives')
	.directive('focusOn', ['focus', focusOn]);
