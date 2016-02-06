(function(angular, google, OpenLayers, undefined) {
	'use strict';

	/**
	 * Map Service
	 *
	 */
	angular
		.module('app')
		.service('Map', MapService);

	MapService.$inject = [];

	function MapService() {

		var self = this;

		/**
   	* setup
   	*/
	  function _setup(opts) {
	    OpenLayers.Util.applyDefaults(opts, {
	    });

	    self._map = new OpenLayers.Map(opts.id, {
	    	theme: null,
	    	projection: 'EPSG:4326',
	    	displayProjection: 'EPSG:4326'
	    });

	    self._startZoom  = opts.startZoom;
	    self._startLonlat = new OpenLayers.LonLat(opts.startLonlat.lon, opts.startLonlat.lat);

	    self._layers = [];
	    self._baselayers = [];
	    self._controls = [];

	    self.onSelectPoint = opts.onSelectPoint;

	    _setupLayers();
			_setupStyles();
	    _setupControls();
	  }

	  /**
	   * setBaseLayers method
	   */
	  function _setupLayers() {
	    self._baselayer = {
				OSM: 				   		 0,
				GOOGLE_MAP:    		 1,
				GOOGLE_MAP_NIGHT:  2,
				GOOGLE_MAP_HYBRID: 3
			};

			self._baselayers = [
				new OpenLayers.Layer.Google('Google Maps', {
					numZoomLevels: 19
				}),
				new OpenLayers.Layer.OSM('OpenStreetMap'),
				new OpenLayers.Layer.Google('Google Maps Night', {
					type: 'styled',
					numZoomLevels: 19
				}),
				new OpenLayers.Layer.Google('Google Maps Satellite', {
					numZoomLevels: 19,
					type: google.maps.MapTypeId.HYBRID
				})
			];

			self._layers = {
				position: new OpenLayers.Layer.Vector('Position', {
					styleMap: new OpenLayers.StyleMap({
						'default': {
							externalGraphic: "${icon}",
							graphicWidth: 40,
							cursor: 'pointer'
						}
					})
				})
			};

			self._map.addLayers(self._baselayers);
			for(var key in self._layers) {
				self._map.addLayer(self._layers[key]);
			}
	  }

	  function _setupStyles() {
	  	var styleNight = [{
				featureType: 'all',
				elementType: 'all',
					"stylers": [
			      { "invert_lightness": true },
			      { "visibility": "on" },
			      { "hue": "#00bbff" },
			      { "saturation": 1 }
			    ]
			}];
		 	var styledNightOptions = { name: 'Styled Map' };
		  var styledNightType = new google.maps.StyledMapType(styleNight, styledNightOptions);

			self._baselayers[self._baselayer.GOOGLE_MAP_NIGHT].mapObject.mapTypes.set('styled', styledNightType);
			self._baselayers[self._baselayer.GOOGLE_MAP_NIGHT].mapObject.setMapTypeId('styled');
	  }

	  function _setupControls() {
	    self._controls = {
	      zoom: new OpenLayers.Control.Zoom(),
	      nav: new OpenLayers.Control.Navigation({
          documentDrag: true,
          dragPanOptions: { enableKinetic: true }
        }),
        selectPoint: new OpenLayers.Control.SelectFeature([self._layers.position], {
        	autoActivate: true,
        	onSelect: self.onSelectPoint
        }),
	      mousePosition: new OpenLayers.Control.MousePosition()
	    };

	    for(var key in self._controls) {
	      self._map.addControl(self._controls[key]);
	    }
	  }

		this.init = function(opts) {
			_setup(opts);

			// self.fixMapHeight();
			self.setCenterMap();
		};

		this.getBaselayersList = function() {
			var arr = [];
			for (var key in self._baselayers) {
				arr.push(self._baselayers[key].name);
			}
			return arr;
		};

		this.setBaseLayer = function(index) {
			self._map.setBaseLayer(self._map.layers[index]);
		};

	  this.setCenterMap = function(point, zoom, opts) {
	  	opts = opts || {};

	  	if(point && !point.hasOwnProperty('CLASS_NAME') && point.CLASS_NAME !== 'OpenLayers.LonLat') {
	  		point = new OpenLayers.LonLat(point.lon, point.lat);
	  	}

	  	if(opts.hasOwnProperty('transformTo')) {
	  		point = point.transform(new OpenLayers.Projection(opts.transformTo), self._map.getProjection());
	  	}

	    self._map.setCenter(point || self._startLonlat, zoom || self._startZoom);
	  };

	  this.setZoom = function(zoom) {
	  	self._map.setCenter(null, zoom);
	  };

	  this.zoomIn = function() {
	  	self._map.zoomIn();
	  };

	  this.zoomOut = function() {
	  	self._map.zoomOut();
	  };

		this.addPoints = function(points, opts, callback) {
			var arrPontos = [];
			var defaultOpts = {
				layer: 'position',
				clearBefore: true,
			};
			opts = opts || {};

			OpenLayers.Util.applyDefaults(opts, defaultOpts);

			for(var key in points) {
				var label = points[key].hasOwnProperty('label') ? points[key].label : '';
				var pointOpts = {
					label: label,
					icon:  points[key].icon
				};

				var point = new OpenLayers.Geometry.Point(points[key].lon, points[key].lat);
				if (opts.hasOwnProperty('transformTo')) {
					point = point.transform(opts.transformTo, self._map.getProjection());
				}

				var feature = new OpenLayers.Feature.Vector(point, pointOpts);
				feature.data = points[key];

				arrPontos.push(feature);
			}

			if(opts.clearBefore) {
				self._layers[opts.layer].destroyFeatures();
			}

			self._layers[opts.layer].addFeatures(arrPontos);

			if(typeof(callback) === 'function') callback();
		};

		this.addPoint = function(point, opts, callback) {
			self.addPoints([point], opts, callback);
		};

		this.showPopup = function(lonlat, content, opts) {
			var popup = null;
			var defaultOpts = {
				clear: true,
				type: 'Point'
			};
			opts = opts || {};

			OpenLayers.Util.applyDefaults(opts, defaultOpts);

			popup = new OpenLayers.Popup('Popup ' + opts.type,
				new OpenLayers.LonLat(lonlat.lon, lonlat.lat),
				null,
				content,
				true
			);
			popup.opacity = '.9';

			if (opts.hasOwnProperty('clear') && opts.clear) {
				self.removePopups();
			}

			self._map.addPopup(popup);

			popup.fixPadding();
			popup.updateSize();
		};

		this.removePopups = function() {
			for(var key in self._map.popups) {
				self._map.removePopup(self._map.popups[key]);
			}
		};

	  this.getPosition = function(callbackSuccess, callbackFailed, callbackAlways) {
	  	if(!self._layers.hasOwnProperty('geolocate')) {
	  		self._layers.geolocate = new OpenLayers.Layer.Vector('Geolocate');
	      self._map.addLayer(self._layers.geolocate);
	  	}

	  	if (!self._controls.hasOwnProperty('geolocate')) {
	  		self._controls.geolocate = new OpenLayers.Control.Geolocate({
	        bind: false,
	        geolocationOption: {
	          enableHighAccuracy: true,
	          maximumAge: 0,
	          timeout: 10000
	        }
	      });

	      self._controls.geolocate.events.register('locationuncapable', self, function() {
	      	callbackAlways();
	      	callbackFailed('The device does not support Geolocation.');
	      });

	  		self._controls.geolocate.events.register('locationfailed', self, function(e) {
	  			callbackAlways();
	  			if(e.hasOwnProperty('error')) {
	  				var message = 'PositionError (Code ' + e.error.code + ')\n\n';
	  				message += e.error.message;

	  				callbackFailed(message);
	  			} else {
		      	callbackFailed('Failed to get your position.');
	  			}
		    });

		    self._controls.geolocate.events.register('locationupdated', self._controls.geolocate, function(e) {
					callbackAlways();

					var lonlat = {
						lon: e.point.x,
						lat: e.point.y
					};

		      callbackSuccess(lonlat);
		    });

		    self._map.addControl(self._controls.geolocate);
	  		self._controls.geolocate.activate();
	  	}

	  	self._controls.geolocate.getCurrentLocation();
	  };

	  this.enableDragPoint = function(callback, opts) {
	  	var point = {};
	  	var defaultOpts = {};

	 		opts  = opts || {};
	  	OpenLayers.Util.applyDefaults(opts, defaultOpts);

	  	if(!self._controls.hasOwnProperty('dragPoint')) {
	  		self._controls.dragPoint = new OpenLayers.Control.DragFeature(self._layers.position, {
	  			hover: true,
	  			selectStyle: {
	  				cursor: 'pointer'
	  			},
	  			documentDrag: true
	  		});

	  		self._controls.dragPoint.onComplete = function(featurePoint, pxl) {
	  			point = {
	  				lon: featurePoint.geometry.x,
	  				lat: featurePoint.geometry.y
	  			};

	  			self._layers.position.addFeatures([featurePoint]);

	  			callback(point);
	  		};

	  		self._map.addControl(self._controls.dragPoint);
	  	}

	  	self._controls.dragPoint.activate();
	  };

	  this.disableDragPoint = function() {
	  	if(self._controls.hasOwnProperty('dragPoint')) {
	  		self._controls.dragPoint.deactivate();
	  		self._controls.selectPoint.activate();
	  	}
	  };

	  this.getCenter = function() {
	  	var center = self._map.getCenter();
	  	return {
	  		lon: center.lon,
	  		lat: center.lat
	  	};
	  };

		this.getActualZoom = function(callback) {
			self._map.events.register('zoomend', self._map, function(e) {
        var zoom = self._map.getZoom();
        callback(zoom);
      });
		};

	  this.clearLayer = function(layer) {
	  	if(self._layers.hasOwnProperty(layer)) {
	  		self._layers[layer].removeFeatures(self._layers[layer].features);
	  	}
	  };

		this.transform = function(lonlat, from, to) {
			var dest = new OpenLayers.LonLat(lonlat.lon, lonlat.lat);
			dest = dest.transform(from, to);
			return { lon: dest.lon, lat: dest.lat };
		};

		this.fixMapHeight = function() {
			var height = window.innerHeight;
			var element = self._map.div.id;

			if(element) {
				height -=  406;
				element = document.getElementById(element);
				element.style.height = height + 'px';
				self._map.updateSize();
			}
		};
	}

})(window.angular, window.google, window.OpenLayers);
