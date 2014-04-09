Modifiers: Famous modifier objects
==================================

Implementations of the core/Modifier pattern which output transforms to the 
render tree.


## Files

- Draggable.js: Makes added render nodes responsive to drag behavior.
- Lift.js: Lifts a rendernode further down the render chain to a new different 
  parent context
- ModifierChain.js: A class to add and remove a chain of modifiers at a single 
  point in the render tree.
- StateModifier.js: A collection of visual changes to be applied to another 
  renderable component, strongly coupled with the state that defines those 
  changes. 


## Documentation

- [Modifiers][modifiers]
- [The Render Tree][render-tree]
- [Layout][layout]
- [Pitfalls][pitfalls]


## Maintainer

- Mark Lu <mark@famo.us>


## License

Copyright (c) 2014 Famous Industries, Inc.

This Source Code Form is subject to the terms of the Mozilla Public License, 
v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain 
one at http://mozilla.org/MPL/2.0/.


[modifiers]: http://launch.famo.us/docs/current/modifiers
[render-tree]: http://launch.famo.us/learn/render-tree
[layout]: http://launch.famo.us/learn/layout
[pitfalls]: http://launch.famo.us/learn/pitfalls
