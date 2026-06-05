# Forces of Progress Analysis - Irrigation FSM

Date: 2026-05-26  
Framework: Jobs to be Done - Forces of Progress  
Analysis Scope: Core Functional Job + 23 job stories from JTBD.md

## 1. Alignment Baseline

This analysis is aligned to requirements/JTBD/JTBD.md and follows JTBD best-practice constraints:

1. Focus on stable customer progress, not features or tools.
2. Keep language solution-agnostic.
3. Separate job executor and non-executor roles.
4. Analyze forces as adoption dynamics, not backlog requirements.

## 2. Core Functional Job Forces

Core Functional Job:
When I am responsible for irrigation service at a property, I want to assess current conditions and document what happened so I can keep the property operating as intended over time.

Push of the Situation:
1. Service quality and property condition degrade when visits are inconsistent.
2. Teams lose confidence when records do not reflect actual field conditions.
3. Rework increases when findings are unclear or incomplete.

Pull of the New Way:
1. Reliable property outcomes improve when field work and documentation are consistent.
2. Better continuity across visits reduces repeated diagnosis.
3. Handoffs are faster and more accurate when intent and evidence are clear.

Anxieties:
1. Fear that stricter process increases field burden.
2. Concern that edge cases will not fit a standardized flow.
3. Worry that governance controls slow operational responsiveness.

Habits of the Present:
1. Teams rely on personal memory and local workarounds.
2. Inconsistent documentation is tolerated as normal.
3. Follow-up decisions are often made with partial context.

## 3. Role-Level Forces

### 3.1 Field Execution (Technician)

Push of the Situation:
1. Time pressure and ambiguity force shortcuts.
2. Connectivity gaps interrupt momentum.
3. Follow-up risk is created when evidence is thin.

Pull of the New Way:
1. Clear sequencing lowers cognitive load.
2. Faster capture preserves time for actual inspection work.
3. Better completion confidence reduces callbacks.

Anxieties:
1. More structure may feel rigid in edge cases.
2. Evidence expectations may feel too heavy for no-issue visits.
3. Recovery from interrupted work may not be trustworthy.

Habits of the Present:
1. Experienced technicians use implicit heuristics.
2. Personal note styles vary by person.
3. Teams accept partial completion and later cleanup.

### 3.2 Follow-Up and Operations (AM / Branch)

Push of the Situation:
1. Follow-up work becomes invisible or stale.
2. Urgency and severity are inconsistently interpreted.
3. Decisions are delayed by fragmented visit context.

Pull of the New Way:
1. Clear unresolved-work pathways improve throughput.
2. Better summaries improve decision velocity.
3. Full-state visibility improves prioritization.

Anxieties:
1. New handoff discipline may expose current process gaps.
2. Teams may over-escalate to avoid missing urgency.
3. Operational cycles may be disrupted during transition.

Habits of the Present:
1. Branches rely on inboxes, calls, and memory.
2. Ownership boundaries are informally enforced.
3. Follow-up timing is managed reactively.

### 3.3 Governance and Quality

Push of the Situation:
1. Cross-region inconsistency reduces comparability.
2. Auditability is weak when rationale is implicit.
3. Record quality drifts when standards are not actively maintained.

Pull of the New Way:
1. Approval discipline improves trust in operational content.
2. Traceability supports compliance and coaching.
3. Coherent records reduce reconciliation effort.

Anxieties:
1. Governance controls may be seen as overhead.
2. Change approval steps may feel slow.
3. Teams fear losing local flexibility.

Habits of the Present:
1. Regions evolve content independently.
2. Documentation quality checks are periodic, not continuous.
3. Teams defer consistency fixes until audits or escalations.

## 4. Story-Level Force Summary

Legend:
- FE = Field Execution stories
- FO = Follow-Up and Operations stories
- GQ = Governance and Quality stories

| Story ID | Job Story (short) | Dominant Push | Dominant Pull | Main Anxiety | Main Habit |
|---|---|---|---|---|---|
| FE-1 | Understand what needs attention at arrival | Ambiguous starts create rework | Clear start reduces delay | Scope may still miss reality | Start by memory + prior habits |
| FE-2 | Keep next steps clear on site | Mid-visit confusion slows work | Clear sequence improves flow | Flow may be too rigid | Ad hoc order-of-operations |
| FE-3 | Capture findings quickly | Documentation steals field time | Fast capture preserves momentum | Quick capture may miss detail | Free-form note shortcuts |
| FE-4 | Capture where finding occurred | Placement ambiguity causes callbacks | Location context improves clarity | Location step may add overhead | Verbal location descriptions |
| FE-5 | Keep working with weak connectivity | Connectivity interrupts completion | Uninterrupted progress | Sync/recovery trust risk | Delay work in low-signal zones |
| FE-6 | Resume unfinished work accurately | Restarting causes duplicate effort | Reliable continuation saves time | Resume state may be stale | Manual restart reconstruction |
| FE-7 | Surface missing context before closeout | Late misses cause rejection/rework | Early gap visibility improves completion | Gap checks may feel punitive | Submit then fix later |
| FE-8 | Document corrective work done on site | Work performed is forgotten later | Documented action prevents disputes | Extra documentation burden | Minimal post-fix notes |
| FE-9 | Finish with defensible evidence | Weak evidence undermines trust | Evidence-backed completion holds up | Evidence standard uncertainty | "Good enough" proof |
| FE-10 | Separate routine completion from follow-up | Mixed outcomes create confusion | Explicit separation speeds downstream action | Separation logic may be inconsistent | Everything captured in one bucket |
| FO-1 | Route unresolved work correctly | Follow-up items disappear | Explicit pathway preserves accountability | Routing complexity | Informal handoffs |
| FO-2 | Keep unresolved work visible | Invisible backlog blocks planning | Ongoing visibility enables control | Visibility may create noise | Periodic manual status checks |
| FO-3 | Surface serious problems fast | Critical issues are buried | Fast escalation reduces impact | Over-escalation risk | Escalate by personal judgment |
| FO-4 | Handoff clear visit summary | Handoffs require re-interpretation | Clear summary cuts turnaround | Summary may omit nuance | Receiver reconstructs from raw notes |
| FO-5 | Make decisions with full current state | Fragmented context delays action | Full state improves decision quality | "Full state" may be hard to trust | Decide from partial views |
| FO-6 | Keep plans aligned as conditions change | Static plans become obsolete | Adaptive planning improves relevance | Frequent change may destabilize execution | Keep plan unchanged too long |
| FO-7 | Carry prior context over time | Repeat diagnosis wastes time | Historical continuity improves efficiency | Old context may bias decisions | Re-diagnose each visit |
| GQ-1 | Apply standards consistently across regions | Output comparability is weak | Shared standards improve reliability | Local differences may be suppressed | Region-specific custom norms |
| GQ-2 | Review/approve content before use | Unvetted content causes drift | Approval increases trustworthiness | Approval latency concern | Publish then correct |
| GQ-3 | Keep important changes traceable | Root cause analysis is difficult | Traceability supports learning/compliance | Trace overhead concern | Undocumented change rationales |
| GQ-4 | Keep records coherent for trustworthy history | Incoherent records reduce trust | Coherence improves decisions | Coherence checks may be heavy | Tolerate minor inconsistency |
| GQ-5 | Keep records/forms internally consistent | Reconciliation effort is high | Consistency lowers cleanup cost | Constraints may block edge cases | Manual reconciliation after the fact |
| GQ-6 | Keep underlying job intact across contexts | Context switching changes behavior/outcomes | Stable intent improves parity | Context differences may be underestimated | Channel-specific process drift |

## 5. Prioritization Signals

Use these signals to sequence improvements without becoming feature-led:

1. High push + high pull + low anxiety: fastest adoption wins.
2. High push + high anxiety: require enablement, not just process change.
3. High habit + low pull: start with proof loops and local champions.
4. Governance-heavy stories: stage rollout with explicit role boundaries.

## 6. Sources

1. requirements/JTBD/JTBD.md
2. https://strategyn.com/jobs-to-be-done/
3. https://www.productplan.com/glossary/jobs-to-be-done-framework/
