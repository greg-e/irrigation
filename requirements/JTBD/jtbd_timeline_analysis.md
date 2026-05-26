# JTBD Timeline Analysis - Adoption Timeline by Role

Date: 2026-05-26  
Framework: Jobs to be Done - Timeline Journey  
Scope: Core Functional Job + 23 job stories from JTBD.md

## 1. Alignment Baseline

This timeline aligns to requirements/JTBD/JTBD.md and uses the six-stage adoption timeline:

1. First Thought
2. Passive Looking
3. Active Looking
4. Deciding
5. First Use
6. Ongoing Use

## 2. Core Functional Job Timeline

Core Functional Job:
When I am responsible for irrigation service at a property, I want to assess current conditions and document what happened so I can keep the property operating as intended over time.

### 2.1 First Thought

1. Trigger: Responsibility for property outcomes creates concern about missing context.
2. Tension: "Can I trust what I know right now?"
3. Success Signal: Clear understanding of what must be addressed before starting.

### 2.2 Passive Looking

1. Behavior: People scan available records and prior outcomes opportunistically.
2. Tension: Context exists but is fragmented or difficult to trust.
3. Success Signal: Quick orientation without deep manual synthesis.

### 2.3 Active Looking

1. Behavior: People actively seek missing facts, dependencies, and exceptions.
2. Tension: Clarifying reality takes too much effort.
3. Success Signal: Needed context is discoverable and decision-ready.

### 2.4 Deciding

1. Behavior: People commit to a plan for what to do now versus later.
2. Tension: Trade-offs between immediate completion and downstream risk.
3. Success Signal: Confident choices with explicit rationale.

### 2.5 First Use

1. Behavior: People apply the chosen approach in live conditions.
2. Tension: Real-world variability can invalidate assumptions quickly.
3. Success Signal: Execution stays coherent despite interruptions.

### 2.6 Ongoing Use

1. Behavior: Teams build repeatable patterns over multiple cycles.
2. Tension: Drift and local workarounds erode consistency over time.
3. Success Signal: Outcomes remain stable, auditable, and improvable.

## 3. Role Timeline Patterns

### 3.1 Field Execution (Technician)

First Thought:
1. Concern about visit ambiguity, time pressure, and risk of rework.

Passive Looking:
1. Quick scan of assignment/prior context before arrival or at site.

Active Looking:
1. Resolve missing context that blocks completion confidence.

Deciding:
1. Choose execution order and evidence depth under time constraints.

First Use:
1. Execute assessment and documentation in live property conditions.

Ongoing Use:
1. Build habits for continuity, completion quality, and defensibility.

### 3.2 Follow-Up and Operations (AM / Branch)

First Thought:
1. Concern that unresolved work and urgency are not visible enough.

Passive Looking:
1. Scan summary and status signals to orient daily priorities.

Active Looking:
1. Pull complete context before committing resources.

Deciding:
1. Route, prioritize, and escalate based on risk and accountability.

First Use:
1. Action follow-up pathways and handoffs.

Ongoing Use:
1. Tune decision cadence and throughput as conditions evolve.

### 3.3 Governance and Quality

First Thought:
1. Concern that inconsistency will weaken comparability and trust.

Passive Looking:
1. Observe quality drift and review outcomes from prior cycles.

Active Looking:
1. Investigate root causes of inconsistency and traceability gaps.

Deciding:
1. Approve, reject, or revise standards/content changes.

First Use:
1. Apply controls and evaluate practical adherence.

Ongoing Use:
1. Sustain coherence and auditability while minimizing overhead.

## 4. Story-Level Timeline Focus

Legend:
- FE = Field Execution stories
- FO = Follow-Up and Operations stories
- GQ = Governance and Quality stories

| Story ID | Job Story (short) | Most Critical Timeline Stage | Key Adoption Risk | Healthy Ongoing Signal |
|---|---|---|---|---|
| FE-1 | Understand what needs attention at arrival | First Thought | Start-state ambiguity persists | Faster confident starts |
| FE-2 | Keep next steps clear on site | First Use | Flow breaks under interruptions | Smoother execution cadence |
| FE-3 | Capture findings quickly | First Use | Capture overhead slows work | Stable pace with complete capture |
| FE-4 | Capture where finding occurred | First Use | Location detail skipped under pressure | Fewer placement-related callbacks |
| FE-5 | Keep working with weak connectivity | First Use | Low trust in continuity | No interruption-driven deferrals |
| FE-6 | Resume unfinished work accurately | Ongoing Use | Restart friction causes duplication | Clean continuation across sessions |
| FE-7 | Surface missing context before closeout | Deciding | Late surprises at completion | Fewer post-submit corrections |
| FE-8 | Document corrective work done on site | First Use | Work done but not recorded | Clear proof of in-visit correction |
| FE-9 | Finish with defensible evidence | Deciding | Evidence threshold unclear | Fewer disputes over visit outcomes |
| FE-10 | Separate routine completion from follow-up | Deciding | Outcomes stay mixed and unclear | Cleaner downstream triage |
| FO-1 | Route unresolved work correctly | Deciding | Work routed inconsistently | Lower orphaned follow-up rate |
| FO-2 | Keep unresolved work visible | Passive Looking | Backlog disappears between cycles | Continuous unresolved-work visibility |
| FO-3 | Surface serious problems fast | Active Looking | Critical issues found too late | Faster escalation for high-risk items |
| FO-4 | Handoff clear visit summary | First Use | Receiver reinterprets raw data | Shorter handoff cycle time |
| FO-5 | Make decisions with full current state | Active Looking | Decisions made on partial context | Higher first-pass decision confidence |
| FO-6 | Keep plans aligned as conditions change | Ongoing Use | Plans become stale | More frequent relevance-adjusted planning |
| FO-7 | Carry prior context over time | Passive Looking | Teams re-diagnose repeatedly | Decreased duplicate assessment work |
| GQ-1 | Apply standards consistently across regions | Ongoing Use | Local drift reappears | Improved cross-region comparability |
| GQ-2 | Review/approve content before use | Deciding | Unvetted content reaches operations | Lower post-release corrections |
| GQ-3 | Keep important changes traceable | Ongoing Use | Rationale lost over time | Faster audit reconstruction |
| GQ-4 | Keep records coherent for trustworthy history | Ongoing Use | Coherence degrades gradually | Higher trust in historical decisions |
| GQ-5 | Keep records/forms internally consistent | Active Looking | Inconsistencies found too late | Reduced reconciliation effort |
| GQ-6 | Keep underlying job intact across contexts | Ongoing Use | Context-specific behavior drift | Better parity in outcomes across contexts |

## 5. Transition Risks and Mitigations

Risk 1: Teams interpret stories as features.
Mitigation:
1. Keep acceptance criteria tied to user progress outcomes.
2. Validate stories against "would this still hold if tools changed?"

Risk 2: Executor and governance jobs blur.
Mitigation:
1. Keep role ownership explicit in planning and measurement.
2. Avoid assigning governance burden to field execution by default.

Risk 3: Story wording remains abstract and non-operational.
Mitigation:
1. Pair each story with observable progress signals.
2. Review signals in recurring operations cadence.

## 6. Sources

1. requirements/JTBD/JTBD.md
2. https://strategyn.com/jobs-to-be-done/
3. https://www.productplan.com/glossary/jobs-to-be-done-framework/
