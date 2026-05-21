import { FEATURE_TYPES, TOOL_MODES } from "./contracts.js";

function toLatLngLiteral(latLng) {
  return { lat: latLng.lat(), lng: latLng.lng() };
}

function pathToArray(path) {
  const points = [];
  for (let i = 0; i < path.getLength(); i += 1) {
    points.push(toLatLngLiteral(path.getAt(i)));
  }
  return points;
}

function ensureGoogleMapsLoaded(apiKey) {
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  if (!apiKey) {
    return Promise.reject(new Error("Missing Google Maps API key in config.local.js"));
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=drawing`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script."));
    document.head.appendChild(script);
  });
}

export class GoogleMapAdapter {
  constructor(rootEl, options) {
    this.rootEl = rootEl;
    this.options = options;
    this.map = null;
    this.drawingManager = null;
    this.overlaysById = new Map();
    this.onFeatureCreated = null;
    this.onFeatureChanged = null;
    this.onFeatureSelected = null;
    this.selectedFeatureId = null;
    this.resizeObserver = null;
    this.onWindowResize = null;
  }

  async init() {
    await ensureGoogleMapsLoaded(this.options.apiKey);

    this.map = new google.maps.Map(this.rootEl, {
      center: this.options.center,
      zoom: this.options.zoom,
      mapTypeId: "satellite",
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: true,
    });

    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      markerOptions: { draggable: false },
      polylineOptions: {
        clickable: true,
        editable: false,
        strokeColor: "#0b5cab",
        strokeOpacity: 0.9,
        strokeWeight: 3,
      },
      polygonOptions: {
        clickable: true,
        editable: false,
        fillColor: "#0b5cab",
        fillOpacity: 0.2,
        strokeColor: "#0b5cab",
        strokeWeight: 2,
      },
    });

    this.drawingManager.setMap(this.map);

    google.maps.event.addListener(this.drawingManager, "overlaycomplete", (event) => {
      this.drawingManager.setDrawingMode(null);
      const feature = this.overlayToFeature(event.overlay, event.type);
      if (this.onFeatureCreated) {
        this.onFeatureCreated(feature, event.overlay);
      }
    });

    this.attachResizeHandling();
    this.syncMapSize();
  }

  attachResizeHandling() {
    if (this.resizeObserver || !this.rootEl) return;

    this.onWindowResize = () => this.syncMapSize();
    window.addEventListener("resize", this.onWindowResize);

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.syncMapSize());
      this.resizeObserver.observe(this.rootEl);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.syncMapSize());
    });
  }

  syncMapSize() {
    if (!this.map || !this.rootEl || !window.google?.maps) return;

    const center = this.map.getCenter();
    google.maps.event.trigger(this.map, "resize");
    if (center) {
      this.map.setCenter(center);
    }
  }

  setMode(mode) {
    if (!this.drawingManager) return;

    if (mode === TOOL_MODES.SELECT) {
      this.drawingManager.setDrawingMode(null);
      return;
    }

    if (mode === TOOL_MODES.MARKER) {
      this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
      return;
    }

    if (mode === TOOL_MODES.POLYLINE) {
      this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
      return;
    }

    if (mode === TOOL_MODES.POLYGON) {
      this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  }

  clear() {
    this.overlaysById.forEach((overlay) => {
      overlay.setMap(null);
    });
    this.overlaysById.clear();
    this.selectedFeatureId = null;
  }

  renderFeatures(features) {
    this.clear();
    features.forEach((feature) => {
      this.addFeature(feature);
    });
  }

  addFeature(feature, prebuiltOverlay) {
    const overlay = prebuiltOverlay || this.createOverlay(feature);
    if (!overlay) {
      return;
    }
    overlay.__featureId = feature.id;
    overlay.__readOnly = Boolean(feature.isAuto);

    overlay.addListener("click", () => {
      this.selectFeature(feature.id);
      if (this.onFeatureSelected) this.onFeatureSelected(feature.id);
    });

    if (feature.type === FEATURE_TYPES.MARKER) {
      overlay.addListener("dragend", () => {
        if (this.onFeatureChanged) {
          this.onFeatureChanged(feature.id, this.overlayGeometry(overlay, feature.type));
        }
      });
    } else {
      const path = feature.type === FEATURE_TYPES.POLYGON ? overlay.getPath() : overlay.getPath();
      path.addListener("set_at", () => {
        if (this.onFeatureChanged) {
          this.onFeatureChanged(feature.id, this.overlayGeometry(overlay, feature.type));
        }
      });
      path.addListener("insert_at", () => {
        if (this.onFeatureChanged) {
          this.onFeatureChanged(feature.id, this.overlayGeometry(overlay, feature.type));
        }
      });
      path.addListener("remove_at", () => {
        if (this.onFeatureChanged) {
          this.onFeatureChanged(feature.id, this.overlayGeometry(overlay, feature.type));
        }
      });
    }

    this.overlaysById.set(feature.id, overlay);
    overlay.setMap(this.map);
  }

  selectFeature(featureId) {
    this.selectedFeatureId = featureId;

    this.overlaysById.forEach((overlay, id) => {
      const selected = id === featureId;
      const editable = selected && !overlay.__readOnly;
      if (overlay instanceof google.maps.Marker) {
        overlay.setDraggable(editable);
        overlay.setAnimation(selected ? google.maps.Animation.BOUNCE : null);
        if (selected) {
          setTimeout(() => overlay.setAnimation(null), 700);
        }
      } else {
        overlay.setEditable(editable);
        overlay.setOptions({
          strokeColor: selected ? "#b42318" : "#0b5cab",
          fillColor: selected ? "#b42318" : "#0b5cab",
        });
      }
    });
  }

  removeFeature(featureId) {
    const overlay = this.overlaysById.get(featureId);
    if (!overlay) return;
    overlay.setMap(null);
    this.overlaysById.delete(featureId);
    if (this.selectedFeatureId === featureId) {
      this.selectedFeatureId = null;
    }
  }

  createOverlay(feature) {
    if (feature.type === FEATURE_TYPES.MARKER) {
      // Skip rendering lat/lon auto-markers — locations already visible on map
      if (feature.isLatLon) {
        return null;
      }
      const isClockSimulation =
        feature.isAuto && String(feature.assetType || "").toLowerCase() === "controller";
      const markerOpts = {
        position: feature.geometry,
        draggable: false,
        title: feature.name || "Simulated clock",
      };
      if (isClockSimulation) {
        markerOpts.label = {
          text: "C",
          color: "#0f1419",
          fontWeight: "700",
          fontSize: "11px",
        };
        markerOpts.icon = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#f9a826",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 10,
        };
      }
      return new google.maps.Marker(markerOpts);
    }

    if (feature.type === FEATURE_TYPES.POLYLINE) {
      return new google.maps.Polyline({
        path: feature.geometry.path,
        editable: false,
        strokeColor: "#0b5cab",
        strokeOpacity: 0.9,
        strokeWeight: 3,
      });
    }

    return new google.maps.Polygon({
      path: feature.geometry.path,
      editable: false,
      fillColor: "#0b5cab",
      fillOpacity: 0.2,
      strokeColor: "#0b5cab",
      strokeWeight: 2,
    });
  }

  overlayToFeature(overlay, rawType) {
    if (rawType === google.maps.drawing.OverlayType.MARKER) {
      return {
        type: FEATURE_TYPES.MARKER,
        geometry: toLatLngLiteral(overlay.getPosition()),
      };
    }

    if (rawType === google.maps.drawing.OverlayType.POLYLINE) {
      return {
        type: FEATURE_TYPES.POLYLINE,
        geometry: { path: pathToArray(overlay.getPath()) },
      };
    }

    return {
      type: FEATURE_TYPES.POLYGON,
      geometry: { path: pathToArray(overlay.getPath()) },
    };
  }

  overlayGeometry(overlay, featureType) {
    if (featureType === FEATURE_TYPES.MARKER) {
      return toLatLngLiteral(overlay.getPosition());
    }

    return { path: pathToArray(overlay.getPath()) };
  }
}
