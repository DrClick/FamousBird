Surfaces: Famo.us render targets
================================

Surfaces are extensions of core/Surface and are the primary concrete interface 
to the visual document elements.


## Files

- CanvasSurface.js: A surface containing an HTML5 Canvas element.  Currently 
  unstable (TODO).
- ContainerSurface.js:  An object designed to contain surfaces and set 
  properties to be applied to all of them at once.
- ImageSurface.js: A famous surface containing image content.
- InputSurface.js: A famo.us surface in the form of an HTML input element.
- VideoSurface.js: Afamous surface containing video content.


## Documentation

- [Surfaces Documentation][surfaces-documentation]
- [High Level Overview][high-level-overview] (TODO: move off of internal wiki when finished)
- [Core Concepts][core-concepts]  (TODO: move off of internal wiki when finished)
- [Core Interfaces][core-interfaces]  (TODO: move off of internal wiki when finished)
- [How Famous Works][how-famous-works]  (TODO: move off of internal wiki when finished)
- [Layout and Sizing][layout-and-sizing]  (TODO: move off of internal wiki when finished)
- [Performance Pitfalls][performance-pitfalls] (TODO: move off of internal wiki when finished)
- [Render Specification][render-spec] (TODO: move off of internal wiki when finished)


# Maintainer
- mark@famo.us


## License

Copyright (c) 2014 Famous Industries, Inc.

This Source Code Form is subject to the terms of the Mozilla Public License, 
v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain 
one at http://mozilla.org/MPL/2.0/.


[surfaces-documentation]: http://launch.famo.us/docs/current/surfaces
[high-level-overview]: https://github.com/Famous/internal/wiki/High-Level-Overview
[core-concepts]: https://github.com/Famous/internal/wiki/Core-Concepts
[core-interfaces]: https://github.com/Famous/internal/wiki/Core-Interfaces
[how-famous-works]: https://github.com/Famous/internal/wiki/How-Famous-Works
[layout-and-sizing]: https://github.com/Famous/internal/wiki/Layout-and-Sizing
[performance-pitfalls]: https://github.com/Famous/internal/wiki/Performance-Pitfalls
[render-spec]: https://github.com/Famous/internal/wiki/The-render-spec