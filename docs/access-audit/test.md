# Test: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Test/TreeNode.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => setExpanded(!expanded) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setExpanded(!expanded) — [TreeNode.jsx:9](../../client/src/pages/Test/TreeNode.jsx#L9) |
