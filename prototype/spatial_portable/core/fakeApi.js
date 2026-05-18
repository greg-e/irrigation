import { FEATURE_TYPES } from "./contracts.js";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const seedByProperty = {
  "prop-002": [
    {
      id: "f-001",
      propertyId: "prop-002",
      assetId: "asset-z-1",
      type: FEATURE_TYPES.MARKER,
      name: "Valve Box A",
      geometry: { lat: 39.7393, lng: -104.9905 },
      modifiedAt: Date.now(),
    },
    {
      id: "f-002",
      propertyId: "prop-002",
      assetId: "asset-z-1",
      type: FEATURE_TYPES.POLYGON,
      name: "Zone 1 Boundary",
      geometry: {
        path: [
          { lat: 39.73936, lng: -104.99073 },
          { lat: 39.73952, lng: -104.99044 },
          { lat: 39.73924, lng: -104.99018 },
          { lat: 39.73908, lng: -104.99047 },
        ],
      },
      modifiedAt: Date.now(),
    },
    {
      id: "f-003",
      propertyId: "prop-002",
      assetId: "asset-pipe-main",
      type: FEATURE_TYPES.POLYLINE,
      name: "Main Lateral",
      geometry: {
        path: [
          { lat: 39.73945, lng: -104.99081 },
          { lat: 39.7393, lng: -104.99058 },
          { lat: 39.73916, lng: -104.99028 },
        ],
      },
      modifiedAt: Date.now(),
    },
  ],
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
    const autoFeatures = [];
    const activeAssets = assets.filter((asset) => asset.status !== "Retired");
    const byId = new Map(activeAssets.map((asset) => [asset.id, asset]));
    const childrenByParent = new Map();

    activeAssets.forEach((asset) => {
      const parentId = asset.parentId && byId.has(asset.parentId) ? asset.parentId : "ROOT";
      if (!childrenByParent.has(parentId)) {
        childrenByParent.set(parentId, []);
      }
      childrenByParent.get(parentId).push(asset);
    });

    function stableHash(value) {
      let hash = 0;
      const text = String(value || "");
      for (let i = 0; i < text.length; i += 1) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    }

    function offsetCoordinate(base, radius, angleRadians) {
      const lngScale = Math.cos((base.lat * Math.PI) / 180) || 1;
      return {
        lat: base.lat + Math.sin(angleRadians) * radius,
        lng: base.lng + (Math.cos(angleRadians) * radius) / lngScale,
      };
    }

    const fallbackOrigin = { lat: 33.91551710426391, lng: -84.51719913959514 };

    function rotateOffset(latOffset, lngOffset, angleRadians) {
      const sinA = Math.sin(angleRadians);
      const cosA = Math.cos(angleRadians);
      return {
        lat: latOffset * cosA - lngOffset * sinA,
        lng: latOffset * sinA + lngOffset * cosA,
      };
    }

    const placedById = new Map();

    const resolveCoordinate = (asset) => {
      if (!asset) return fallbackOrigin;
      if (placedById.has(asset.id)) {
        return placedById.get(asset.id);
      }
      return fallbackOrigin;
    };

    const mappedTypes = new Set(["System", "Controller", "Pump", "Backflow", "Zone", "Valve"]);

    const zoneById = new Map(activeAssets.filter((asset) => asset.type === "Zone").map((zone) => [zone.id, zone]));

    const controllerZones = new Map();
    activeAssets
      .filter((asset) => asset.type === "Zone" && asset.parentId)
      .forEach((zone) => {
        if (!controllerZones.has(zone.parentId)) {
          controllerZones.set(zone.parentId, []);
        }
        controllerZones.get(zone.parentId).push(zone);
      });

    function squarePolygon(center, size) {
      const lngScale = Math.cos((center.lat * Math.PI) / 180) || 1;
      const dLat = size;
      const dLng = size / lngScale;
      return {
        path: [
          { lat: center.lat + dLat, lng: center.lng - dLng },
          { lat: center.lat + dLat, lng: center.lng + dLng },
          { lat: center.lat - dLat, lng: center.lng + dLng },
          { lat: center.lat - dLat, lng: center.lng - dLng },
        ],
      };
    }

    function lineBetween(a, b) {
      return {
        path: [a, b],
      };
    }

    function radialOffset(base, radius, seed) {
      const angle = ((seed % 360) * Math.PI) / 180;
      const lngScale = Math.cos((base.lat * Math.PI) / 180) || 1;
      return {
        lat: base.lat + Math.sin(angle) * radius,
        lng: base.lng + (Math.cos(angle) * radius) / lngScale,
      };
    }

    const system = activeAssets.find((asset) => asset.type === "System") || null;
    const controllers = activeAssets
      .filter((asset) => asset.type === "Controller")
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const systemCoord = fallbackOrigin;
    if (system) {
      placedById.set(system.id, systemCoord);
    }

    // Place controllers as campus sectors around the system core.
    controllers.forEach((controller, idx) => {
      const angle = (-Math.PI / 2) + (idx * ((Math.PI * 2) / Math.max(controllers.length, 1)));
      const coord = offsetCoordinate(systemCoord, 0.0018, angle);
      placedById.set(controller.id, coord);
    });

    // Place zones in a rotated grid around each controller.
    controllers.forEach((controller, controllerIdx) => {
      const controllerCoord = resolveCoordinate(controller);
      const zones = (controllerZones.get(controller.id) || []).sort((a, b) => {
        const aZone = Number(a.zoneNumber || 0);
        const bZone = Number(b.zoneNumber || 0);
        return aZone - bZone;
      });

      const cols = 6;
      const spacing = 0.00026;
      const rotation = ((controllerIdx * 35) % 360) * (Math.PI / 180);

      zones.forEach((zone, zoneIdx) => {
        const row = Math.floor(zoneIdx / cols);
        const col = zoneIdx % cols;
        const rawLat = (row - 1.5) * spacing;
        const rawLng = (col - (cols - 1) / 2) * spacing;
        const rotated = rotateOffset(rawLat, rawLng, rotation);
        const lngScale = Math.cos((controllerCoord.lat * Math.PI) / 180) || 1;
        const zoneCoord = {
          lat: controllerCoord.lat + rotated.lat,
          lng: controllerCoord.lng + rotated.lng / lngScale,
        };
        placedById.set(zone.id, zoneCoord);
      });
    });

    // Place pumps/backflows near the system core.
    activeAssets
      .filter((asset) => asset.type === "Pump" || asset.type === "Backflow")
      .forEach((asset, idx) => {
        const coord = offsetCoordinate(systemCoord, 0.00035, (idx + 1) * 1.4);
        placedById.set(asset.id, coord);
      });

    // Place valves near their parent zones.
    activeAssets
      .filter((asset) => asset.type === "Valve")
      .forEach((asset) => {
        const parentZone = asset.parentId ? zoneById.get(asset.parentId) : null;
        const zoneCenter = parentZone ? resolveCoordinate(parentZone) : systemCoord;
        const valveCoord = radialOffset(zoneCenter, 0.00006, stableHash(asset.id));
        placedById.set(asset.id, valveCoord);
      });

    activeAssets.forEach((asset) => {
      if (!mappedTypes.has(asset.type)) return;
      const coord = resolveCoordinate(asset);

      if (asset.type === "Zone") {
        autoFeatures.push({
          id: `auto-zone-${asset.id}`,
          propertyId,
          assetId: asset.id,
          assetType: asset.type,
          assetName: asset.name,
          type: FEATURE_TYPES.POLYGON,
          name: `Zone Coverage: ${asset.name}`,
          geometry: squarePolygon(coord, 0.0001),
          isAuto: true,
          modifiedAt: Date.now(),
        });
        return;
      }

      autoFeatures.push({
        id: `auto-${asset.id}`,
        propertyId,
        assetId: asset.id,
        assetType: asset.type,
        assetName: asset.name,
        type: FEATURE_TYPES.MARKER,
        name: `${asset.type}: ${asset.name}`,
        geometry: coord,
        isAuto: true,
        modifiedAt: Date.now(),
      });
    });

    if (system && controllers.length) {
      const mainlinePath = [systemCoord, ...controllers.map((controller) => resolveCoordinate(controller))];
      autoFeatures.push({
        id: `auto-mainline-${propertyId}`,
        propertyId,
        assetId: system.id,
        assetType: "System",
        assetName: system.name,
        type: FEATURE_TYPES.POLYLINE,
        name: "Mainline Loop",
        geometry: { path: mainlinePath },
        isAuto: true,
        modifiedAt: Date.now(),
      });
    }

    controllers.forEach((controller) => {
      const zones = (controllerZones.get(controller.id) || []).sort((a, b) => {
        const aZone = Number(a.zoneNumber || 0);
        const bZone = Number(b.zoneNumber || 0);
        return aZone - bZone;
      });
      if (!zones.length) return;

      const path = [resolveCoordinate(controller), ...zones.map((zone) => resolveCoordinate(zone))];
      autoFeatures.push({
        id: `auto-feeder-${controller.id}`,
        propertyId,
        assetId: controller.id,
        assetType: "Controller",
        assetName: controller.name,
        type: FEATURE_TYPES.POLYLINE,
        name: `Feeder: ${controller.name}`,
        geometry: { path },
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
