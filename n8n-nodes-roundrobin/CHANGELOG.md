# Changelog

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