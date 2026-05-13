from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List


class Stage(str, Enum):
    NEW = "NEW"
    RESOLVED = "RESOLVED"
    BOOTSTRAP = "BOOTSTRAP"
    INSPECTING = "INSPECTING"
    REVIEW = "REVIEW"
    COMPLETED = "COMPLETED"
    COMPLETED_WITH_ASSET_ERRORS = "COMPLETED_WITH_ASSET_ERRORS"


@dataclass
class Suggestion:
    asset: str
    issue: str
    qty: int = 1
    severity: str = "Medium"
    notes: str = ""
    confirmed: bool = False

    @property
    def key(self) -> str:
        return f"{self.asset}|{self.issue}"


@dataclass
class Session:
    region: str = "NE"
    inspection_type: str = "Quarterly"
    work_type: str = "Irrigation - Quarterly"
    stage: Stage = Stage.NEW
    resolved_set: str = ""
    resolved_version: int = 0
    required_questions_total: int = 10
    required_questions_answered: int = 0
    required_asset_types: List[str] = field(default_factory=lambda: ["Controller", "Zone"])
    found_asset_types: List[str] = field(default_factory=list)
    am_assigned: str = ""
    suggestions: Dict[str, Suggestion] = field(default_factory=dict)
    asset_apply_fail: bool = False


PUBLISHED_SETS = {
    ("NE", "Quarterly", "Irrigation - Quarterly"): ("NE Quarterly v1", 1),
    ("NE", "Winterization", "Irrigation - Winterization"): ("NE Winterization v1", 1),
    ("West", "Quarterly", "Irrigation - Quarterly"): ("West Quarterly v2", 2),
}


def resolve_set(session: Session) -> bool:
    key = (session.region, session.inspection_type, session.work_type)
    match = PUBLISHED_SETS.get(key)
    if not match:
        print("ERROR: No published question set matched.")
        print("Next step: Ask admin to publish exactly one set for region+inspection_type+work_type.")
        return False
    session.resolved_set, session.resolved_version = match
    session.stage = Stage.RESOLVED
    print(f"Resolved and snapshotted: {session.resolved_set} (v{session.resolved_version})")
    return True


def check_bootstrap(session: Session) -> None:
    missing = [a for a in session.required_asset_types if a not in session.found_asset_types]
    if missing:
        session.stage = Stage.BOOTSTRAP
        print(f"Bootstrap required. Missing asset types: {', '.join(missing)}")
    else:
        session.stage = Stage.INSPECTING
        print("Assets ready. Inspection started.")


def add_asset(session: Session, asset_type: str) -> None:
    if asset_type not in session.found_asset_types:
        session.found_asset_types.append(asset_type)
    print(f"Asset captured: {asset_type}")
    if session.stage == Stage.BOOTSTRAP:
        check_bootstrap(session)


def answer_required(session: Session, count: int) -> None:
    session.required_questions_answered = min(
        session.required_questions_total,
        session.required_questions_answered + count,
    )
    print(
        f"Required answered: {session.required_questions_answered}/{session.required_questions_total}"
    )


def add_failed_response(session: Session, asset: str, issue: str) -> None:
    key = f"{asset}|{issue}"
    if key in session.suggestions:
        session.suggestions[key].qty += 1
        print(f"Suggestion deduped and incremented: {key} (qty={session.suggestions[key].qty})")
        return
    session.suggestions[key] = Suggestion(asset=asset, issue=issue)
    print(f"Suggestion created: {key}")


def assign_am(session: Session, name: str) -> None:
    session.am_assigned = name
    print(f"AM assigned: {name}")


def review(session: Session) -> None:
    if session.stage not in [Stage.INSPECTING, Stage.BOOTSTRAP, Stage.RESOLVED]:
        print(f"Cannot open review from stage {session.stage}")
        return
    session.stage = Stage.REVIEW
    print("Entered checkout review.")
    if not session.suggestions:
        print("No suggestions created.")
    for s in session.suggestions.values():
        print(
            f"- {s.asset} | {s.issue} | qty={s.qty} | severity={s.severity} | confirmed={s.confirmed}"
        )


def confirm_suggestion(session: Session, asset: str, issue: str, severity: str, notes: str) -> None:
    key = f"{asset}|{issue}"
    if key not in session.suggestions:
        print("No such suggestion key.")
        return
    s = session.suggestions[key]
    s.severity = severity
    s.notes = notes
    s.confirmed = True
    print(f"Confirmed: {key} with severity={severity}")


def submit(session: Session) -> None:
    if session.required_questions_answered < session.required_questions_total:
        print("BLOCKED: Required questions incomplete.")
        return
    confirmed = [s for s in session.suggestions.values() if s.confirmed]
    if confirmed and not session.am_assigned:
        print("BLOCKED: AM is required when confirmed callouts exist.")
        return
    if session.asset_apply_fail:
        session.stage = Stage.COMPLETED_WITH_ASSET_ERRORS
        print("Completed with asset sync exceptions. Inspection data preserved.")
        return
    session.stage = Stage.COMPLETED
    print("Inspection completed successfully.")


def show(session: Session) -> None:
    print("\n=== SESSION STATE ===")
    print(f"Stage: {session.stage}")
    print(f"Resolver key: ({session.region}, {session.inspection_type}, {session.work_type})")
    print(f"Snapshot: {session.resolved_set} v{session.resolved_version}")
    print(f"Assets: {session.found_asset_types}")
    print(f"Required answered: {session.required_questions_answered}/{session.required_questions_total}")
    print(f"AM: {session.am_assigned or '[none]'}")
    print(f"Suggestions: {len(session.suggestions)}")
    print("=====================\n")


def print_help() -> None:
    print("Commands:")
    print("  help")
    print("  setctx <region> <inspection_type> <work_type words...>")
    print("  resolve")
    print("  addasset <Controller|Zone|Backflow>")
    print("  answer <count>")
    print("  fail <assetName> <issueType>")
    print("  review")
    print("  confirm <assetName> <issueType> <severity> <notes...>")
    print("  am <name>")
    print("  assetfail <on|off>")
    print("  submit")
    print("  show")
    print("  exit")


def main() -> None:
    session = Session()
    print("Irrigation inspection throwaway state machine")
    print_help()

    while True:
        try:
            raw = input("> ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            return

        if not raw:
            continue

        parts = raw.split()
        cmd = parts[0].lower()

        if cmd == "help":
            print_help()
        elif cmd == "setctx" and len(parts) >= 4:
            session.region = parts[1]
            session.inspection_type = parts[2]
            session.work_type = " ".join(parts[3:])
            print("Context updated.")
        elif cmd == "resolve":
            if resolve_set(session):
                check_bootstrap(session)
        elif cmd == "addasset" and len(parts) == 2:
            add_asset(session, parts[1])
        elif cmd == "answer" and len(parts) == 2 and parts[1].isdigit():
            answer_required(session, int(parts[1]))
        elif cmd == "fail" and len(parts) == 3:
            add_failed_response(session, parts[1], parts[2])
        elif cmd == "review":
            review(session)
        elif cmd == "confirm" and len(parts) >= 5:
            confirm_suggestion(session, parts[1], parts[2], parts[3], " ".join(parts[4:]))
        elif cmd == "am" and len(parts) >= 2:
            assign_am(session, " ".join(parts[1:]))
        elif cmd == "assetfail" and len(parts) == 2:
            session.asset_apply_fail = parts[1].lower() == "on"
            print(f"Asset apply fail mode: {session.asset_apply_fail}")
        elif cmd == "submit":
            submit(session)
        elif cmd == "show":
            show(session)
        elif cmd == "exit":
            print("Done.")
            return
        else:
            print("Unknown command. Use 'help'.")


if __name__ == "__main__":
    main()
