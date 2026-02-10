# Client Authoritative Architecture

## Overview
Room owner is the single authority for all game state. Non-owners submit actions to a queue, owner processes them.

## File Structure

```
src/
  classes/
    authority/                              # ROOM OWNER ONLY
      game-state-handler.ts                 # Main game logic (owner only)
      discussion-stage-handler.ts           # Discussion flow logic (owner only)

  hooks/
    authority/                              # ROOM OWNER ONLY
      use-with-authority-game.ts            # Owner's game hook

    participant/                            # NON-OWNER ONLY
      use-with-participant-game.ts          # Participant's hook (poll + submit)

    use-with-room-actions.ts                # Action queue processing (owner only)
    use-with-game-state.ts                  # Main hook, branches by role
```

## Data Flow

### Room Owner (Authority)
```
1. Poll action queue (1s interval)
2. Process actions sequentially
   - SEND_MESSAGE → Add to chat, notify discussion handler
   - LEAVE_ROOM → Remove from player list
   - JOIN_ROOM → Add to player list
3. Update local authoritative state
4. Push state to backend (persistence)
```

### Non-Owner (Participant)
```
1. User input → submitRoomAction()
2. Action added to backend queue
3. Poll backend for state (1s interval)
4. Display authoritative state from backend
```

### Owner Processes Own Actions Locally
```
Owner wants to send message:
1. Create action object locally
2. Call this.processAction(action)  // Same code path as remote actions
3. No backend round-trip needed
```

## Key Changes from Old System

### Old (Flawed):
- ❌ Non-owners could directly write to chat
- ❌ Owner polled own state changes (sync with self)
- ❌ Race conditions from dual authority

### New (Authoritative):
- ✅ Non-owners can ONLY submit actions
- ✅ Owner never polls own state
- ✅ Single authority, no races

## API Changes

### Removed:
- `sendMessage()` - Non-owners now use submitAction

### Renamed:
- `updateRoomGameData()` → `pushStateToBackend()`

### New:
- `processAction()` - Owner processes player actions
- `submitRoomAction()` - Non-owners submit inputs

## Implementation Phases

### Phase 1: Owner Action Processing ✅
- Add action processing to GameStateHandler
- Owner polls action queue
- Owner processes actions and updates state

### Phase 2: Remove Owner Self-Polling ✅
- Owner stops polling full room
- Owner ignores globalStateUpdated
- Owner only polls action queue

### Phase 3: Non-Owner Action Submission ✅
- Replace sendMessage with submitAction
- Non-owners submit all inputs as actions
- Non-owners continue polling full state
