# End User Presentation Story Flow (V5 Desktop + Mobile)

Date: 2026-06-05
Audience: End users (field + office stakeholders)
Goal: Validate that V5 supports real irrigation setup and execution with correct hierarchy, metadata capture, and checklist behavior.

## 1) Story Spine (what users should feel)

Use this simple narrative throughout the demo:

1. Setup is structured and reliable.
2. Field execution is fast and map-first.
3. Checklist answers are meaningful, not busywork.
4. Output and submit rules protect quality.

Use this line at kickoff:
"Today we are walking one real job from setup to field completion. Please stop us when something feels unrealistic, too slow, or missing from your daily process."

## 2) Demo Assets to Open

1. Desktop prototype: prototype/v5/desktopV5.1.html
2. Mobile prototype: prototype/v5/mobileV5.1.html
3. Optional reference for requirement grounding: requirements/fsm_irrigation_requirements.md

## 3) Timeboxed Agenda (35 minutes)

1. 0:00-3:00 Context + desired outcomes
2. 3:00-15:00 Desktop V5: component hierarchy + metadata
3. 15:00-28:00 Mobile V5: map-first workflow + checklist capture
4. 28:00-33:00 Checklist question review (fit/gaps)
5. 33:00-35:00 Decisions, open issues, next-step owners

## 4) Presenter Script (Say / Do / Ask)

### Segment A: Why this flow exists (3 min)

Say:
"When a property has many irrigation assets and repeated visits, we need one shared operating model across office and field. This demo shows that end-to-end model."

Do:
1. Set expectation that this is a working prototype and today is process validation.
2. Confirm the success criteria live on screen:
   - hierarchy is correct,
   - metadata is practical to maintain,
   - checklist capture supports real inspections,
   - submit gating prevents incomplete handoff.

Ask:
"Before we start, what is the #1 failure mode you want this flow to prevent?"

### Segment B: Desktop setup story (12 min)

Say:
"Office setup should make field work easier, not heavier. We will validate whether asset structure and metadata are enough for technicians to execute cleanly."

Do:
1. In Desktop, show property pivot and switch properties once.
2. Open the hierarchy view and explain the standard model:
   - System
   - Point of Connection
   - Pump / Backflow / Master Valve / Flow Sensor
   - Controller
   - Zone
3. Select 2-3 assets in different levels and show breadcrumb/path behavior.
4. Open detail for one Controller and one Zone.
5. Show metadata examples users care about:
   - Controller: label, total zones, connectivity/app fields.
   - Zone: zone number, area served, distribution method.
   - Backflow (if available): type and compliance-oriented fields.
6. Show create/edit guardrails briefly (required fields and parent mapping logic).

Ask:
1. "Where would this hierarchy break for your sites?"
2. "Which metadata fields are missing for dispatch, compliance, or troubleshooting?"
3. "Which fields look like noise and should be removed?"

### Segment C: Mobile execution story (13 min)

Say:
"Now we switch to field reality: technician on-site, map-first execution, checklist evidence, and submit readiness."

Do:
1. Open Mobile V5.
2. Show map control area and 3-5 workflow stack:
   - Assets
   - Checklist Output
   - Submit Reports
3. In Assets, filter by type and pick one Zone and one Backflow/Controller.
4. Open asset detail sheet and show:
   - metadata panel,
   - checklist entry point,
   - photo evidence support.
5. Complete checklist values for one selected asset.
6. Save checklist and show updated checklist output state.
7. Go to Submit Reports:
   - assign Account Manager,
   - show helper text and submit gate behavior.

Ask:
1. "Is this sequence close to how you inspect today, or would you reorder steps?"
2. "Can a tech finish this on a busy route without extra taps?"
3. "What would cause a tech to skip checklist capture in real life?"

### Segment D: Checklist question review (5 min)

Say:
"This is the quality engine. We want questions that are fast, objective, and action-driving."

Do:
1. Review question types in the live flow:
   - Boolean (condition checks),
   - Count/number (quantified defects),
   - Text (context when needed),
   - Conditional branches (show only when relevant),
   - Photo evidence.
2. Walk one branch example clearly:
   - Backflow test due -> if yes, show failed + certificate prompts.
3. Walk one zone defect count example:
   - broken head / leak / valve issue counts and repair notes.

Ask:
1. "Which questions are mandatory for safety/compliance?"
2. "Which should be conditional only?"
3. "Which wording is unclear for technicians?"
4. "What evidence is required for customer trust (photo, note, count)?"

### Segment E: Close with decisions (2 min)

Say:
"We are closing with decisions, not just comments."

Do:
1. Capture final status for each area:
   - Hierarchy: approved / revise
   - Metadata: approved / revise
   - Checklist set: approved / revise
   - Submit gate policy: approved / revise
2. Assign owner and due date for each revision item.

Ask:
"Can this flow be piloted by your team next, and what must change first?"

## 5) Practical Validation Checklist (use live during session)

Mark each item as Yes / No / Needs Follow-up.

### Hierarchy

1. Parent-child structure matches real field topology.
2. Users can find assets quickly by hierarchy + search.
3. Reparenting and create rules feel safe and understandable.

### Metadata

1. Required fields are truly required.
2. Optional fields are useful and not clutter.
3. Controller, zone, and backflow details are enough for execution and reporting.

### Checklist

1. Questions are unambiguous in field conditions.
2. Branch logic removes unnecessary prompts.
3. Quantities and notes support actionable output.
4. Evidence capture is practical on mobile.

### Submission

1. AM assignment gate is clear.
2. No-touch reason path is clear when no assets are changed.
3. Submit result creates confidence that handoff quality is complete.

## 6) Fast Fallback (if time drops to 15 minutes)

1. Desktop (5 min): show hierarchy + one controller metadata screen.
2. Mobile (7 min): select asset on map/list, save one checklist, show submit gate.
3. Decision round (3 min): collect redlines for hierarchy/metadata/checklist.

## 7) Notes Template for Capture (copy during meeting)

1. Confirmed:
2. Needs change:
3. Open question:
4. Decision owner:
5. Target date:

## 8) Slide Text by Phase (light, consumable)

Use these as copy-ready slide bodies.

### Slide 1: Session Purpose (Phase A)

Title:
End User Requirements Review - V5

Body:
1. Validate the full irrigation flow from setup to submit.
2. Confirm hierarchy and metadata are practical for real jobs.
3. Confirm checklist logic supports quality without slowing crews.

Footer prompt:
What would make this unusable in your day-to-day work?

### Slide 2: Target Outcomes (Phase A)

Title:
What Success Looks Like Today

Body:
1. Setup model is clear and enforceable.
2. Field execution is map-first and low-friction.
3. Submit gates prevent incomplete handoff.

Footer prompt:
If we leave with 3 decisions, what should they be?

### Slide 3: Desktop Story - Hierarchy (Phase B)

Title:
Desktop: Asset Structure You Can Trust

Body:
1. Standard hierarchy: System -> Point of Connection -> Controller -> Zone.
2. Point of Connection children: Pump, Backflow, Master Valve, Flow Sensor.
3. Goal: fast navigation + safe parent-child enforcement.

Footer prompt:
Where does your current field reality diverge from this structure?

### Slide 4: Desktop Story - Metadata (Phase B)

Title:
Desktop: Metadata That Enables Field Work

Body:
1. Controller: label, zone capacity, connectivity/platform.
2. Zone: zone number, area served, distribution method.
3. Backflow: type and compliance-oriented details.

Footer prompt:
Which fields are missing, and which should be removed?

### Slide 5: Mobile Story - Execution (Phase C)

Title:
Mobile: Map-First Work in One Flow

Body:
1. Workflow stack: Assets -> Checklist Output -> Submit Reports.
2. Select asset, open detail, capture checklist values, save.
3. Keep context connected across map, asset detail, and output.

Footer prompt:
Can a tech complete this quickly during a busy route?

### Slide 6: Mobile Story - Submit Gates (Phase C)

Title:
Submission Guardrails

Body:
1. Account Manager assignment is required.
2. Checklist evidence is required (or valid no-touch reason + note).
3. Goal: consistent handoff quality and audit confidence.

Footer prompt:
Are these gates strict enough, or too strict for reality?

### Slide 7: Checklist Design Review (Phase D)

Title:
Checklist Quality: Fast, Objective, Actionable

Body:
1. Inputs: boolean, count/number, text, photo evidence.
2. Branch logic shows only relevant follow-up questions.
3. Findings should generate clear repair/follow-up outcomes.

Footer prompt:
Which questions are mandatory vs conditional?

### Slide 8: Decision Close (Phase E)

Title:
Decisions and Owners

Body:
1. Hierarchy: Approved / Revise
2. Metadata baseline: Approved / Revise
3. Checklist set + submit policy: Approved / Revise

Footer prompt:
Owner + due date for each revision item.

### Slide 9: Optional Final Wrap

Title:
Pilot Readiness Check

Body:
1. What is ready to pilot now?
2. What must change before pilot?
3. What metrics confirm pilot success?

Footer prompt:
Go / No-Go recommendation by end-user group.

## 9) Strict 10-Slide Deck Outline + Speaker Notes

### Slide 1

Slide title:
V5 End User Review: Setup to Submit

Slide text:
1. One practical job story from office setup to field completion.
2. Focus areas: hierarchy, metadata, checklist, submit quality.
3. Goal: decisions on what is ready vs what must change.

Speaker notes:
This is a validation session, not a feature pitch. Ask users to challenge anything that feels unrealistic.

### Slide 2

Slide title:
Session Outcomes

Slide text:
1. Confirm or revise hierarchy model.
2. Confirm or revise metadata baseline.
3. Confirm or revise checklist and submit policy.

Speaker notes:
Set expectation that every section ends in a decision, owner, and target date.

### Slide 3

Slide title:
Desktop Phase: Hierarchy

Slide text:
1. Standard model: System -> Point of Connection -> Controller -> Zone.
2. POC children include Pump, Backflow, Master Valve, Flow Sensor.
3. Validate parent-child fit against real site conditions.

Speaker notes:
Show hierarchy navigation and breadcrumb path. Ask where exceptions occur in the field.

### Slide 4

Slide title:
Desktop Phase: Metadata

Slide text:
1. Controller data supports scheduling and troubleshooting.
2. Zone data supports runtime and repair context.
3. Backflow data supports compliance and follow-up.

Speaker notes:
Ask users which fields are mandatory, optional, and unnecessary noise.

### Slide 5

Slide title:
Desktop Phase: Data Quality Guardrails

Slide text:
1. Required fields enforce reliable setup.
2. Parent mapping prevents invalid structure.
3. Edit/create behaviors should feel safe and fast.

Speaker notes:
Use one create/edit example and ask if users trust this enough for daily use.

### Slide 6

Slide title:
Mobile Phase: Map-First Execution

Slide text:
1. Workflow sequence: Assets -> Checklist Output -> Submit Reports.
2. Asset selection is available from map/list context.
3. Goal is low-friction completion in the field.

Speaker notes:
Run one live path from asset selection to checklist save without leaving context.

### Slide 7

Slide title:
Mobile Phase: Checklist Capture

Slide text:
1. Input types: boolean, count, number, text, photo evidence.
2. Branch logic only shows relevant follow-up questions.
3. Saved responses feed actionable output quality.

Speaker notes:
Demonstrate one branch case and one quantity-based defect case.

### Slide 8

Slide title:
Mobile Phase: Submit Readiness

Slide text:
1. AM assignment is required.
2. Checklist evidence is required, or no-touch reason + note.
3. Submit should represent complete, auditable handoff.

Speaker notes:
Show what blocks submit and why. Confirm policy feels fair and enforceable.

### Slide 9

Slide title:
Checklist Question Review

Slide text:
1. Identify mandatory safety/compliance questions.
2. Identify conditional questions by context/asset type.
3. Simplify wording where technicians may misinterpret.

Speaker notes:
Collect edits live: keep, reword, conditionalize, or remove.

### Slide 10

Slide title:
Decisions, Owners, and Next Steps

Slide text:
1. Hierarchy: Approved or Revise.
2. Metadata: Approved or Revise.
3. Checklist and submit policy: Approved or Revise.

Speaker notes:
Close only when each item has an owner and due date. Confirm pilot readiness and top blockers.
