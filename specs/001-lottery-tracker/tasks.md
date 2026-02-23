# Tasks: Hệ Thống Theo Dõi Xổ Số Max 3D+

**Input**: Design documents from `/specs/001-lottery-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks được nhóm theo user story để cho phép triển khai và kiểm thử độc lập.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể chạy song song (khác file, không phụ thuộc)
- **[Story]**: User story mà task thuộc về (US1, US2, US3, US4)
- Bao gồm đường dẫn file chính xác

## Claude Agent Teams Strategy

**QUAN TRỌNG**: Dự án này có thể tận dụng Claude Agent Teams để tăng tốc độ implement:

### Cách sử dụng Claude Agent Teams

1. **Tạo team**: Sử dụng `TeamCreate` tool để tạo team
   ```
   TeamCreate với team_name: "lottery-tracker"
   ```

2. **Spawn teammates**: Sử dụng `Task` tool với `team_name` parameter để tạo agents song song

3. **Giao tiếp**: Sử dụng `SendMessage` tool để coordinate giữa các agents

4. **Task list**: Tất cả teammates chia sẻ task list tại `~/.claude/tasks/lottery-tracker/`

### Parallel Execution Opportunities

| Phase | Parallel Opportunities | Recommended Team Size |
|-------|----------------------|----------------------|
| Setup | T001, T002, T003, T004 | 4 agents |
| Foundational | T005, T006, T007, T008, T009 | 5 agents |
| US1 Backend | T010-T014 | 5 agents |
| US1 Frontend | T015-T018 | 4 agents |
| US2 Backend | T019-T022 | 4 agents |
| US3 Backend | T023-T026 | 4 agents |
| US4 Frontend | T027-T031 | 5 agents |
| E2E Tests | E001-E005 | 5 agents |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Khởi tạo dự án và cấu trúc cơ bản

**Parallel Strategy**: TẤT CẢ tasks trong phase này có thể chạy song song (khác file, không dependency)

- [x] T001 [P] Tạo cấu trúc thư mục dự án theo plan.md (src/, frontend/, tests/)
- [x] T002 [P] Initialize Node.js project với package.json và TypeScript config tại root
- [x] T003 [P] Setup ESLint, Prettier và lint-staged config tại root
- [x] T004 [P] Tạo wrangler.toml config cho Cloudflare Workers deployment
- [x] T005 [P] Tạo .env.example với các environment variables cần thiết
- [x] T006 [P] Setup frontend project với Vite + React + TypeScript trong frontend/
- [ ] T007 [P] Cài đặt shadcn/ui và các UI dependencies trong frontend/
- [x] T008 [P] Setup Vitest config cho backend tests
- [x] T009 [P] Setup React Testing Library config cho frontend tests

**Checkpoint**: Project structure ready - có thể bắt đầu Foundational phase

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure PHẢI hoàn thành trước KHI BẤT KỲ user story nào có thể implement

**CRITICAL**: Không có user story nào có thể bắt đầu cho đến khi phase này hoàn thành

**Parallel Strategy**: TẤT CẢ tasks trong phase này có thể chạy song song

### Backend Foundational

- [x] T010 [P] Tạo TypeScript type definitions cho tất cả entities trong src/types/entities.ts
- [x] T011 [P] Tạo Cloudflare KV service trong src/services/kv.ts
- [x] T012 [P] Tạo input validation helpers trong src/utils/validation.ts
- [x] T013 [P] Tạo logger utility trong src/utils/logger.ts
- [x] T014 [P] Tạo admin auth middleware trong src/middleware/adminAuth.ts
- [x] T015 [P] Setup Express app với middleware cơ bản trong src/app.ts
- [x] T016 [P] Tạo Cloudflare Worker entry point trong src/index.ts
- [x] T017 [P] Tạo health check route trong src/routes/health.ts

### Frontend Foundational

- [x] T018 [P] Tạo API client service trong frontend/src/services/api.ts
- [x] T019 [P] Tạo HTTP polling hook trong frontend/src/hooks/usePolling.ts
- [x] T020 [P] Setup shadcn/ui InputOTP component trong frontend/src/components/ui/input-otp.tsx
- [x] T021 [P] Tạo base layout components trong frontend/src/components/layout/

**Checkpoint**: Foundation ready - TẤT CẢ user stories có thể bắt đầu implement song song

---

## Phase 3: User Story 1 - Đăng Ký Vé Số (Priority: P1) 🎯 MVP

**Goal**: Người dùng có thể nhập tên và 2 bộ số vé Max 3D+, lưu vào hệ thống

**Independent Test**: Mở app, nhập tên "Test User" và số "123", "456", lưu thành công, thấy dữ liệu trên dashboard

**Parallel Strategy**: Backend tasks (T022-T026) có thể chạy song song với Frontend tasks (T027-T031)

### Backend Implementation for US1

- [x] T022 [P] [US1] Tạo Participant model trong src/models/participant.ts
- [x] T023 [P] [US1] Tạo Ticket model trong src/models/ticket.ts
- [x] T024 [US1] Triển khai TicketService với create/list logic trong src/services/ticketService.ts
- [x] T025 [US1] Tạo tickets routes (POST, GET) trong src/routes/tickets.ts
- [x] T026 [US1] Thêm validation cho duplicate ticket check

### Frontend Implementation for US1

- [x] T027 [P] [US1] Tạo TicketInput component với InputOTP trong frontend/src/components/TicketInput.tsx
- [x] T028 [P] [US1] Tạo TicketCard component hiển thị vé trong frontend/src/components/TicketCard.tsx
- [x] T029 [US1] Tạo RegisterPage với form nhập vé trong frontend/src/pages/RegisterPage.tsx
- [x] T030 [US1] Tích hợp API client với ticket registration
- [x] T031 [US1] Thêm error handling và validation UI feedback

**Checkpoint**: User Story 1 hoàn thành - có thể test độc lập việc đăng ký vé số

---

## Phase 4: User Story 2 - Tự Động Lấy Kết Quả Quay Số (Priority: P1)

**Goal**: Hệ thống tự động fetch kết quả từ xskt.com.vn vào 18h10 GMT+7

**Independent Test**: Trigger manual fetch qua API, thấy kết quả được parse và lưu vào KV

**Parallel Strategy**: T032-T035 có thể chạy song song

### Backend Implementation for US2

- [x] T032 [P] [US2] Tạo DrawResult model trong src/models/drawResult.ts
- [x] T033 [P] [US2] Triển khai scraper service với cheerio trong src/services/scraper.ts
- [x] T034 [US2] Triển khai scheduler service với Cron Triggers trong src/services/scheduler.ts
- [x] T035 [US2] Tạo results routes (GET /today, GET /:date, POST /fetch) trong src/routes/results.ts
- [x] T036 [US2] Thêm retry logic và error handling cho scraper

### Frontend Implementation for US2

- [x] T037 [P] [US2] Tạo ResultDisplay component trong frontend/src/components/ResultDisplay.tsx
- [x] T038 [P] [US2] Tạo ProgressIndicator component trong frontend/src/components/ProgressIndicator.tsx
- [x] T039 [US2] Cập nhật DashboardPage hiển thị kết quả quay số

**Checkpoint**: User Story 2 hoàn thành - có thể test độc lập việc fetch và hiển thị kết quả

---

## Phase 5: User Story 3 - So Khớp Vé Số Và Thông Báo Trúng Giải (Priority: P1)

**Goal**: Tự động so khớp vé với kết quả, gửi webhook Lark khi có người trúng

**Independent Test**: Với kết quả và vé đã có, verify matcher tính đúng giải, webhook được gửi

**Parallel Strategy**: T040-T043 có thể chạy song song

### Backend Implementation for US3

- [x] T040 [P] [US3] Tạo WinNotification model trong src/models/winNotification.ts
- [x] T041 [P] [US3] Triển khai matcher service với prize logic trong src/services/matcher.ts
- [x] T042 [US3] Triển khai notifier service với Lark webhook trong src/services/notifier.ts
- [x] T043 [US3] Tạo winners route (GET /winners) trong src/routes/winners.ts
- [x] T044 [US3] Tích hợp matcher vào scheduler để auto-match khi có kết quả mới

### Frontend Implementation for US3

- [x] T045 [P] [US3] Tạo WinnerHighlight component với animation trong frontend/src/components/WinnerHighlight.tsx
- [x] T046 [US3] Cập nhật DashboardPage hiển thị winners và highlights
- [x] T047 [US3] Thêm sound notification option khi có người trúng

**Checkpoint**: User Story 3 hoàn thành - có thể test độc lập việc so khớp và thông báo

---

## Phase 6: User Story 4 - Dashboard Xem Kết Quả Chung (Priority: P2)

**Goal**: Dashboard công khai hiển thị tất cả vé, kết quả, và winners với real-time updates

**Independent Test**: Mở dashboard, thấy tất cả vé đã đăng ký, kết quả cập nhật real-time

**Parallel Strategy**: T048-T052 có thể chạy song song

### Frontend Implementation for US4

- [x] T048 [P] [US4] Tạo DashboardPage layout trong frontend/src/pages/DashboardPage.tsx
- [x] T049 [P] [US4] Tạo TicketList component hiển thị tất cả vé trong frontend/src/components/TicketList.tsx
- [x] T050 [P] [US4] Tạo WinnerList component trong frontend/src/components/WinnerList.tsx
- [x] T051 [US4] Tích hợp usePolling hook để auto-refresh dashboard
- [x] T052 [US4] Tạo App.tsx với routing giữa Register và Dashboard

**Checkpoint**: User Story 4 hoàn thành - Dashboard fully functional

---

## Phase 7: Admin Features & Update/Delete Tickets

**Goal**: Admin có thể cập nhật/xóa vé số đã đăng ký

**Parallel Strategy**: T053-T055 có thể chạy song song

- [x] T053 [P] Tạo AdminPage trong frontend/src/pages/AdminPage.tsx
- [x] T054 [P] Thêm PUT và DELETE routes cho tickets trong src/routes/tickets.ts
- [ ] T055 Triển khai admin secret validation UI

---

## Phase 8: Unit Tests & Integration Tests

**Purpose**: Đảm bảo code quality và correctness

**Parallel Strategy**: TẤT CẢ test tasks có thể chạy song song

### Backend Unit Tests

- [x] T056 [P] Viết unit tests cho matcher service trong tests/unit/matcher.test.ts
- [x] T057 [P] Viết unit tests cho validation helpers trong tests/unit/validation.test.ts
- [x] T058 [P] Viết unit tests cho scraper service trong tests/unit/scraper.test.ts

### Backend Integration Tests

- [ ] T059 [P] Viết integration tests cho tickets API trong tests/integration/tickets.test.ts
- [ ] T060 [P] Viết integration tests cho results API trong tests/integration/results.test.ts
- [ ] T061 [P] Viết integration tests cho admin auth trong tests/integration/auth.test.ts

### Frontend Tests

- [ ] T062 [P] Viết tests cho TicketInput component trong frontend/tests/components/TicketInput.test.tsx
- [ ] T063 [P] Viết tests cho TicketCard component trong frontend/tests/components/TicketCard.test.tsx
- [ ] T064 [P] Viết tests cho usePolling hook trong frontend/tests/hooks/usePolling.test.ts

---

## Phase 9: E2E Browser Tests (agent-browser)

**Purpose**: End-to-end testing sử dụng agent-browser để verify user journeys

**Parallel Strategy**: TẤT CẢ E2E test tasks có thể chạy song song với các agents khác nhau

### E2E Test Setup

- [ ] E001 [P] Tạo thư mục e2e/ và setup agent-browser test runner script
- [ ] E002 [P] Viết E2E test script cho health check endpoint

### E2E Test Cases - User Story 1 (Ticket Registration)

- [ ] E003 [P] [E2E-US1] Viết test: Mở trang đăng ký, nhập vé hợp lệ, verify lưu thành công
- [ ] E004 [P] [E2E-US1] Viết test: Nhập vé không hợp lệ (thiếu số), verify error message
- [ ] E005 [P] [E2E-US1] Viết test: Nhập vé trùng lặp, verify duplicate error
- [ ] E006 [P] [E2E-US1] Viết test: Navigate với keyboard (Tab, Enter) giữa các input fields

### E2E Test Cases - User Story 2 (Results Fetch)

- [ ] E007 [P] [E2E-US2] Viết test: Trigger manual fetch, verify results hiển thị
- [ ] E008 [P] [E2E-US2] Viết test: Verify progress indicator cập nhật khi fetch

### E2E Test Cases - User Story 3 (Matching & Notification)

- [ ] E009 [P] [E2E-US3] Viết test: Setup test data với vé trùng kết quả, verify winner highlight
- [ ] E010 [P] [E2E-US3] Viết test: Verify winner list hiển thị đúng thông tin

### E2E Test Cases - User Story 4 (Dashboard)

- [ ] E011 [P] [E2E-US4] Viết test: Mở dashboard, verify tất cả vé hiển thị
- [ ] E012 [P] [E2E-US4] Viết test: Verify real-time polling cập nhật dashboard

### E2E Test Cases - Admin Features

- [ ] E013 [P] [E2E-Admin] Viết test: Admin update vé với valid secret
- [ ] E014 [P] [E2E-Admin] Viết test: Admin delete vé với valid secret
- [ ] E015 [P] [E2E-Admin] Viết test: Admin action với invalid secret, verify 401

### E2E Test Runner Commands

```bash
# Chạy tất cả E2E tests
agent-browser open http://localhost:3000
agent-browser snapshot -i
# ... follow test scripts

# Hoặc sử dụng parallel agents
# Agent 1: E003-E006 (US1 tests)
# Agent 2: E007-E008 (US2 tests)
# Agent 3: E009-E010 (US3 tests)
# Agent 4: E011-E012 (US4 tests)
# Agent 5: E013-E015 (Admin tests)
```

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements ảnh hưởng nhiều user stories

**Parallel Strategy**: TẤT CẢ tasks có thể chạy song song

- [x] T065 [P] Thêm rate limiting middleware cho tickets endpoint
- [x] T066 [P] Thêm input sanitization cho name field
- [x] T067 [P] Tạo README.md với hướng dẫn sử dụng
- [ ] T068 [P] Tạo deployment documentation
- [ ] T069 [P] Verify quickstart.md workflows hoạt động đúng
- [ ] T070 [P] Performance optimization và cleanup
- [ ] T071 [P] Security review và hardening

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
    ├── Phase 3 (US1) ──┐
    ├── Phase 4 (US2) ──┤── Can run in PARALLEL
    ├── Phase 5 (US3) ──┤
    ├── Phase 6 (US4) ──┘
    ↓
Phase 7 (Admin)
    ↓
Phase 8 (Unit/Integration Tests) ← Can parallel with Phase 9
Phase 9 (E2E Tests) ← Can parallel with Phase 8
    ↓
Phase 10 (Polish)
```

### User Story Dependencies

| User Story | Depends On | Can Start After |
|------------|-----------|-----------------|
| US1 (Register) | Foundational | Phase 2 complete |
| US2 (Results) | Foundational | Phase 2 complete |
| US3 (Matching) | US1, US2 (optional) | Phase 2 complete |
| US4 (Dashboard) | US1, US2, US3 | Phase 2 complete |

### Within Each Phase

- Tasks marked [P] can run in **PARALLEL**
- Tasks without [P] must run **SEQUENTIALLY**
- Within user story: Models → Services → Routes → Integration

---

## Parallel Execution Examples

### Example 1: Setup Phase (4 parallel agents)

```bash
# Sử dụng Claude Agent Teams
TeamCreate team_name: "lottery-tracker-setup"

# Spawn 4 agents song song
Task (T001) - Agent 1: Project structure
Task (T002) - Agent 2: Node.js init
Task (T003) - Agent 3: Linting config
Task (T004) - Agent 4: Wrangler config
```

### Example 2: User Story 1 (5 parallel agents)

```bash
# Backend agents
Task (T022) - Agent 1: Participant model
Task (T023) - Agent 2: Ticket model
Task (T024-T026) - Agent 3: Service + Routes (sequential)

# Frontend agents (parallel with backend)
Task (T027) - Agent 4: TicketInput component
Task (T028) - Agent 5: TicketCard component
```

### Example 3: E2E Tests (5 parallel agents)

```bash
# Mỗi agent chạy một nhóm E2E tests
Task (E003-E006) - Agent 1: US1 E2E tests
Task (E007-E008) - Agent 2: US2 E2E tests
Task (E009-E010) - Agent 3: US3 E2E tests
Task (E011-E012) - Agent 4: US4 E2E tests
Task (E013-E015) - Agent 5: Admin E2E tests
```

---

## Implementation Strategy

### MVP First (Recommended)

1. **Phase 1**: Setup (~2 hours with 4 parallel agents)
2. **Phase 2**: Foundational (~4 hours with 5 parallel agents)
3. **Phase 3**: User Story 1 - Đăng ký vé số (~3 hours)
4. **STOP & VALIDATE**: Test US1 independently
5. **Deploy/Demo MVP**

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Register) → Test → Deploy (MVP!)
3. US2 (Results) → Test → Deploy
4. US3 (Matching) → Test → Deploy
5. US4 (Dashboard) → Test → Deploy
6. Tests + Polish → Final release

### Parallel Team Strategy với Claude Agent Teams

```
Timeline:
────────────────────────────────────────────────────────────>

Week 1:
├─ Team A (4 agents): Phase 1 Setup [PARALLEL]
├─ Team B (5 agents): Phase 2 Foundational [PARALLEL]
│
Week 2:
├─ Team C (3 agents): US1 Backend [PARALLEL]
├─ Team D (3 agents): US1 Frontend [PARALLEL]
│
Week 3:
├─ Team E (3 agents): US2 + US3 Backend [PARALLEL]
├─ Team F (3 agents): US2 + US3 Frontend [PARALLEL]
│
Week 4:
├─ Team G (5 agents): US4 + Admin [PARALLEL]
├─ Team H (5 agents): E2E Tests [PARALLEL]
│
Week 5:
├─ All Teams: Polish + Deploy
```

---

## Task Summary

| Phase | Total Tasks | Parallel Tasks | Sequential Tasks |
|-------|-------------|----------------|------------------|
| 1. Setup | 9 | 9 | 0 |
| 2. Foundational | 12 | 12 | 0 |
| 3. US1 | 10 | 4 | 6 |
| 4. US2 | 8 | 4 | 4 |
| 5. US3 | 8 | 3 | 5 |
| 6. US4 | 5 | 3 | 2 |
| 7. Admin | 3 | 2 | 1 |
| 8. Unit/Integration Tests | 9 | 9 | 0 |
| 9. E2E Tests | 15 | 15 | 0 |
| 10. Polish | 7 | 7 | 0 |
| **TOTAL** | **86** | **68** | **18** |

**Parallel Efficiency**: 79% of tasks can run in parallel!

---

## Notes

- **[P]** = Khác file, không có dependencies, có thể chạy song song
- **[Story]** label = Ánh xạ task đến user story cụ thể
- Mỗi user story có thể hoàn thành và test độc lập
- Claude Agent Teams có thể spawn nhiều agents để tận dụng parallel tasks
- E2E tests sử dụng agent-browser cho browser automation
- Commit sau mỗi task hoặc logical group
- Stop tại bất kỳ checkpoint nào để validate independently
