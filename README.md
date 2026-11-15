# ReVolve Warehouse Twin preview

Isolated extension of the recovered ReVolve prototype. The original prototype and production deployment are unchanged. This preview has its own browser storage namespace and port.

Run from this directory in your own PowerShell:

```powershell
node preview-agent.cjs
```

Open http://127.0.0.1:8771/demo#twin

Use Current sample workflow to select equipment and open the existing traveler or resolve an exception. Use What-if simulation to adjust variables, run paired comparisons and replay a shift. No API key is needed for simulation or rule-based explanations. Existing Ask ReVolve remains a separate fixed-sample AI endpoint and requires server-side configuration.

The warehouse uses a locally bundled Three.js WebGL renderer with modeled racks, workstations, server equipment, workers, trucks and an exception hold. Drag to rotate, scroll to zoom, select equipment or use the station labels. CSS 3D provides a fallback when WebGL is unavailable. Layout and parameters are illustrative. This is not yet a validated digital twin or live HPE integration. Model assumptions are accessible in the interface.

Tests: `node --test agent.test.cjs simulation.test.cjs`

Keep this work on feature/warehouse-twin. Do not deploy it over the existing production prototype; use a separate preview project if publishing.
