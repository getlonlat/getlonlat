/**
 * Map Service
 *
 * @package sabedeus.services
 */
function MapService($http)
{

	return {

		init: function(opts)
		{
			this.setup(opts);

			this.setCenterMap();
			this.fixMapHeight();
			this.bindEvents();
		},

		/**
   	* setup method
   	*/
	  setup: function(opts)
	  {
	    var self = this;

	    OpenLayers.Util.applyDefaults(opts, self.defaultOpts);

	    self._map = new OpenLayers.Map(opts.id, {
	    	theme: null,
	    	projection: 'EPSG:4326',
	    	displayProjection: 'EPSG:4326'
	    });

	    self._startZoom  = opts.startZoom;
	    self._startPoint = new OpenLayers.LonLat(opts.startPoint.lon, opts.startPoint.lat);

	    self._layers     = [];
	    self._baselayers = [];
	    self._controls   = [];

	    self.onSelectPoint = opts.onSelectPoint;

	    self.setupLayers();
	    self.setupControls();
	  },

	  /**
	   * setBaseLayer method
	   * @param {int} index base layer index
	   */
	  setBaseLayer: function(index)
	  {
	    this._map.setBaseLayer(this._map.layers[index]);
	  },

	  /**
	   * setBaseLayers method
	   */
	  setupLayers: function()
	  {
	    var self = this;

	    self._baselayer = {
				OSM: 				   0,
				GOOGLE_MAP:    1,
			};

			self._baselayers = [
				new OpenLayers.Layer.OSM('OpenStreetMap'),
				new OpenLayers.Layer.Google('Google Mapas')
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
			for(var key in self._layers)
			{
				self._map.addLayer(self._layers[key]);
			}
	  },

		/**
		* Retorna a lista de camadas mapa do mapa
		* @return {Array}
		*/
		getBaselayersList: function()
		{
			var self = this,
					arr = [];

			for (var key in self._baselayers)
			{
				arr.push(self._baselayers[key].name);
			};
			return arr;
		},

	  /**
		* Altera a baselayer atual a partir do indice de baselayers
		* @param {int} index
		* @return void
		*/
		setBaseLayer: function(index)
		{
			this._map.setBaseLayer(this._map.layers[index]);
		},

	  /**
	   * setControls method
	   */
	  setupControls: function()
	  {
	    var self = this;

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

	    for(var key in this._controls)
	    {
	      this._map.addControl(this._controls[key]);
	    }
	  },

	  /**
	   * setCenterMap method
	   * @param {OpenLayers.LonLat} point
	   * @param {int} zoom
	   */
	  setCenterMap: function(point, zoom, opts)
	  {
	  	var self = this,
	  			opts = opts || {},
	  			defaultOpts = {
	  			};

	  	if(point && !point.hasOwnProperty('CLASS_NAME') && point.CLASS_NAME !== 'OpenLayers.LonLat')
	  	{
	  		point = new OpenLayers.LonLat(point.lon, point.lat);
	  	}

	  	if(opts.hasOwnProperty('transformTo'))
	  	{
	  		point = point.transform(new OpenLayers.Projection(opts.transformTo), self._map.getProjection());
	  	}

	    self._map.setCenter(point || self._startPoint, zoom || self._startZoom);
	  },

		/**
		* Desenha um ponto no mapa
		* @param {Object} ponto simplificado
		* @param {Function} callback function
		*/
		addPoints: function(points, opts, callback)
		{
			var self = this,
					opts = opts || {},
					defaultOpts = {
						layer: 'position',
						clearBefore: true,
					},
					arrPontos    = [];

			OpenLayers.Util.applyDefaults(opts, defaultOpts);

			for(var key in points)
			{
				var label = points[key].hasOwnProperty('label') ? points[key].label : '';
				var pointOpts = {
					label: label,
					icon:  points[key].icon
				};

				var point = new OpenLayers.Geometry.Point(points[key].lon, points[key].lat);
				if (opts.hasOwnProperty('transformTo'))
				{
					point = point.transform(opts.transformTo, self._map.getProjection());
				};

				var feature = new OpenLayers.Feature.Vector(point, pointOpts);
				feature.data = points[key];

				arrPontos.push(feature);
			}

			if(opts.clearBefore)
			{
				self._layers[opts.layer].destroyFeatures();
			}

			self._layers[opts.layer].addFeatures(arrPontos);

			if(typeof(callback) == 'function')
			{
				callback();
			}
		},

		/**
		* Desenha um ponto no mapa
		* @param {Object} ponto simplificado
		* @param {Object} opcoes
		* @param {Function} callback function
		*/
		addPoint: function(point, opts, callback)
		{
			var self = this;
			self.addPoints([point], opts, callback);
		},

		/**
		* onSelectFeature
		* @private
		*/
		onSelectFeature: function(feature)
		{
			var self = this;
			if(feature.geometry.id.indexOf("Point") > -1)
			{
				self.onSelectPointFeature(feature);
			}
		},

		showPopup: function(opts)
		{
			var self = this,
					popup,
					defaultOpts = {
						type: 'Point'
					};

			OpenLayers.Util.applyDefaults(opts, defaultOpts);

			self.removePopups();

			popup = new OpenLayers.Popup('Popup ' + opts.type,
				new OpenLayers.LonLat(opts.position.x, opts.position.y),
				null,
				opts.content,
				true
			);
			popup.opacity = .9;

			self._map.addPopup(popup);
			popup.fixPadding();
			popup.updateSize();
		},

		/**
		 * removePopups method
		 */
		removePopups: function()
		{
			var self = this;
			for(var key in self._map.popups)
			{
				self._map.removePopup(self._map.popups[key]);
			}
		},

		/**
		* onSelectPointFeature
		* @private
		*/
		onSelectPointFeature: function(feature)
		{
			return feature;
		},

		onSelectPoint: function(callback)
		{
			var self = this;
			if(!callback) return;
			self.onSelectPointFeature = callback;
		},

	  getPosition: function(callbackSuccess, callbackFailed, callbackAlways)
	  {
	  	var self = this,
	  			point;

	  	if(!self._layers.hasOwnProperty('geolocate'))
	  	{
	  		self._layers.geolocate = new OpenLayers.Layer.Vector('Geolocate');
	      self._map.addLayer(self._layers.geolocate);
	  	}

	  	if (!self._controls.hasOwnProperty('geolocate'))
	  	{
	  		self._controls.geolocate = new OpenLayers.Control.Geolocate({
	        bind: false,
	        geolocationOption: {
	          enableHighAccuracy: true,
	          maximumAge: 0,
	          timeout: 10000
	        }
	      });

	      self._controls.geolocate.events.register('locationuncapable', this, function() {
	      	callbackAlways();
	      	callbackFailed('The device does not support Geolocation.');
	      });

	  		self._controls.geolocate.events.register('locationfailed', this, function(e) {
	  			callbackAlways();
	  			if(e.hasOwnProperty('error'))
	  			{
	  				var message = 'PositionError (Code ' + e.error.code + ')\n\n';
	  				message += e.error.message;

	  				callbackFailed(message);
	  			}
	  			else
	  			{
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
	  },

	  enableDragPoint: function(callback, opts)
	  {
	  	var self = this,
	  			point = {},
	  			opts  = opts || {},
	  			defaultOpts = {
	  			};

	  	OpenLayers.Util.applyDefaults(opts, defaultOpts);

	  	if(!self._controls.hasOwnProperty('dragPoint'))
	  	{
	  		self._controls.dragPoint = new OpenLayers.Control.DragFeature(self._layers.position, {
	  			hover: true,
	  			selectStyle: {
	  				cursor: 'pointer'
	  			},
	  			documentDrag: true
	  		});
	  		self._controls.dragPoint.onComplete = function(featurePoint, pxl)
	  		{
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
	  },

	  disableDragPoint: function()
	  {
	  	if(this._controls.hasOwnProperty('dragPoint'))
	  	{
	  		this._controls.dragPoint.deactivate();
	  		this._controls.selectPoint.activate();
	  	}
	  },

	  getCenter: function()
	  {
	  	var self = this;
	  	var center = self._map.getCenter();

	  	return {
	  		lon: center.lon,
	  		lat: center.lat
	  	};
	  },

		getActualZoom: function(callback)
		{
			var self = this;
			self._map.events.register('zoomend', self._map, function(e) {
        var zoom = self._map.getZoom();
        callback(zoom);
      });
		},

	  clearLayer: function(layer)
	  {
	  	if(this._layers.hasOwnProperty(layer))
	  	{
	  		this._layers[layer].removeFeatures(this._layers[layer].features);
	  	}
	  },

	  locationToXY: function(location)
		{
			location = location.substring(6);
			location = location.slice(0, -1);
			location = location.split(' ');
			location = {
				x: location[0],
				y: location[1]
			}

			return location;
		},

		/**
		* Converts a lonlat object from EPSG:4326 projection to xy object with EPSG:900913 projection.
		*
		* @param hash lonlat
		* return hash with x and y axis
		**/
		lonlat2xy: function(lonlat)
		{
			var self = this;
			var lonlat = new OpenLayers.LonLat(lonlat.lon, lonlat.lat);
			lonlat = lonlat.transform('EPSG:4326', 'EPSG:900913');

			// console.log('lonlat2xy lonlat: 	', lonlat.lon, lonlat.lat); console.log('lonlat2xy xy: 			', lonlat.lon, lonlat.lat);

			return {
				x: lonlat.lon,
				y: lonlat.lat
			};
		},

		/**
		* Converts a xy object from EPSG:900913 projection to lonlat object with EPSG:4326 projection.
		*
		* @param hash xy
		* return hash with lon and lat
		**/
		xy2lonlat: function(xy)
		{
			var self = this;
			var point = new OpenLayers.Geometry.Point(xy.x, xy.y);
			point = point.transform('EPSG:900913', 'EPSG:4326');

			// console.log('xy2lonlat(): xy:			', point.x, point.y); console.log('xy2lonlat(): lonlat:	', point.x, point.y);

			return {
				lon: point.x,
				lat: point.y
			};
		},

		/**
		 * Transform latlon hash from projection to anoter
		 *
		 * @param hash lonlat with lon and lat
		 * @param string from from projection
		 * @param string to to projection
		 *
		 * @return hash hash with lon and lat properties
		 */
		transform: function(lonlat, from, to)
		{
			var dest = new OpenLayers.LonLat(lonlat.lon, lonlat.lat);
			dest = dest.transform(from, to);
			return { lon: dest.lon, lat: dest.lat };
		},

		searchPlace: function(query)
		{
			return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
				params: {
					address: query,
					sensor: false
				}
			});
		},

		getPlaceInfo: function(lonlat)
		{
			return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
				params: {
					latlng: lonlat.lat + ',' + lonlat.lon,
					sensor: false
				}
			});
		},

		fixMapHeight: function()
		{
			var self   = this,
					height = window.innerHeight,
					element = self._map.div.id;

			height -=  106;
			element = document.getElementById(element);
			element.style.height = height + 'px';
			self._map.updateSize();
		},

		bindEvents: function()
		{
			var self = this;


		}
	};
}

angular
	.module('app.services')
	.service('Map', ['$http', MapService]);
