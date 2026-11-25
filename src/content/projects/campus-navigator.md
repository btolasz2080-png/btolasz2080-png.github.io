---
title: Campus Navigator
summary: An indoor navigation app that guides students to any classroom, lab or office in under three taps.
year: 2026
role: Mobile developer & UX designer
category: Mobile
tech: [Flutter, Dart, Firebase, Figma]
featured: true
order: 1
accent: burgundy
sample: true
---

## The problem
New students lose the first weeks of every semester looking for rooms. Printed maps are outdated and the buildings are connected in confusing ways.

## The process
I interviewed twelve students, mapped the most common routes, and designed a three-tap flow: **search → preview → go**. The app is built in Flutter with Firebase for live room data, so staff can update a room without shipping a new version.

- Graph of corridors and stairs with Dijkstra's shortest path
- Offline-first cache so it works in basements with no signal
- Accessible routes that avoid stairs on request

## The result
Average time-to-room dropped from about seven minutes to under two in hallway tests. The project taught me how much good data modelling simplifies the UI.
