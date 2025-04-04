# Changelog

## v0.8.5 (2025-03-29)
### Fixed
- Added clear persistence guide explaining n8n's behavior with static data
- Updated Storage Notice to emphasize the need for trigger-based execution
- Added detailed console logs explaining how to ensure data persists between executions
- Fixed core misunderstanding that manual executions don't persist static data (n8n limitation)

## v0.8.4 (2025-03-28)
### Fixed
- Added storage verification to confirm data is properly persisted after saving
- Added user-configurable Storage ID parameter for explicit control over storage isolation
- Enhanced diagnostic logging for easier troubleshooting of persistence issues

## v0.8.3 (2025-03-28)
### Fixed
- Complete storage system refactoring to use workflow ID instead of node name
- Added proper fallbacks for environments where workflow ID might be undefined
- Improved diagnostic logging to identify storage initialization issues

## v0.8.2 (2025-03-28)
### Fixed
- Improved data persistence between workflow executions by changing from 'node' to 'global' context
- Fixed issue where messages weren't retrievable after being stored with the same node

## v0.8.1 (2025-03-28)
### Fixed
- Fixed "Unknown context type" error when retrieving conversation history by adding proper error handling and explicit type conversion in parameter handling
- Added better error messaging for troubleshooting context type issues

## v0.8.0 (2025-03-XX)
### Added
- Complete refactoring of the storage system with RoundRobinStorage utility class
- Added proper namespacing for node storage properties
- Split monolithic execution function into modular components
- Eliminated redundant serialization 