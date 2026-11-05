# Test report (headless Chrome via Playwright, SwiftShader WebGL)
- Photometry unit tests: 21/21 pass.
- Routes home, shop, rooms, inspiration, stores, contact, studio, product: render, 0 page/console errors (network blocked in sandbox, so CDN images untested).
- Studio: 1→4 units raised avg lux 31→96 and U0 0.40→0.75; room switch recomputes; lux map and plan view render.
- PDP → add to bag opens drawer. Mobile 390px: no horizontal overflow on any route.
- Not tested: real GPUs, Safari/Firefox, screen readers, live CDN images.
