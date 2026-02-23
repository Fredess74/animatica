# Agent Task Lock

## Current Lock

LOCKED_BY: none
LOCKED_PACKAGE: none
LOCKED_FILES: none
STARTED: none
EXPIRES: none

## Rules

- Before working on ANY file, check this lock
- If your target package matches LOCKED_PACKAGE, SKIP your run
- If the lock is expired (current time > EXPIRES), you may override it
- After starting work, update this file with YOUR agent name
- After completing work, reset all fields to "none"
- Lock duration: maximum 25 minutes
