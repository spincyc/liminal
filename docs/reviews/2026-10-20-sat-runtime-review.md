# SAT Math practice and Learn runtime review

Date: 2026-10-20. Independent reviewer: `/root/review_runtime_changes`.

Cold runtime review after source freeze: no remaining blocker found in the reviewed scope.

The review found and closed three P2 issues:

- Transfer replay-code wiring (`src/app/app.js:745`): `runCodes` was unsupported by both the test shell and progress recording. The launcher now passes `runCode` and `setCode`; an independent real-builder/app probe and a real-shell regression verify unfinished config, visible report code, session code and every attempt code.
- Figure viewport validation (`tools/build-learn.js:102`): negative viewBox dimensions could fall back to valid width/height, and duplicate attributes made validation read the first value while DOM assignment used the last. The build now validates the explicit unique viewBox and recursively rejects duplicate attribute names. Independent original attacks reject; valid controls pass.
- Within-check visible duplication (`src/lib/practice.js:330`): distinct templates could fall back to the same visible question. The builder now omits unavoidable within-check collisions, reports the missing questions/domains and encodes only the retained template mask with pinned attempts. Independent collision repro gives one question, one-bit mask, shortfall 11 and exact ordered code replay. Across-session bounded-pool reuse remains explicit.

Independent evidence beyond reading author tests:

- 1,500 pre-change/current plan comparisons over 25 generated legacy histories retained active flights, spent budgets, extra Easy budgets, passes, statuses and entry timing, both with and without legacy checkpoints.
- 96 migration comparisons through two real Progress stores retained orderFrom after other-tab edits and matched full/trimmed replay state.
- Fresh empty checkpoint plus first-answer behavior, returner cutover, pass cycling and review-flight equivalence are covered by the focused plan tests.
- 500 sequential transfer runs with shared serve history, repeated after the final dedupe fix: every run had 12 distinct template IDs and 12 distinct visible identities, all requested domain quotas, no reuse, and byte-identical ordered question objects after code replay.
- Independent actual-app VM probe with real catalog, current templates, builder, progress, analytics and engine: default Math survives a latest R&W attempt; explicit R&W selection wins; transfer starts untimed with end feedback, current template versions and usable code; saved responses resume; hints remain unavailable during end feedback; completion records all 12 questions, kind/step/feedback/codes, clears the set slot and spends no skill-drill budget.
- Figure security inspection confirms strict canonical shared SVG allowlist validation and DOM/text-node construction; no markup-string injection path introduced. Parser/build fixtures without a figure registry still work. Parent owns actual browser layout, accessibility-tree and PDF verification.

Final consolidated focused suite: 356 tests passed, 0 failed/skipped/cancelled. Learn validator passed (29 skill pages, 9 general pages, 381 template routes, 31 sourced facts). git diff --check passed. No production edits, build, full repository gate, commit or push performed by this reviewer.

Final SHA256 values for 25 reviewed source/test/data files are listed below; all were verified unchanged immediately after the final probes. Critical hashes:

- src/app/app.js: 9887bd3bd191bbbbc0892b7cf0a3a10c746ab80200a4a032d2862fc5603a9322
- src/lib/analytics.js: 3f26880f7e908d271db12f9a1238675a8c218fa61035fd3318b90a1edec09e26
- src/lib/practice.js: 5e2f82f1e0147d61bebe2e88cc16341a04dc82a471b2aa79ed18f747d3ad7932
- src/lib/progress.js: cc354a4ad213f4aaabb36f04ac622f962d3493e887d20ba18ad4cd5284998696
- tools/build-learn.js: 8874e3d6065058965280df216b4e722e55d76a6334fa057091d927adc15097be


## Exact reviewed source hashes

```json
{
  "src/app/app.js": "9887bd3bd191bbbbc0892b7cf0a3a10c746ab80200a4a032d2862fc5603a9322",
  "src/app/learn.js": "c8daf54ed5b98fd7fb65fd21556ec26683b4b9cdd01268e1d1aca2a479c0a3b9",
  "src/app/views/practice.js": "f284e5b88ea892f57322a79d65854f4f1918014b2901be35c16d1469b6911f8a",
  "src/app/views/progress.js": "103cc27d6850a709559686e8dadc9a98fa6b4f60b92a2a8bd302f2cf9370a562",
  "src/lib/analytics.js": "3f26880f7e908d271db12f9a1238675a8c218fa61035fd3318b90a1edec09e26",
  "src/lib/practice.js": "5e2f82f1e0147d61bebe2e88cc16341a04dc82a471b2aa79ed18f747d3ad7932",
  "src/lib/progress.js": "cc354a4ad213f4aaabb36f04ac622f962d3493e887d20ba18ad4cd5284998696",
  "src/lib/learn-markup.js": "988e6a9a7c411eb25d3fe69936e89fd1539f48786f86707deec0167db143fcbf",
  "src/practice.html": "f4edb81d2c06f0fc5c5c0d87008e8b911489b02dc8c6bcf392f209fd64d2f322",
  "src/styles/app.css": "0c69cc7e7ee1c14ce044e2b21f10454ea9d542c95139d71adc35d32200fc0bbc",
  "src/styles/learn.css": "83e7751cd39d072bff5eb849b2ff7ca2546ad20fcb07839560e4f22fd3d9193c",
  "src/styles/progress.css": "b571290244d847d48532b294808f6a6b5f6ed34852374a77c941751a91051de4",
  "tools/build-learn.js": "8874e3d6065058965280df216b4e722e55d76a6334fa057091d927adc15097be",
  "tools/check-learn.js": "45bc4ae6eed70900b92f4af53acbf20f235298ed7288036d552c7524e33eec3b",
  "test/analytics.test.js": "a175890ba7bc3218b95c2872f2985c1a455c7c97918e66194e5496ff0145a53a",
  "test/plan-engine.test.js": "6812c18f44d9bc0fb2a832cd581c78efaa6e35cabe90835db027636b4e3b58a7",
  "test/plan-ledger.test.js": "b78c7f47d0b1f16f27b96515bdb0da5666f7ca72e2d3dc14d031914b8b66c9c7",
  "test/plan-review-fixes.test.js": "c2c7504f24d20c64c13031cbf5f305da9309e4e3f73b7321aa7a3bc43edcdf68",
  "test/geometry-plan.test.js": "6de79c38e3f946ddc4f8d4fa83b63ef2690fb5a85f6eb750a27d59caf675c23d",
  "test/plan-order-persistence.test.js": "d400532d5da11c7383492a28fda8350e496379e2e6f5bf5dcfc92642b998ffc7",
  "test/transfer-practice.test.js": "ff46d863995f9c0a68e590d503d73af0e5a7886948104581f89f6b179565836c",
  "test/learn-figures.test.js": "d018b0c7950ce209d11cd3c7bf016fa9174a2d19b79d8fbeefe007b944ed7507",
  "test/browser-review.test.js": "ecef75a41d57340091f739f4fb61199ff68dab968c0cc170785edae6b5b092c9",
  "test/shell-recovery.test.js": "7a917bddcf20dc7f3aa394711700680acf4b02c61fb93ebc43bea68d171fc1e7",
  "content/learn/figures.json": "eb39dc43d2b68d604e0dadb460a4495cacc7f0ea0546a423a86402782f088c8a"
}
```
