# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
