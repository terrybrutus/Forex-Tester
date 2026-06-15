# Claude Behavior Rules

## Auto-PR and Auto-Merge
- Always develop on the designated feature branch
- After completing any feature, automatically create a PR to main
- PRs should be auto-merged when: all checks pass, no conflicts, and the PR is from a claude/* branch
- Commit messages must be descriptive and reference the feature built
- Push after every significant logical change

## Code Standards
- All TypeScript/TSX must pass Biome lint (biome.json in src/frontend/)
- Use double quotes, semicolons in JS/TS
- No unused variables
- Motoko code must compile with mops
- Never break existing canister interfaces without updating bindings

## Development Flow
1. Branch: claude/<session-id>
2. Build features in logical chunks
3. Commit frequently with clear messages
4. Push to origin
5. Create PR to main
6. Auto-merge when safe
