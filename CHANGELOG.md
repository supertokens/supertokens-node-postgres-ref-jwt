# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.0] - 2020-02-22
- Added id refresh token to header. It is checked by the frontend to see if the user is logged in.

## [3.0.1] - 2019-09-19
### Fixed
- removed unused variable pg from config.ts

## [3.0.0] - 2019-09-07
### Changed
- passing of postgres config. user can now pass all configs as stated in node-postgres (pg) library. The user should pass config inside the config parameter of postgres configuration.

## [2.1.1] - 2019-09-06
### Changed
- Removes unused variables

## [2.1.0] - 2019-08-20
### Added
- For with express implementation: Session.getSessionInfo, Session.updateSessionInfo
- For without express implementation: getSessionInfo, updateSessionInfo

### Deprecated
- For with express implementation: Session.getSessionData, Session.updateSessionData where Session is the session object returned after create new session or get session
- For without express implementation: getSessionData, updateSessionData

## [2.0.0] - 2019-08-15
### Breaking Changed
- Time based column types from timestamptz to bigint

## [1.0.0] - 2019-08-05
### Added
- Initial release
