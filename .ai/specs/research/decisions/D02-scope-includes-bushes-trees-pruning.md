# D02 — The MVP covers vegetables, berry bushes and fruit trees, including pruning tasks
- Date, owner: 2026-10-19, project owner
- Context and the options weighed: the agent proposed (a) vegetables only in the MVP with bushes, trees and pruning later; (b) berry bushes in the MVP, trees and pruning later; (c) everything in the MVP. The agent recommended (a), citing the 25-hour build budget, the unresolved catalogue source and the risk of wrong pruning advice.
- Decision and why: (c). Owner: "Its hard to focus only on vegetable I would count trees and bushes elso like blueberries." The agent's recommendation was not accepted.
- Consequences, and what would make us revisit it: `AGENTS.md` (Product scope, "vegetable-garden planner") and the engineering standards must be updated in the same PR that first implements this; trees and bushes are placed on the square-foot grid (N01) as multi-cell plantings; pruning windows need sourced per-species catalogue data. Revisit if the scope does not fit the build budget or no checked pruning source is found.
- Status: active
