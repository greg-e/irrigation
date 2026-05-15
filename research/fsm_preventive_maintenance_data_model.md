# Field Service Preventive Maintenance Data Model

Reference-only native FSM diagram. It explains the broader Salesforce maintenance object graph but is not part of the chosen irrigation implementation.

```mermaid
flowchart TD
    A[Account Property] --> SC[Service Contract]
    A --> AS[Asset Irrigation Component]
    SC --> CLI[Contract Line Item]
    SC --> MP[Maintenance Plan]
    MP --> MA[Maintenance Asset]
    AS --> MA
    CLI --> MA
    MP --> MWR[Maintenance Work Rule Optional]
    MA --> WO[Generated Work Order]
    MWR --> WO
    WO --> SA[Service Appointment]
    WO --> WOLI[Work Order Line Item]
    AS --> WO
    AS --> WOLI

    NOTE[Reference only\nNot in irrigation solution scope]:::note
    NOTE -.-> MP
    NOTE -.-> MA

    classDef note fill:#ffffff,stroke:#9e9e9e,stroke-dasharray: 4 4,color:#616161
```
