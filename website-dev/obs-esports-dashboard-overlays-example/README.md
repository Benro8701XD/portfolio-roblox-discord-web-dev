# OBS Esports Dashboard & Overlays Example

This is an example concept for an esports production tool made for OBS.

## Description

A simple web dashboard that controls multiple browser-source overlays for live esports streams. The producer can update teams, scores, maps, player stats, and match information from one panel, while OBS shows the changes in real time.

## Stack

- HTML
- CSS
- JavaScript
- React
- Node.js
- Socket.io
- OBS Browser Source

## Features

- Live scoreboard overlay
- Team vs team head-to-head screen
- Map veto / map pick screen
- Player statistics screen
- Waiting / starting soon screen
- Match information overlay
- Real-time updates from the dashboard
- Clean esports-style UI
- Transparent background support for OBS

## Example workflow

1. Open the dashboard in the browser.
2. Add both team names, logos, scores, and current map.
3. OBS loads the overlay using Browser Source.
4. When the producer changes data in the dashboard, the overlay updates instantly.

## Example OBS URLs

```txt
http://localhost:3000/overlay/scoreboard
http://localhost:3000/overlay/map-veto
http://localhost:3000/overlay/player-stats
http://localhost:3000/overlay/waiting-screen
http://localhost:3000/dashboard
```

## Example data

```json
{
  "teamA": "Falcons",
  "teamB": "Titans",
  "scoreA": 2,
  "scoreB": 1,
  "map": "Mirage",
  "status": "Live"
}
```

## Goal

To create a simple but professional overlay system for streamers, tournament organizers, and esports content creators.
