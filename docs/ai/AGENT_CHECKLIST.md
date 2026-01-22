# Agent Workflow Checklist

This document serves as a **workflow contract** for all agents working on this project. It defines mandatory steps and guardrails to respect.

---

## Usage

1. **Mandatory**: Created automatically when bootstrapping the repo
2. **Cockpit**: Displayed in the cockpit with checkboxes
3. **Gate**: Agents cannot move to a new feature until gates are validated

---

## Phase 1: Analysis & Understanding

### 1.1 Context Exploration
- [ ] Read project structure (architecture, main folders)
- [ ] Identify technologies used (stack, frameworks, tools)
- [ ] Understand existing code conventions
- [ ] Check for technical documentation

### 1.2 Requirement Analysis
- [ ] Clarify objectives with user if ambiguity exists
- [ ] Identify impacted files/modules
- [ ] Evaluate task complexity
- [ ] Detect dependencies with other components

### 1.3 Initial State
- [ ] Verify TypeScript state (`npm run check`)
- [ ] Verify ESLint state (`npm run lint`)
- [ ] Document initial error count
- [ ] Identify existing tests to maintain

**GATE 1**: Do not proceed to next phase without completing 1.1, 1.2 and 1.3

---

## Phase 2: Planning & Design

### 2.1 Action Plan
- [ ] Create todo list with TodoWrite (if task > 3 steps)
- [ ] Break down into atomic sub-tasks
- [ ] Identify risk points
- [ ] Define optimal execution order

### 2.2 Technical Design
- [ ] Choose appropriate technical approach
- [ ] Identify existing code patterns to follow
- [ ] Plan type/interface modifications
- [ ] Anticipate test impacts

### 2.3 User Validation
- [ ] Use AskUserQuestion if multiple approaches possible
- [ ] Get confirmation for architectural changes
- [ ] Clarify performance/security requirements
- [ ] Validate scope before implementing

**GATE 2**: Do not implement without validated plan and todo list

---

## Phase 3: Implementation

### 3.1 Read Before Write
- [ ] **ALWAYS** read file with Read before modifying
- [ ] Understand existing code and context
- [ ] Identify internal dependencies
- [ ] Note patterns to respect

### 3.2 Incremental Modifications
- [ ] Make atomic, testable changes
- [ ] Mark todos as in_progress then completed
- [ ] Use Edit for targeted modifications
- [ ] Avoid undemanded changes (no over-engineering)

### 3.3 Code Quality
- [ ] Respect project conventions
- [ ] Add appropriate TypeScript types
- [ ] Handle error cases (null checks, try/catch)
- [ ] Comment only non-obvious code

### 3.4 Security
- [ ] Check for injections (SQL, XSS, Command)
- [ ] Validate user inputs
- [ ] Do not expose secrets/credentials
- [ ] Respect principle of least privilege

**GATE 3**: Each modification must be preceded by reading the file

---

## Phase 4: Verification & Tests

### 4.1 Automated Checks
- [ ] Run `npm run check` (0 TypeScript errors)
- [ ] Run `npm run lint` (ESLint compliance)
- [ ] Run `npm run build` (successful compilation)
- [ ] Verify all tests pass

### 4.2 Code Review
- [ ] Review changes made
- [ ] Verify no unrelated files modified
- [ ] Ensure all todos completed
- [ ] Validate initial scope respected

### 4.3 Manual Tests
- [ ] Test modified functionalities
- [ ] Verify edge cases
- [ ] Test error cases
- [ ] Validate UX if UI changes

**GATE 4**: Do not mark task complete with TypeScript/ESLint errors

---

## Phase 5: Documentation & Finalization

### 5.1 Code Documentation
- [ ] Add JSDoc for public functions if needed
- [ ] Document non-obvious technical choices
- [ ] Update exported types
- [ ] Add usage examples if public API

### 5.2 Project Documentation
- [ ] Update README if architectural changes
- [ ] Document new npm scripts
- [ ] Add migration guide if breaking changes
- [ ] Create/update diagrams if needed

### 5.3 Final Report
- [ ] Summarize changes made
- [ ] List modified files
- [ ] Document technical decisions
- [ ] Provide test commands if needed

### 5.4 Cleanup
- [ ] Remove debug console.log
- [ ] Remove resolved TODO/FIXME comments
- [ ] Clean up unused imports
- [ ] Verify no temporary files remain

**GATE 5**: Task complete only if documented and cleaned

---

## Critical Rules - ALWAYS Respect

### Absolute Prohibitions

1. **NEVER modify a file without reading it first**
2. **NEVER use `@ts-ignore` or `@ts-expect-error` without justification**
3. **NEVER commit secrets/credentials**
4. **NEVER disable ESLint to hide errors**
5. **NEVER over-engineer** (stay simple and focused)
6. **NEVER create unnecessary files**
7. **NEVER use `any` without valid reason**
8. **NEVER skip existing tests**

### Absolute Obligations

1. **ALWAYS use TodoWrite** for tasks > 3 steps
2. **ALWAYS read before write** with Read
3. **ALWAYS verify TypeScript** (`npm run check`)
4. **ALWAYS verify ESLint** (`npm run lint`)
5. **ALWAYS test modifications**
6. **ALWAYS document complex choices**
7. **ALWAYS respect project conventions**
8. **ALWAYS finalize todos** (mark completed)

---

## Optimal Workflow

```
1. Read user request
2. Explore project context
3. GATE 1: Context understood
4. Create todo list if needed
5. Plan technical approach
6. GATE 2: Plan validated
7. Read files to modify
8. Implement changes
9. GATE 3: Read before each write
10. Verify TypeScript + ESLint
11. Test modifications
12. GATE 4: 0 errors
13. Document and cleanup
14. GATE 5: Task complete
15. Provide final report to user
```

---

## Alert Signals

If you encounter these situations, **STOP and ask for clarification**:

- More than 50 TypeScript errors after modifications
- Major unplanned architectural changes
- Need to delete existing tests
- Breaking changes to public API
- Modifications in > 20 files for single feature
- New external dependency needed
- Build/deployment config changes
- Database schema modifications

---

## Quality Metrics Targets

### Must Respect

- **TypeScript**: 0 errors (strict)
- **ESLint**: 0 errors (warnings acceptable if justified)
- **Test Coverage**: Do not decrease
- **Cyclomatic Complexity**: <= 20 per function
- **Max Depth**: <= 4 nesting levels
- **Lines per Function**: <= 150 (skipBlankLines: true)
- **Function Parameters**: <= 6

### Health Indicators

- ✅ **Excellent**: 0 TS errors, 0 ESLint errors, all tests pass
- ⚠️ **Acceptable**: 0 TS errors, some ESLint warnings justified
- 🔴 **Unacceptable**: TS errors present or critical ESLint errors

---

## Review Process

If work is not meeting standards:

1. **Self-review**: Go through checklist point by point
2. **Fix**: Apply necessary corrections
3. **Re-verify**: Run all checks
4. **Validate**: Confirm all gates passed
5. **Report**: Document corrections made

---

## Complementary Resources

- TypeScript Config: `tsconfig.json`
- ESLint Config: `eslint.config.js`
- Git Hooks: `.husky/pre-commit`
- CI/CD: `.gitea/workflows/ci-quality.yml`
- Documentation: `QUALITY_TOOLING_IMPLEMENTATION.md`

---

## Agent Contract

By following this checklist, I commit to:

1. ✅ Respect all phases and gates
2. ✅ Never skip critical verification
3. ✅ Ask for clarification when uncertain
4. ✅ Produce production-quality code
5. ✅ Document technical decisions
6. ✅ Maintain project quality
7. ✅ Respect time and scope constraints
8. ✅ Communicate clearly with user

**Last Updated**: 12 December 2025
**Version**: 1.0.0
**Status**: Active

---

**Note**: This checklist is a living document. It can be updated based on project evolution and lessons learned.
