# Irrigation Jobs To Be Done (JTBD)

Date: 2026-05-26  
Owner: BA  
Status: Job-story format inventory

These are underlying jobs, not requirements, features, or implementation choices.

## Core Functional Job

1. When I am responsible for irrigation service at a property, I want to assess current conditions and document what happened so I can keep the property operating as intended over time.

## Job Stories by Role

### Field Execution (Technician)

| Story ID | Job Story |
|---|---|
| FE-1 | When I arrive for an assigned visit, I want to understand what needs attention so I can start the work with confidence. |
| FE-2 | When I am on site, I want my next steps to be clear so I can move through the visit without hesitation. |
| FE-3 | When I find something during a visit, I want to capture it quickly so I can keep the visit moving. |
| FE-4 | When the placement of a finding matters, I want to capture where it occurred so I can describe the situation clearly later. |
| FE-5 | When connectivity is unreliable, I want to keep working so I can complete the visit without waiting. |
| FE-6 | When I return to unfinished work, I want to pick up where I left off so I do not repeat completed steps. |
| FE-7 | When a visit is at risk of being left incomplete, I want missing context surfaced so I can close it out properly. |
| FE-8 | When I complete corrective work during a visit, I want it documented so the record reflects what I did. |
| FE-9 | When I finish a visit, I want enough evidence recorded so I can stand behind the result. |
| FE-10 | When I complete a visit, I want routine completion separated from follow-up issues so I can tell what still needs action. |

### Follow-Up and Operations (AM / Branch)

| Story ID | Job Story |
|---|---|
| FO-1 | When unresolved work remains after a visit, I want it routed into the right follow-up path so it does not get lost. |
| FO-2 | When unresolved work remains, I want it visible so I can still finish the current operational cycle. |
| FO-3 | When I find a serious problem, I want it surfaced clearly so the right person can act on it. |
| FO-4 | When a visit is complete, I want a clear summary of what happened and what needs action so I can hand it off cleanly. |
| FO-5 | When I make a property decision, I want the full current state available so I can judge it accurately. |
| FO-6 | When conditions change, I want planned operations to stay aligned so the work remains relevant. |
| FO-7 | When I work a property over time, I want prior context carried forward so I avoid duplicate effort. |

### Governance and Quality

| Story ID | Job Story |
|---|---|
| GQ-1 | When teams work across regions, I want standards applied consistently so results are comparable. |
| GQ-2 | When content is ready for use, I want it reviewed and approved so I can trust it. |
| GQ-3 | When important changes happen, I want them traceable so I can audit what changed and why. |
| GQ-4 | When I review records, I want information to stay coherent so I can trust the history and make sound decisions. |
| GQ-5 | When I work with records and forms, I want them internally consistent so I do not have to reconcile conflicts. |
| GQ-6 | When people work in different contexts, I want the underlying job to remain intact so outcomes stay consistent. |

## Notes

1. This inventory intentionally avoids references to specific prototypes, object models, technologies, or implementation patterns.
2. Stories follow the job-story pattern: `When ...`, `I want to ...`, `so I can ...`.
3. Stories focus on stable outcomes and progress, not specific tools, data models, or UI behaviors.
4. Use this file as the JTBD source of truth; derive features and requirements from these jobs, not the other way around.