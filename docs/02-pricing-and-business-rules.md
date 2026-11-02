# 2. Approved Pricing and Business Rules

All values are Nigerian naira.

## Home cleaning
| Property | Monthly package | Individual visit |
|---|---:|---:|
| 1 bedroom | ₦25,000 | ₦7,000 |
| 2 bedrooms | ₦30,000 | ₦8,000 |
| 3 bedrooms | ₦35,000 | ₦10,000 |
| 4 bedrooms | ₦45,000 | ₦15,000 |

- Monthly packages include four visits per month.
- Deep cleaning and heavily soiled spaces may attract extra charges.
- Additional work outside the agreed scope may be quoted separately.
- Final price is confirmed after property and scope assessment.
- The monthly package is a package price, not the single-visit price multiplied by four.

## Laundry
| Item | Price |
|---|---:|
| Trousers and shirt | ₦1,000 |
| Native wears | ₦1,500 |
| Agbada (complete set) | ₦3,000 |
| Bedspread | ₦1,500 |
| Duvets | From ₦3,500 |

- Prices are item-based, not weight-based.
- Native wear is treated as one item/set at ₦1,500 under the supplied list.
- Duvet final price is confirmed by staff based on size/type.
- Special stain treatment and delicate garments may attract additional charges, subject to customer approval.
- Pickup and delivery are advertised as 100% free; staff confirms address/service-area eligibility.
- Garments must be identified and sorted before processing.

## Fumigation
Fumigation is a listed service, but no price has been supplied. Display “Request a quotation” only until the business approves rates.

## Cleaning materials
Customer may provide materials (labour-only service), or ask SkyTouchClean to provide them for an additional agreed quotation. Never silently add a materials fee.

## Price calculation
- Store money as integer kobo (₦1,000 = 100000 kobo).
- Backend loads prices from MongoDB.
- Never trust browser-submitted unit prices, totals or discounts.
- Save item name and unit-price snapshots on each order so future catalogue changes do not alter old orders.
- Extra charges require a reason and customer approval.
