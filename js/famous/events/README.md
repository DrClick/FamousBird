Events: Famous eventing libraries
=================================

Events are used for communication between objects in Famous.  Famous implements 
an event interface similar to that used in NodeJS.


## Files

- EventArbiter.js: A switch which wraps several event destinations and redirects 
  received events to at most one of them.
- EventFilter.js: EventFilter regulates the broadcasting of events based on a 
  specified condition.
- EventMapper.js: EventMapper routes events to various event destinations based 
  on custom logic.


## Documentation

- [Events documentation][events-documentation]
- [Events tutorial][events-tutorial]
- [Pitfalls][pitfalls]


## Maintainer

- David Valdman <david@famo.us>


## License

Copyright (c) 2014 Famous Industries, Inc.

This Source Code Form is subject to the terms of the Mozilla Public License, 
v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain 
one at http://mozilla.org/MPL/2.0/.


[events-documentation]: http://launch.famo.us/docs/events
[events-tutorial]: http://launch.famo.us/learn/events
[pitfalls]: launch.famo.us/learn/pitfalls
