import { FEATURE_TYPES, TOOL_MODES } from "./contracts.js";

const DEFAULT_POLYLINE_STROKE = "#0b5cab";
const DEFAULT_POLYGON_FILL = "#d9ff00";
const DEFAULT_POLYGON_STROKE = "#334400";
const DEFAULT_POLYGON_FILL_OPACITY = 0.52;

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

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function markerGlyphForAssetType(assetType) {
  const typeKey = String(assetType || "").trim().toLowerCase();
  const glyphByType = {
    system: "S",
    source: "So",
    backflow: "B",
    controller: "C",
    zone: "Z",
    pump: "P",
    valve: "V",
    head: "H",
    drip: "D",
  };
  return glyphByType[typeKey] || "M";
}

function markerPaletteForAssetType(assetType) {
  const typeKey = String(assetType || "").trim().toLowerCase();
  const paletteByType = {
    system: { fill: "#334155", stroke: "#ffffff", text: "#f8fafc" },
    source: { fill: "#0284c7", stroke: "#ffffff", text: "#f8fafc" },
    backflow: { fill: "#2563eb", stroke: "#ffffff", text: "#f8fafc" },
    controller: { fill: "#f59e0b", stroke: "#ffffff", text: "#111827" },
    zone: { fill: "#16a34a", stroke: "#ffffff", text: "#f8fafc" },
    pump: { fill: "#0d9488", stroke: "#ffffff", text: "#f8fafc" },
    valve: { fill: "#f97316", stroke: "#ffffff", text: "#111827" },
    head: { fill: "#475569", stroke: "#ffffff", text: "#f8fafc" },
    drip: { fill: "#0891b2", stroke: "#ffffff", text: "#f8fafc" },
  };
  return paletteByType[typeKey] || { fill: "#6b7280", stroke: "#ffffff", text: "#f8fafc" };
}

function applyStatusMarkerPalette(basePalette, assetStatus) {
  const status = normalizeStatus(assetStatus);

  if (["alert", "critical", "fault", "offline", "failed"].includes(status)) {
    return { fill: "#dc2626", stroke: "#fee2e2", text: "#ffffff" };
  }

  if (["maintenance", "pending", "warning"].includes(status)) {
    return { fill: "#d97706", stroke: "#fef3c7", text: "#111827" };
  }

  if (["retired", "inactive", "disabled"].includes(status)) {
    return { fill: "#64748b", stroke: "#cbd5e1", text: "#f8fafc" };
  }

  return basePalette;
}

function buildMarkerOptions(feature) {
  const typeLabel = markerGlyphForAssetType(feature.assetType);
  const basePalette = markerPaletteForAssetType(feature.assetType);
  const palette = applyStatusMarkerPalette(basePalette, feature.assetStatus);
  const statusText = feature.assetStatus ? ` (${feature.assetStatus})` : "";

  return {
    position: feature.geometry,
    draggable: false,
    title: `${feature.name || "Component marker"}${statusText}`,
    label: {
      text: typeLabel,
      color: palette.text,
      fontWeight: "800",
      fontSize: typeLabel.length > 1 ? "10px" : "11px",
    },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: palette.fill,
      fillOpacity: 0.96,
      strokeColor: palette.stroke,
      strokeWeight: 2,
      scale: 11,
    },
  };
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
    this.onMapBackgroundClick = null;
    this.selectedFeatureId = null;
    this.suppressNextMapClick = false;
    this.resizeObserver = null;
    this.onWindowResize = null;
  }

  async init() {
    await ensureGoogleMapsLoaded(this.options.apiKey);
    const hideMapUiControls = Boolean(this.options.hideMapUiControls);

    this.map = new google.maps.Map(this.rootEl, {
      center: this.options.center,
      zoom: this.options.zoom,
      mapTypeId: "satellite",
      disableDefaultUI: hideMapUiControls,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: !hideMapUiControls,
      zoomControl: !hideMapUiControls,
    });

    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      markerOptions: { draggable: false },
      polylineOptions: {
        clickable: true,
        editable: false,
        strokeColor: DEFAULT_POLYLINE_STROKE,
        strokeOpacity: 0.9,
        strokeWeight: 4,
      },
      polygonOptions: {
        clickable: true,
        editable: false,
        fillColor: DEFAULT_POLYGON_FILL,
        fillOpacity: DEFAULT_POLYGON_FILL_OPACITY,
        strokeColor: DEFAULT_POLYGON_STROKE,
        strokeWeight: 3,
      },
    });

    this.drawingManager.setMap(this.map);

    this.map.addListener("click", () => {
      if (this.suppressNextMapClick) {
        this.suppressNextMapClick = false;
        return;
      }

      // Ignore base-map deselect clicks while actively drawing.
      if (this.drawingManager?.getDrawingMode()) {
        return;
      }

      this.selectFeature(null);
      if (this.onMapBackgroundClick) {
        this.onMapBackgroundClick();
      }
    });

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
    overlay.__isAuto = Boolean(feature.isAuto);
    const allowFeatureEditing = this.options?.allowFeatureEditing !== false;
    const allowAutoFeatureEditing = Boolean(this.options?.allowAutoFeatureEditing);
    overlay.__autoReadOnly = Boolean(feature.isAuto && !allowAutoFeatureEditing);
    overlay.__readOnly = !allowFeatureEditing || overlay.__autoReadOnly;

    overlay.addListener("click", () => {
      this.suppressNextMapClick = true;
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

  setFeatureEditingEnabled(enabled, allowAutoFeatureEditing) {
    const nextOptions = { ...(this.options || {}), allowFeatureEditing: Boolean(enabled) };
    if (typeof allowAutoFeatureEditing === "boolean") {
      nextOptions.allowAutoFeatureEditing = allowAutoFeatureEditing;
    }
    this.options = nextOptions;

    if (this.drawingManager && !enabled) {
      this.drawingManager.setDrawingMode(null);
    }

    this.overlaysById.forEach((overlay) => {
      const autoReadOnly = Boolean(overlay.__isAuto && !this.options.allowAutoFeatureEditing);
      overlay.__autoReadOnly = autoReadOnly;
      overlay.__readOnly = !enabled || autoReadOnly;

      if (overlay instanceof google.maps.Marker) {
        overlay.setDraggable(false);
      } else if (overlay.setEditable) {
        overlay.setEditable(false);
      }
    });

    if (this.selectedFeatureId) {
      this.selectFeature(this.selectedFeatureId);
    }
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
        if (overlay instanceof google.maps.Polygon) {
          overlay.setOptions({
            strokeColor: selected ? "#b42318" : DEFAULT_POLYGON_STROKE,
            fillColor: selected ? "#b42318" : DEFAULT_POLYGON_FILL,
            fillOpacity: DEFAULT_POLYGON_FILL_OPACITY,
          });
        } else {
          overlay.setOptions({
            strokeColor: selected ? "#b42318" : DEFAULT_POLYLINE_STROKE,
          });
        }
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
      return new google.maps.Marker(buildMarkerOptions(feature));
    }

    if (feature.type === FEATURE_TYPES.POLYLINE) {
      return new google.maps.Polyline({
        path: feature.geometry.path,
        editable: false,
        strokeColor: DEFAULT_POLYLINE_STROKE,
        strokeOpacity: 0.9,
        strokeWeight: 3,
      });
    }

    return new google.maps.Polygon({
      path: feature.geometry.path,
      editable: false,
      fillColor: DEFAULT_POLYGON_FILL,
      fillOpacity: DEFAULT_POLYGON_FILL_OPACITY,
      strokeColor: DEFAULT_POLYGON_STROKE,
      strokeWeight: 4,
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
