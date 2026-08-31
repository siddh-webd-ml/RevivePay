# RevivePay

## AI Revenue Recovery Platform

> **AI recommends. Policy decides. RevivePay measures the money recovered.**

RevivePay is an AI-powered revenue recovery platform that identifies failed payments that may be recoverable, predicts recovery probability using Machine Learning, diagnoses payment failures using Google Gemini, recommends a bounded recovery action, validates that recommendation through deterministic policy rules, safely simulates recovery, measures batch performance, and maintains an auditable decision trail.

### Core Pipeline

```text
Failed Payment
      ↓
ML Prediction
      ↓
Recovery Probability + Expected Recovery
      ↓
Gemini AI Diagnosis
      ↓
Recommended Recovery Action
      ↓
Deterministic Policy Engine
      ↓
ALLOW / BLOCK
      ↓
Recovery Simulator
      ↓
RECOVERED / FAILED / STOPPED
      ↓
Analytics
      ↓
Audit Trail
```

---

## Problem Statement

Revenue loss rarely happens in one clean step.

A payment can fail because of:

- Network errors
- Bank timeouts
- Insufficient funds
- Expired cards
- Card declines
- Other payment failures

Simply detecting a failed payment is not enough. A merchant needs to know:

1. Whether the payment is worth recovering
2. The probability of recovery
3. Why the payment failed
4. Which intervention is appropriate
5. Whether that intervention is safe and allowed
6. Whether the recovery succeeded
7. How much revenue was recovered
8. Whether the decision can be audited

RevivePay addresses this complete workflow.

---

# Solution

RevivePay combines:

- Machine Learning for recoverability prediction
- Google Gemini for diagnosis and intervention recommendation
- Deterministic policy rules for governance
- A bounded recovery simulator
- Batch analytics for measuring recovery performance
- Persistent JSON audit logging

The key design principle is:

> ## AI recommends. Policy decides.

Gemini never directly executes a recovery action. Every recommendation passes through deterministic policy validation first.

---

# Key Features

- **ML Recovery Prediction** — estimates the probability that a failed payment can be recovered.
- **Expected Recovery Value** — estimates potentially recoverable revenue.
- **AI Diagnosis** — Gemini analyzes payment context and recommends an intervention.
- **Deterministic Governance** — policy rules validate every recommendation.
- **Bounded Recovery Simulation** — simulates recovery without executing real payments.
- **Batch Analytics** — measures recovery performance across failed-payment batches.
- **Persistent Audit Trail** — records the complete decision chain.
- **Manual Testing Dashboard** — each major engine can be tested through the UI.

---

# Architecture

```text
                    FAILED PAYMENT
                          │
                          ▼
                ┌──────────────────┐
                │    ML ENGINE     │
                │                  │
                │ Recovery         │
                │ Probability      │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │  AI DIAGNOSIS    │
                │                  │
                │ Gemini analyzes  │
                │ payment context  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │  POLICY ENGINE   │
                │                  │
                │ Deterministic    │
                │ Governance       │
                └────────┬─────────┘
                         │
                   ┌─────┴─────┐
                   │           │
                 BLOCK        ALLOW
                   │           │
                   ▼           ▼
                 STOP    ┌──────────────┐
                         │   RECOVERY   │
                         │   SIMULATOR  │
                         └──────┬───────┘
                                │
                         ┌──────┴──────┐
                         │             │
                     RECOVERED       FAILED
                         │             │
                         └──────┬──────┘
                                ▼
                       ┌────────────────┐
                       │   ANALYTICS    │
                       └───────┬────────┘
                               │
                               ▼
                       ┌────────────────┐
                       │  AUDIT TRAIL   │
                       └────────────────┘
```

---

# Tech Stack

### Frontend

- React
- Vite
- React Router
- Lucide React
- CSS

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

### Machine Learning

- Pandas
- Joblib
- Scikit-learn compatible trained model

### AI

- Google Gemini API

### Storage

- CSV transaction dataset
- JSON audit log

---

# Project Structure

```text
RevivePay/
│
├── backend/
│   └── app/
│       ├── main.py
│       ├── audit.py
│       ├── policy.py
│       ├── simulator.py
│       │
│       ├── ml/
│       │   └── revivepay_model.pkl
│       │
│       ├── data/
│       │   └── transactions.csv
│       │
│       └── audit_log.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PageHeader.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Overview.jsx
│   │   │   ├── MLEngine.jsx
│   │   │   ├── AIDiagnosis.jsx
│   │   │   ├── PolicyEngine.jsx
│   │   │   ├── Recovery.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Audit.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── App.css
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

# Prerequisites

Install the following before running the project.

### Python

Python 3.10+ recommended.

```bash
python --version
```

On Windows:

```bash
py --version
```

### Node.js

Node.js 18+ recommended.

```bash
node --version
npm --version
```

### Gemini API Key

A Google Gemini API key is required for AI Diagnosis and the complete Recovery workflow.

Never commit the API key to GitHub.

---

# Backend Setup

From the project root:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### macOS / Linux

```bash
source .venv/bin/activate
```

---

# Backend Dependencies

If `requirements.txt` exists:

```bash
pip install -r requirements.txt
```

Otherwise install the required packages:

```bash
pip install fastapi uvicorn pandas joblib scikit-learn google-genai pydantic
```

---

# Environment Variables

Configure the Gemini API key.

Example `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Or configure it in the shell.

### Windows PowerShell

```powershell
$env:GEMINI_API_KEY="your_gemini_api_key_here"
```

### Windows CMD

```cmd
set GEMINI_API_KEY=your_gemini_api_key_here
```

### macOS / Linux

```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
```

If using `.env`, add it to `.gitignore`:

```text
.env
```

---

# Running the Backend

From the project root:

```bash
uvicorn backend.app.main:app --reload
```

If already inside `backend`:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Open a second terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

---

# Run the Full Application

### Terminal 1 — Backend

```bash
uvicorn backend.app.main:app --reload
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Then open the frontend URL.

---

# Application Modules

## 1. Overview

Provides the high-level revenue recovery view.

Displays:

- Failed payments
- Revenue at risk
- Expected recovery
- Recovery potential

---

## 2. ML Engine

Allows manual transaction testing.

### Inputs

```text
Transaction ID
Amount
Payment Method
Customer Type
Subscription Type
Failure Reason
Retry Count
Previous Success Rate
Days Since Last Payment
Checkout Completed
Customer Tenure
Recovered
```

### Outputs

```text
Recovery Probability
Expected Recovery Value
```

---

## 3. AI Diagnosis

Sends transaction context to Gemini.

Displays:

- Diagnosis
- Recommended intervention
- Confidence
- ML recovery probability
- Expected recovery

Supported actions:

```text
RETRY
REMINDER
UPDATE_PAYMENT_METHOD
STOP
```

---

## 4. Policy Engine

Validates the AI recommendation using deterministic rules.

Displays:

- AI recommendation
- Governance checks
- Policy decision
- Final action
- Policy reason

Possible policy decisions:

```text
ALLOW
BLOCK
```

---

## 5. Recovery

Runs the complete workflow:

```text
ML
 ↓
Gemini
 ↓
Policy
 ↓
Simulator
 ↓
Audit
```

Displays the complete decision chain and simulated outcome.

---

## 6. Analytics

Processes a batch of failed transactions and displays:

- Transactions evaluated
- Revenue at risk
- Expected recovery
- Actual simulated recovery
- Recovery attempts
- Successful recoveries
- Recovery rate
- Attempt success rate
- Policy blocks

---

## 7. Audit

Displays persistent recovery decisions stored in:

```text
audit_log.json
```

---

# ML Prediction Engine

The trained model is stored at:

```text
backend/app/ml/revivepay_model.pkl
```

The model uses:

```text
amount
payment_method
customer_type
subscription_type
failure_reason
retry_count
previous_success_rate
days_since_last_payment
checkout_completed
customer_tenure_days
```

Expected recovery:

```text
Expected Recovery =
Amount × Recovery Probability
```

Example:

```text
Amount = ₹8,450
Probability = 59.99%

Expected Recovery ≈ ₹5,069.19
```

Expected recovery is an estimate, not a guarantee.

---

# AI Diagnosis

Gemini receives transaction context and the ML prediction.

It returns:

```text
Diagnosis
Recommended Action
Reason
Confidence
```

Example:

```text
Failure Reason:
insufficient_funds

AI Recommendation:
REMINDER
```

For transient failures:

```text
Failure Reason:
network_error

AI Recommendation:
RETRY
```

---

# Policy Engine

The policy engine is the governance layer between AI and execution.

## Allowed Actions

```text
RETRY
REMINDER
UPDATE_PAYMENT_METHOD
STOP
```

## Governance Rules

### Supported Action

Unsupported actions are blocked.

### Already Recovered

If:

```text
recovered = 1
```

the payment cannot be processed again.

### Retry Limit

Automatic retry is restricted when:

```text
retry_count >= 2
```

### Probability Threshold

Transactions below:

```text
20%
```

recovery probability are stopped.

### Retry Validation

`RETRY` is allowed for transient failures:

```text
network_error
bank_timeout
```

and requires sufficient recovery probability.

### Reminder Validation

`REMINDER` is intended primarily for:

```text
insufficient_funds
```

### Payment Method Update

`UPDATE_PAYMENT_METHOD` is intended for:

```text
expired_card
```

### STOP

STOP is a safe termination action.

---

# Governance Example

Suppose AI recommends:

```text
RETRY
```

but the failure reason is:

```text
insufficient_funds
```

The policy engine can reject the recommendation:

```text
AI
 ↓
RETRY
 ↓
POLICY
 ↓
BLOCK
 ↓
STOP
```

This demonstrates:

> **AI recommendations cannot bypass deterministic governance.**

---

# Recovery Simulator

RevivePay does not execute real payments.

The simulator models the result of an approved action.

Action modifiers:

```text
RETRY                   1.00
REMINDER                0.75
UPDATE_PAYMENT_METHOD   0.65
```

Effective probability:

```text
Recovery Probability × Action Modifier
```

The result is capped at 95%.

Possible outcomes:

```text
RECOVERED
FAILED
```

For STOP:

```text
NOT_EXECUTED
```

Because outcomes are probabilistic, repeated simulations can produce different results.

---

# Analytics

Analytics evaluates failed transactions from:

```text
backend/app/data/transactions.csv
```

The current implementation evaluates:

```text
100 failed transactions
```

The batch workflow uses local ML and deterministic recommendation logic, so it does not require a Gemini request for every transaction.

### Metrics

```text
Transactions Evaluated
Revenue at Risk
Expected Recovery
Actual Simulated Recovery
Recovery Attempts
Successful Recoveries
Recovery Rate
Attempt Success Rate
Policy Blocks
```

### Example Result

```text
Transactions Evaluated:       100
Revenue at Risk:              ₹1,51,172
Expected Recovery:             ₹71,641
Actual Simulated Recovery:     ₹33,448
Recovery Attempts:             46
Successful Recoveries:         22
Recovery Rate:                 22.0%
Attempt Success Rate:          47.8%
Policy Blocks:                 41
```

---

# Audit Trail

Audit events are persisted in:

```text
backend/app/audit_log.json
```

Each event records:

```text
timestamp
transaction_id
amount
recovery_probability
expected_recovery_value
ai_recommendation
policy_decision
final_action
policy_reason
execution_status
execution_outcome
```

Example:

```json
{
  "transaction_id": "TX002341",
  "amount": 8450,
  "recovery_probability": 0.5999,
  "expected_recovery_value": 5069.19,
  "ai_recommendation": "REMINDER",
  "policy_decision": "ALLOW",
  "final_action": "REMINDER",
  "execution_status": "EXECUTED",
  "execution_outcome": "RECOVERED"
}
```

---

# API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/diagnose` | Gemini payment diagnosis |
| POST | `/policy` | Deterministic policy validation |
| POST | `/recovery` | Complete ML → AI → Policy → Simulator → Audit workflow |
| GET | `/analytics` | Batch recovery analysis |
| GET | `/audit` | Persistent audit trail |

FastAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

# Example Recovery Request

```bash
curl -X POST   "http://127.0.0.1:8000/recovery"   -H "Content-Type: application/json"   -d '{
    "transaction_id": "TX002341",
    "amount": 8450,
    "payment_method": "UPI",
    "customer_type": "returning",
    "subscription_type": "monthly",
    "failure_reason": "insufficient_funds",
    "retry_count": 0,
    "previous_success_rate": 0.78,
    "days_since_last_payment": 32,
    "checkout_completed": 1,
    "customer_tenure_days": 420,
    "recovered": 0
  }'
```

Expected flow:

```text
ML
→ Gemini
→ Policy
→ Simulator
→ Audit
```

---

# Testing

## Test 1 — Network Error

```text
Failure Reason: network_error
Retry Count: 0
```

Expected:

```text
Gemini → RETRY
Policy → ALLOW
Recovery → EXECUTED
```

---

## Test 2 — Insufficient Funds

```text
Failure Reason: insufficient_funds
Retry Count: 0
```

Expected:

```text
Gemini → REMINDER
Policy → ALLOW
```

---

## Test 3 — Expired Card

```text
Failure Reason: expired_card
```

Expected:

```text
Gemini → UPDATE_PAYMENT_METHOD
Policy → ALLOW
```

---

## Test 4 — Retry Limit

```text
Failure Reason: network_error
Retry Count: 3
```

Expected:

```text
Gemini → STOP
Policy → ALLOW
Final Action → STOP
Simulator → NOT_EXECUTED
```

---

## Test 5 — Policy Conflict

To demonstrate governance independently:

```text
Failure Reason:
insufficient_funds

AI Recommendation:
RETRY
```

Expected:

```text
Policy Decision:
BLOCK

Final Action:
STOP
```

This demonstrates that AI recommendations cannot directly bypass policy controls.

---

# Recommended Demo Flow

```text
1. Overview
      ↓
2. ML Engine
      ↓
3. AI Diagnosis
      ↓
4. Policy Engine
      ↓
5. Recovery
      ↓
6. Analytics
      ↓
7. Audit
```

### Demo Narrative

Start with a failed payment:

> Our ML model estimates whether the payment is recoverable and how much revenue may be recovered.

Then show Gemini:

> Gemini diagnoses the failure and recommends an intervention.

Then show Policy:

> The AI does not have execution authority. Every recommendation must pass deterministic governance.

Then show Recovery:

> Only an approved action reaches the recovery simulator.

Finally show Analytics and Audit:

> We measure simulated revenue recovery across a batch and preserve the complete decision trail.

---

# Safety

RevivePay is intentionally bounded.

### No Real Payment Execution

The recovery engine is a simulator.

### AI Has No Direct Execution Authority

Gemini only recommends an action.

### Deterministic Governance

Critical recovery constraints are implemented outside the AI model.

### Retry Limits

Repeated automatic retries are restricted.

### Probability Threshold

Very low-probability recovery attempts are stopped.

### Auditability

Recovery decisions and outcomes are persistently recorded.

---

# Limitations

The current version is a prototype/demo system.

- Recovery is simulated rather than connected to a real payment gateway.
- Simulator outcomes are probabilistic.
- Batch analytics uses deterministic recommendations rather than a Gemini request for every transaction.
- Audit storage currently uses a JSON file.
- Gemini functionality requires a valid API key and available API quota.
- Production deployment would require stronger authentication, persistence, monitoring, compliance controls, and payment-provider integrations.

---

# Future Improvements

- Real payment gateway integrations
- Production database for audit logs
- Real-time payment event processing
- Adaptive retry scheduling
- Merchant-specific recovery strategies
- Customer communication workflows
- Advanced ML models
- Model monitoring and drift detection
- A/B testing of recovery strategies
- Multi-language recovery communication
- Role-based access control
- Stronger compliance and privacy controls

---

# Why RevivePay?

Traditional payment failure handling often stops at:

```text
Payment Failed
```

RevivePay continues:

```text
Payment Failed
      ↓
Revenue At Risk
      ↓
Recoverability Prediction
      ↓
Failure Diagnosis
      ↓
Recovery Recommendation
      ↓
Policy Validation
      ↓
Bounded Recovery
      ↓
Measured Outcome
      ↓
Audit Trail
```

RevivePay combines:

**Prediction + AI Reasoning + Governance + Recovery + Measurement + Auditability**

---

# Final Principle

## AI recommends. Policy decides.

> **RevivePay turns failed payments into governed, measurable recovery opportunities.**
