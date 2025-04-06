# 🧰 Backend Architecture for Inventory Management, Verification & Synchronization – WAGA Coffee MVP

---

## ✅ 1. Inventory Management Dashboard

### 📄 Page Description  
Displays all coffee batches with filtering, sorting, status indicators, and backend-triggered actions.

### 🔗 Frontend-Backend Integration  
- **Data Display**: Fetch batch data and status indicators  
- **Filtering**: Parameters sent to API for querying  
- **Actions**: Triggers for verification, alert resolution, and blockchain sync  

### 🔌 Required API Endpoints
```python
@app.get("/api/batches")
def get_batches(...): pass

@app.post("/api/sync")
def sync_with_blockchain(): pass

@app.post("/api/batches/{batch_id}/resolve-alert")
def resolve_alert(batch_id: int): pass

@app.post("/api/batches/{batch_id}/request-verification")
def request_verification(batch_id: int): pass
```

### 📦 Data Models Needed
- `BatchInventory`
- `VerificationRequest`
- `SyncHistory`

---

## ✅ 2. Batch Detail Page

### 📄 Page Description  
Provides full view of one batch’s on-chain and off-chain details, including audit trail and verification state.

### 🔗 Frontend-Backend Integration  
- Retrieves **batch detail + blockchain metadata**  
- Triggers **verification, quality check, fraud detection**  

### 🔌 Required API Endpoints
```python
@app.get("/api/batches/{batch_id}")
def get_batch_details(batch_id: int): pass

@app.post("/api/batches/{batch_id}/verify")
def verify_batch(batch_id: int): pass

@app.post("/api/batches/{batch_id}/quality-check")
def quality_check(batch_id: int): pass

@app.post("/api/batches/{batch_id}/detect-fraud")
def detect_fraud(batch_id: int): pass

@app.get("/api/batches/{batch_id}/audit-history")
def get_audit_history(batch_id: int): pass

@app.get("/api/batches/{batch_id}/verification-requests")
def get_verification_requests(batch_id: int): pass

@app.get("/api/batches/{batch_id}/alerts")
def get_batch_alerts(batch_id: int): pass
```

### 📦 Data Models Needed
- `BatchInventory`
- `AuditRecord`
- `VerificationRequest`
- `BlockchainBatchData`
- `QualityCheckResult`
- `FraudDetectionResult`
- `BatchAlert`

---

## ✅ 3. Add New Batch Page

### 📄 Page Description  
Allows user to create a new coffee batch, redirecting to on-chain minting and off-chain sync.

### 🔌 Required API Endpoint
```python
@app.post("/api/batches/import-from-blockchain")
def import_batch(blockchain_batch_id: int): pass
```

### 📦 Data Models Needed
- `BatchInventory`
- `BlockchainImportLog`

---

## ✅ 4. Verification Engine Page

### 📄 Page Description  
Manage verification and fraud detection pipeline.

### 🔌 Required API Endpoints
```python
@app.get("/api/verification-requests")
def get_verification_requests(...): pass

@app.post("/api/verification-requests/{request_id}/process")
def process_verification(request_id: str, actual_quantity: int): pass

@app.post("/api/batches/{batch_id}/verify-batch")
def verify_batch(batch_id: int): pass

@app.post("/api/batches/{batch_id}/quality-check")
def quality_check(batch_id: int): pass

@app.post("/api/batches/{batch_id}/detect-fraud")
def detect_fraud(batch_id: int): pass
```

### 📦 Data Models Needed
- `VerificationRequest`
- `BatchInventory`
- `QualityCheckResult`
- `FraudDetectionResult`

---

## ✅ 5. Event Listener Page

### 📄 Page Description  
Processes blockchain events into the off-chain system.

### 🔌 Required API Endpoints
```python
@app.get("/api/blockchain-events")
def get_blockchain_events(...): pass

@app.post("/api/blockchain-events/{event_id}/process")
def process_event(event_id: str): pass

@app.post("/api/blockchain-events/process-all")
def process_all_events(): pass

@app.post("/api/blockchain-events/toggle-listening")
def toggle_event_listening(active: bool): pass
```

### 📦 Data Models Needed
- `BlockchainEvent`
- `EventProcessingResult`
- `EventListenerStatus`

---

## ✅ 6. Off-Chain Dashboard Page

### 📄 Page Description  
Shows system-wide metrics and status.

### 🔌 Required API Endpoints
```python
@app.get("/api/dashboard/metrics")
def get_dashboard_metrics(): pass

@app.get("/api/system/status")
def get_system_status(): pass

@app.get("/api/activities/recent")
def get_recent_activities(): pass
```

### 📦 Data Models Needed
- `SystemStatus`
- `ActivityLog`
- `DashboardMetrics`

---

## ✅ 7. Chainlink Functions Integration

### 📄 Description  
Enables Chainlink to validate off-chain data during sync and minting.

### 🔌 Required API Endpoints
```python
@app.post("/api/chainlink/verify-batch/{batch_id}")
def chainlink_verify_batch(batch_id: int, chainlink_request_id: str): pass

@app.post("/api/chainlink/quality-check/{batch_id}")
def chainlink_quality_check(batch_id: int, chainlink_request_id: str): pass

@app.post("/api/chainlink/expiry-check/{batch_id}")
def chainlink_expiry_check(batch_id: int, chainlink_request_id: str): pass
```

### 📦 Data Models Needed
- `ChainlinkRequest`
- `VerificationResult`
- `QualityCheckResult`
- `ExpiryCheckResult`

---

## ✅ 8. Blockchain Synchronization Service

### 📄 Description  
Background service for syncing data between blockchain and backend.

### 🔧 Sample Implementation
```python
class BlockchainSyncService:
    def sync_pending_batches(self): pass
    def sync_batch(self, batch_id: int): pass
    def handle_sync_failure(self, batch_id: int, error: str): pass
```

### 📦 Data Models Needed
- `SyncJob`
- `SyncResult`
- `BlockchainTransaction`

---

## 🛠️ Implementation Considerations

### 🔒 Authentication & Authorization
- Role-based access control
- Chainlink API key restrictions

### 🚨 Error Handling
- Retry logic
- Centralized logging

### ⚙️ Performance
- Pagination
- Async jobs

### 🧪 Monitoring
- Health checks
- Event alerts

---

## 🧱 Development Approach
1. Start with models and CRUD
2. Add blockchain sync logic
3. Add Chainlink support
4. Implement dashboards and dashboards
5. Finalize with testing + deployment
