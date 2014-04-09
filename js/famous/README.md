SHIPPING
========
A repository for all the modules considered for shipping with launch.


Surfaces
--------------
  **Surface** _noun_

  1. A leaf node of the Famo.us scene graph. Surfaces roughly correspond to a visual HTML `<div>` element on the screen.
    * e.g. InputSurface, CanvasSurface.

Modifiers
----------------
**Modifier** _noun_

  1. A Famo.us node that introduces a CSS3 accelerated property (matrix transform, opacity) or JavaScript property (origin, size) to the scene graph.
    * e.g. Fader, Draggable.

Widgets
--------------
  **Widget** _noun_

  1. A Famo.us component with visual representation.
    * e.g. Slider

Views
--------------
**View** _noun_

  1. A Famo.us component with state but without visual representation. Widgets and surfaces have an interface to plug into a Famo.us view.
    * e.g. Scrollview, RenderController

Templates
----------------

**Template** _noun_

  1. A higher level view, that is opinionated on layout
  2. A template for a full-fledged application
    * e.g. Tabbed Template, Paginated Template

Core
-----------

The low level componentry of Famo.us.

Inputs
------------

Input handling library, for mouse, touch, scroll, leap, etc.

Transitions
-----------

A transition library that includes support for both tween and physics transitions and their interoperability.

Physics
--------------

Famo.us physics engine, designed to provide modifiers and transitionables that behave like physical abstractions.

Math
-----------

An optimized math utility library, provides support for matrices, vectors, quaternions and random number generators.

Utilities
----------------

A collection of convenience functions and objects that have no other dependencies.
