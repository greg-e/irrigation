export const FEATURE_TYPES = {
  MARKER: "marker",
  POLYLINE: "polyline",
  POLYGON: "polygon",
};

export const TOOL_MODES = {
  SELECT: "select",
  MARKER: FEATURE_TYPES.MARKER,
  POLYLINE: FEATURE_TYPES.POLYLINE,
  POLYGON: FEATURE_TYPES.POLYGON,
};

export const DEFAULT_CONTEXT = {
  propertyId: "prop-002",
  assetId: "",
  workOrderId: "",
  mode: "manager",
};

export function parseContextFromUrl(search = window.location.search) {
  const params = new URLSearchParams(search);
  return {
    propertyId: params.get("propertyId") || DEFAULT_CONTEXT.propertyId,
    assetId: params.get("assetId") || DEFAULT_CONTEXT.assetId,
    workOrderId: params.get("workOrderId") || DEFAULT_CONTEXT.workOrderId,
    mode: params.get("mode") || DEFAULT_CONTEXT.mode,
  };
}

export function featureTypeLabel(type) {
  if (type === FEATURE_TYPES.MARKER) return "Point";
  if (type === FEATURE_TYPES.POLYLINE) return "Line";
  if (type === FEATURE_TYPES.POLYGON) return "Polygon";
  return type;
}

export function newFeatureName(type, count) {
  return `${featureTypeLabel(type)} ${count + 1}`;
}
