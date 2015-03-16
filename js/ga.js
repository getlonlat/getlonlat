(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-42715915-3', 'auto');
ga('send', 'pageview');

window.addEventListener('error', function(err) {
	var lineAndColumnInfo = err.colno ? ' line: ' + err.lineno + ', column:' + err.colno : ' line:' + err.lineno;
	ga('send', 'event', 'JavaScript Error', err.message, err.filename + lineAndColumnInfo + '->' + navigator.userAgent, 0, true);
});
