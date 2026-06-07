# Coffee Operations

Manages the coffee-associated processes for Antioch Community Church in College Station: inventory & supplies, brew-day operations, and post-service feedback.

## Language

**Service**:
A single gathering where coffee is served — each Sunday gathering is its own Service (9am and 11am are two), and ad-hoc Services can be created for special events. The unit that brew quantities, Service Reports, and Feedback Surveys attach to.
_Avoid_: event, gathering, brew-day

**Service Report**:
The coffee team's log filed after each Service — answers to a set of operational questions (what was brewed, leftovers, issues) plus a Stock Count for each designated Supply.
_Avoid_: post-service survey, team survey, debrief

**Supply**:
A consumable tracked in inventory (beans, cups, creamer, filters). Designated Supplies are the ones counted on every Service Report.
_Avoid_: product, item

**Stock Count**:
An observation of how much of a Supply is on hand, recorded either in a Service Report or as an ad-hoc update. The latest count for a Supply is its current stock level.
_Avoid_: decrement, ledger entry

**Restock Alert**:
An email sent to the Church Admin when a Stock Count puts a Supply below its minimum level.
_Avoid_: notification, low-stock warning

**Runbook**:
The service-day reference for the team — setup/teardown checklist, brew guidance, equipment reference, and supply locations.
_Avoid_: brew-day ops, manual, docs

## Roles

**Lead**:
A coffee team member who manages Supplies, brew quantities, and the Runbook.
_Avoid_: admin, manager, owner

**Volunteer**:
A coffee team member who files Service Reports and Stock Counts.
_Avoid_: member, server

**Church Admin**:
Church staff responsible for purchasing supplies. Receives Restock Alerts by email; never logs in.
_Avoid_: admin (unqualified), purchaser

**Feedback Survey**:
The congregant-facing form rating coffee quality (taste, temperature, variety).
_Avoid_: post-service survey, congregation survey
