# Changelog

## v0.9.2 (2024-04-04)
### Added
- Improved round counter implementation with better UI integration
- Enhanced error handling for round limit enforcement
- Added round count information to all output formats

### Changed
- Further improved UI elements for better user experience
- Reorganized parameters for more intuitive workflow configuration

## v0.9.1 (2024-04-04)
### Added
- Added conversation round counter that tracks and limits conversation turns
- Added ability to set maximum allowed rounds for conversation loops
- Added round count information to all node outputs

### Changed
- Made binary storage the default storage method for better data persistence
- Improved UI with clearer parameter grouping and helpful descriptions
- Enhanced role configuration with better organization and visual cues
- Renamed various UI elements for clarity ("spots" -> "participants")

### Fixed
- Fixed data persistence issues by optimizing binary storage
- Improved error handling during round counting and storage operations
- Standardized binary property names for better workflow compatibility

## v0.8.9 (2024-04-04)
### Fixed
- Fixed TypeScript configuration to properly identify source files
- Added ESLint configuration for better code quality
- Fixed type inference issues in ExternalStorage class
- Improved project structure for better n8n compatibility
- Enhanced gitignore patterns for development files

## v0.8.8 (2025-03-30)
### Fixed
- Fixed TypeScript errors in binary storage functionality
- Added proper typing for binary data storage
- Improved compatibility with different n8n workflow versions
- Added graceful handling of binary data

## v0.8.7 (2025-03-29)
### Fixed
- Added proper index.ts for better TypeScript support
- Updated index.js to use compiled TypeScript exports
- Improved node exports to match n8n's expected format

## v0.8.6 (2025-03-29)
### Fixed
- Fixed TypeScript errors related to n8n type definitions
- Updated n8n imports to work with latest n8n types
- Removed deprecated code references to improve compatibility

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