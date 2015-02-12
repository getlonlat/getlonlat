/**
 * Map Service
 *
 * @package sabedeus.services
 */
function MapService()
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
        projection: 'EPSG:4326'
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
				GOOGLE_MAP:    0,
			};

			self._baselayers = [
				new OpenLayers.Layer.Google('Google Mapas', {
					minZoomLevel: 5,
					maxZoomLevel: 19
				})
			];

			self._layers = {
				position: new OpenLayers.Layer.Vector('Position', {
					styleMap: new OpenLayers.StyleMap({
						'default': {
							externalGraphic: "${icon}",
							graphicWidth: 40
						}
					})
				}),
				points: new OpenLayers.Layer.Vector('Points', {
					styleMap: new OpenLayers.StyleMap({
						'default': {
							label: "${label}",
							labelYOffset: 27,
							fontSize: '16px',
							fontWeight: 'bold',
							externalGraphic: "${icon}",
							graphicWidth: 40
						},
						'select': {
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
        selectPoint: new OpenLayers.Control.SelectFeature([self._layers.points], {
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
	  		point = new OpenLayers.LonLat(point.x, point.y);
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
						layer: 'points',
						clearBefore: true,
					},
					arrPontos    = [];

			OpenLayers.Util.applyDefaults(opts, defaultOpts);

			for(var key in points)
			{
				var label = '';
				if(points[key].hasOwnProperty('price'))
				{
					label = 'R$ ' + points[key].price.replace('.', ',');
				}
				var pointOpts = {
					label: label,
					icon:  points[key].icon
				};

				var point = new OpenLayers.Geometry.Point(points[key].xy.x, points[key].xy.y);
				var trans = point.transform(new OpenLayers.Projection('EPSG:4326'), self._map.getProjection());

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
	          enableHighAccuracy: false,
	          maximumAge: 0,
	          timeout: 10000
	        }
	      });

	      self._controls.geolocate.events.register('locationuncapable', this, function() {
	      	callbackAlways();
	      	callbackFailed('O dispositivo não suporta Geolocalização.');
	      });

	  		self._controls.geolocate.events.register('locationfailed', this, function() {
					callbackAlways();
		      callbackFailed('Não foi possível obter sua localização.');
		    });

		    self._controls.geolocate.events.register('locationupdated', self._controls.geolocate, function(e) {
					callbackAlways();

					var lonlat = (e.point.clone()).transform(self._map.getProjection(), new OpenLayers.Projection('EPSG:4326'));
					var point = {
						x: e.point.x,
						y: e.point.y,
						lonlat: { lon: lonlat.x, lat: lonlat.y }
					};

		      callbackSuccess(point);
		    });

		    self._map.addControl(self._controls.geolocate);
	  		self._controls.geolocate.activate();
	  	}

	  	self._controls.geolocate.getCurrentLocation();
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
	.service('Map', [MapService]);
