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
    // Disabled by request: components must be placed manually.
    return [];
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
