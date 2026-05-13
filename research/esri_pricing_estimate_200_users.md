# Esri Pricing Estimate — 200 User Scenario

Status: Draft v1
Date: 2026-05-12

## Summary

Esri does not publicly publish straightforward dollar list pricing for ArcGIS Online user types on the main buy pages; public pages focus on capability matrices and route buyers to sales contact.

For planning purposes only, a market-observed estimate can be used until a formal quote is obtained.

## Publicly Verifiable Facts

1. ArcGIS Online pricing is structured by user type (Creator, Professional, Professional Plus, Mobile Worker, Contributor, Viewer).
2. Credits are included by user type and consumed for storage/analysis/premium services.
3. Esri points buyers to sales for finalized pricing.

Confidence: High

## Non-Public / Market-Observed Planning Estimates (Not Official Esri List)

| User Type | Planning Estimate (USD/user/year) |
|---|---|
| Creator | ~$500 |
| Mobile Worker | ~$250 |
| Viewer | ~$100 |

Confidence: Medium-Low (industry-observed ranges, not current official Esri list pricing)

## Example Budget Model for 200 Users

Assumed mix for irrigation operations:
- 10 Creator users (admins/supervisors)
- 150 Mobile Worker users (field techs)
- 40 Viewer users (office/management)

Estimated annual cost:
- Creator: 10 x $500 = $5,000
- Mobile Worker: 150 x $250 = $37,500
- Viewer: 40 x $100 = $4,000
- Total: $46,500/year

Formula:

Total = (Creator_count x Creator_price) + (MobileWorker_count x MobileWorker_price) + (Viewer_count x Viewer_price)

## Commercial Notes for This Project

1. Because ArcGIS Maps for Salesforce is now GA, pricing may be negotiated differently under a Salesforce + Esri partnership/bundle.
2. At 200 users, negotiated pricing can be materially below planning estimates depending on term length, industry program eligibility, and bundle structure.
3. Credits overage (storage/geocoding/analysis) can materially change total cost; include a credits contingency in budget scenarios.

## Recommended Next Step

Request a formal quote from Esri with three scenarios:
1. Base: ArcGIS Online user types only
2. Integrated: ArcGIS Maps for Salesforce + ArcGIS Online bundle
3. Mobile-heavy: higher Mobile Worker count with offline-heavy use assumptions

## Sources

- Esri ArcGIS Online buy/pricing page: https://www.esri.com/en-us/arcgis/products/arcgis-online/buy
- Esri store ArcGIS Online pricing entry point: https://www.esri.com/en-us/store/arcgis-online
- ArcGIS Enterprise pricing entry point: https://www.esri.com/en-us/arcgis/products/arcgis-enterprise/pricing
