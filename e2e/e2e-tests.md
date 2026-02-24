# E2E Test Scripts for agent-browser

## E001: Health Check

```
agent-browser open http://localhost:3000/health
agent-browser snapshot -i
Expected: {"status":"ok"|"degraded",...}
```

## E002: API Root

```
agent-browser open http://localhost:3000/
agent-browser snapshot -i
Expected: {"name":"Hệ Thống Theo Dõi Xổ Số Max 3D+",...}
```

## E003: Ticket Registration - Valid

```
1. agent-browser open http://localhost:5173/register
2. Wait for page load
3. Type "Test User" in name field
4. Type "123" in first OTP group
5. Type "456" in second OTP group
6. Click "Đăng Ký" button
7. Wait for success message
Expected: Success message appears
```

## E004: Ticket Registration - Invalid (missing numbers)

```
1. agent-browser open http://localhost:5173/register
2. Type "Test User" in name field
3. Leave OTP fields empty
4. Click "Đăng Ký" button
Expected: Error message "Vui lòng nhập đủ 3 chữ số"
```

## E005: Ticket Registration - Duplicate

```
1. Register ticket with numbers "123"-"456"
2. Try to register another ticket with same numbers
Expected: Error message about duplicate ticket
```

## E006: Keyboard Navigation

```
1. agent-browser open http://localhost:5173/register
2. Press Tab to focus name field
3. Type name
4. Press Tab to move to OTP fields
5. Type numbers
6. Press Enter to submit
Expected: Form navigates correctly with keyboard
```

## E007: Manual Fetch Results

```
1. POST to /api/v1/results/fetch with force=true
2. GET /api/v1/results/today
Expected: Results are fetched and stored
```

## E008: Progress Indicator

```
1. Start manual fetch
2. Check fetchedCount in response
3. Verify progress updates
Expected: Progress indicator shows fetched count
```

## E009: Winner Highlight

```
1. Setup: Register ticket with numbers that will win
2. Setup: Create DrawResult with matching numbers
3. Run matcher
4. Check Dashboard
Expected: Winning ticket is highlighted in green
```

## E010: Winner List

```
1. GET /api/v1/winners
2. Verify winner data structure
Expected: Winners list contains correct information
```

## E011: Dashboard Display

```
1. agent-browser open http://localhost:5173/dashboard
2. Wait for data to load
3. Verify all registered tickets are displayed
Expected: All tickets visible on dashboard
```

## E012: Real-time Polling

```
1. Open dashboard
2. Register new ticket in another tab
3. Wait 10 seconds
4. Verify new ticket appears on dashboard
Expected: Dashboard updates automatically
```

## E013: Admin Update Ticket

```
1. agent-browser open http://localhost:5173/admin
2. Enter admin secret
3. Click "Sửa" on a ticket
4. Change numbers
5. Click "Lưu"
Expected: Ticket is updated successfully
```

## E014: Admin Delete Ticket

```
1. agent-browser open http://localhost:5173/admin
2. Enter admin secret
3. Click "Xóa" on a ticket
4. Confirm deletion
Expected: Ticket is deleted successfully
```

## E015: Admin Invalid Secret

```
1. agent-browser open http://localhost:5173/admin
2. Enter wrong admin secret
3. Try to perform action
Expected: 401 Unauthorized error
```
