import { FEATURE_TYPES } from "./contracts.js";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hashString(value) {
  const text = String(value || "");
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function typeOfAsset(asset) {
  return String(asset?.type || "").trim().toLowerCase();
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function hasLatLon(asset) {
  return toNumber(asset?.lat) != null && toNumber(asset?.lon) != null;
}

function pseudoLatLonFromMapXY(mapX, mapY, fallbackCenter) {
  const x = toNumber(mapX);
  const y = toNumber(mapY);
  if (x == null || y == null) return null;
  return {
    lat: fallbackCenter.lat + (50 - y) * 0.00042,
    lon: fallbackCenter.lon + (x - 50) * 0.00042,
  };
}

function polygonFromCenter(center, radiusLat, radiusLon, rotationRad = 0) {
  const points = [];
  for (let i = 0; i < 6; i += 1) {
    const theta = rotationRad + (Math.PI * 2 * i) / 6;
    points.push({
      lat: center.lat + radiusLat * Math.sin(theta),
      lng: center.lon + radiusLon * Math.cos(theta),
    });
  }
  return points;
}

const seedByProperty = {
  "prop-002": [],
};

export class SpatialFeatureApi {
  constructor() {
    this.store = deepClone(seedByProperty);
    this.assetsByProperty = {}; // Store asset hierarchies for auto-feature generation
  }

  // Register asset data for a property to enable auto-feature generation
  registerAssets(propertyId, assets) {
    this.assetsByProperty[propertyId] = deepClone(assets);
  }

  // Generate auto-features (markers) from assets with mapCoordinates
  _generateAutoFeatures(propertyId) {
    const assets = this.assetsByProperty[propertyId] || [];
    if (!Array.isArray(assets) || assets.length === 0) return [];

    const activeAssets = assets.filter(
      (asset) => String(asset?.status || "").toLowerCase() !== "retired"
    );
    if (!activeAssets.length) return [];

    const geoAsset = activeAssets.find((asset) => hasLatLon(asset));
    const fallbackCenter = geoAsset
      ? { lat: Number(geoAsset.lat), lon: Number(geoAsset.lon) }
      : { lat: 33.91551710426391, lon: -84.51719913959514 };

    const byId = new Map(activeAssets.map((asset) => [asset.id, asset]));
    const controllers = activeAssets.filter((asset) => typeOfAsset(asset) === "controller");
    const zones = activeAssets.filter((asset) => typeOfAsset(asset) === "zone");
    const controllerCenterById = new Map();

    const resolveControllerCenter = (controller, index) => {
      if (!controller) return fallbackCenter;

      if (hasLatLon(controller)) {
        return { lat: Number(controller.lat), lon: Number(controller.lon) };
      }

      const pseudo = pseudoLatLonFromMapXY(controller.mapX, controller.mapY, fallbackCenter);
      if (pseudo) return pseudo;

      const seed = hashString(controller.id || controller.name || index);
      const angle = ((seed % 360) * Math.PI) / 180;
      const ringRadius = 0.0011 + (index % 3) * 0.00035;
      return {
        lat: fallbackCenter.lat + Math.sin(angle) * ringRadius,
        lon: fallbackCenter.lon + Math.cos(angle) * ringRadius,
      };
    };

    controllers.forEach((controller, index) => {
      controllerCenterById.set(controller.id, resolveControllerCenter(controller, index));
    });

    const autoFeatures = [];

    controllers.forEach((controller, index) => {
      const center = controllerCenterById.get(controller.id) || fallbackCenter;
      autoFeatures.push({
        id: `auto-clock-${controller.id}`,
        propertyId,
        assetId: controller.id,
        assetType: controller.type,
        type: FEATURE_TYPES.MARKER,
        name: `${controller.name || `Clock ${index + 1}`} Clock`,
        geometry: { lat: center.lat, lng: center.lon },
        isAuto: true,
        modifiedAt: Date.now(),
      });
    });

    zones.forEach((zone, index) => {
      let center = null;

      if (hasLatLon(zone)) {
        center = { lat: Number(zone.lat), lon: Number(zone.lon) };
      }

      if (!center) {
        center = pseudoLatLonFromMapXY(zone.mapX, zone.mapY, fallbackCenter);
      }

      const parent = zone.parentId ? byId.get(zone.parentId) : null;
      const parentCenter = parent ? controllerCenterById.get(parent.id) : null;

      if (!center && parentCenter) {
        const zoneNumber = toNumber(zone.zoneNumber) ?? index + 1;
        const zoneSeed = hashString(zone.id || zone.name || zoneNumber);
        const angle = ((zoneSeed % 360) * Math.PI) / 180;
        const distance = 0.00042 + ((zoneNumber - 1) % 8) * 0.00006;
        center = {
          lat: parentCenter.lat + Math.sin(angle) * distance,
          lon: parentCenter.lon + Math.cos(angle) * distance,
        };
      }

      if (!center) {
        const zoneSeed = hashString(zone.id || zone.name || index);
        const angle = ((zoneSeed % 360) * Math.PI) / 180;
        const distance = 0.0018 + (index % 5) * 0.0002;
        center = {
          lat: fallbackCenter.lat + Math.sin(angle) * distance,
          lon: fallbackCenter.lon + Math.cos(angle) * distance,
        };
      }

      autoFeatures.push({
        id: `auto-zone-${zone.id}`,
        propertyId,
        assetId: zone.id,
        assetType: zone.type,
        type: FEATURE_TYPES.MARKER,
        name: zone.name || `Zone ${index + 1}`,
        geometry: { lat: center.lat, lng: center.lon },
        isAuto: true,
        modifiedAt: Date.now(),
      });
    });

    return autoFeatures;
  }

  async listFeatures(context) {
    await delay(220);
    const userFeatures = this.store[context.propertyId] || [];
    const autoFeatures = this._generateAutoFeatures(context.propertyId);
    
    // Combine auto-generated and user-created features
    // Auto-features first, then user features (so user-created ones can be on top)
    return deepClone([...autoFeatures, ...userFeatures]);
  }

  async upsertFeature(context, feature) {
    await delay(180);
    const next = {
      ...feature,
      propertyId: context.propertyId,
      modifiedAt: Date.now(),
    };

    if (!next.id) {
      next.id = `f-${Math.random().toString(36).slice(2, 9)}`;
    }

    if (!this.store[context.propertyId]) {
      this.store[context.propertyId] = [];
    }

    const idx = this.store[context.propertyId].findIndex((item) => item.id === next.id);
    if (idx >= 0) {
      this.store[context.propertyId][idx] = next;
    } else {
      this.store[context.propertyId].push(next);
    }

    return deepClone(next);
  }

  async deleteFeature(context, id) {
    await delay(140);
    const features = this.store[context.propertyId] || [];
    this.store[context.propertyId] = features.filter((item) => item.id !== id);
    return { success: true, id };
  }

  async replaceAll(context, features) {
    await delay(260);
    this.store[context.propertyId] = deepClone(features).map((item) => ({
      ...item,
      propertyId: context.propertyId,
      modifiedAt: Date.now(),
    }));
    return deepClone(this.store[context.propertyId]);
  }
}
