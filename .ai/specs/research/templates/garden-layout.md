# Garden layout on the grid — {whose garden}, {date}

Fill-in sheet for E01-T03 (#13), which tests A04: "a square-foot grid represents bushes and trees well enough for planning". One cell = 1 ft × 1 ft (about 30 × 30 cm). Rules under test: R01 (every planting is a rectangle of whole cells), N01 (no freehand drawing), D02 (bushes and trees are multi-cell plantings).

- Whose garden: (the owner's own garden is evidence about the owner only, not about other gardeners)
- How it was measured: (tape, paces, estimate from a photo)

## Beds

| Bed | Rows × cols (cells) | What borders it (path, fence, lawn, building) |
|---|---|---|
| | | |

## Plantings

One row per planting. `row`, `col` are the top-left cell (0-based); the footprint is `rowSpan × colSpan` whole cells.

| Plant | Bed (or "none") | row, col | rowSpan × colSpan | Footprint used: trunk/stem, root zone or canopy? | Fits R01? |
|---|---|---|---|---|---|
| fruit tree: | | | | | |
| blueberry: | | | | | |

## Cases to check against A04

Record what you actually find for each. A "yes" is a case against A04.

1. **Plant outside any bed:** the tree (or bush) stands in lawn or a border, so no bed holds it.
2. **Canopy wider than the footprint:** the canopy covers cells the planting does not occupy, so those cells still look free.
3. **Shade:** the tree, a fence or a building shades cells. The grid has no shade.
4. **Footprint choice:** canopy, root zone and trunk give different rectangles, and none of them is clearly right for planning.
5. **Growth over years:** this season's footprint is wrong in later seasons.
6. **Non-rectangular shape:** a bed or plant that whole-cell rectangles misrepresent badly.
7. **Bed too large:** a bed that would need more cells than a reasonable bed-size limit.

## Verdict

- What fit the grid without loss:
- What didn't fit, with case numbers from above:
- Does A04 hold for this garden? (holds / holds with workarounds / fails). What should change in R01 or N01, if anything:
