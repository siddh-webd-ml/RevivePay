# import joblib
# import pandas as pd
# from fastapi import FastAPI
# from pydantic import BaseModel


# app = FastAPI(
#     title="RevivePay API",
#     description="AI-powered revenue recovery system",
#     version="1.0.0"
# )


# # Load trained ML model once
# model = joblib.load("ml/revivepay_model.pkl")


# class Transaction(BaseModel):
#     amount: float
#     payment_method: str
#     customer_type: str
#     subscription_type: str
#     failure_reason: str
#     retry_count: int
#     previous_success_rate: float
#     days_since_last_payment: int
#     checkout_completed: int
#     customer_tenure_days: int


# @app.get("/")
# def home():
#     return {
#         "message": "RevivePay API is running"
#     }


# @app.get("/health")
# def health():
#     return {
#         "status": "healthy"
#     }


# @app.post("/predict")
# def predict(transaction: Transaction):

#     data = transaction.model_dump()

#     input_df = pd.DataFrame([data])

#     probability = model.predict_proba(
#         input_df
#     )[0][1]
#     expected_recovery = (
#         transaction.amount * probability
#     )

#     return {
#         "recovery_probability": round(
#             probability,
#             4
#         ),
#         "expected_recovery_value": round(
#             expected_recovery,
#             2
#         )
#     }
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import json
import os
from fastapi import FastAPI
from pydantic import BaseModel

from backend.app.agent import diagnose_payment
from backend.app.policy import evaluate_policy
from backend.app.simulator import simulate_recovery
from backend.app.audit import create_audit_event


app = FastAPI(
    title="RevivePay API",
    description="AI-powered revenue recovery system",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# LOAD ML MODEL
# --------------------------------------------------

model = joblib.load(
    "ml/revivepay_model.pkl"
)


# --------------------------------------------------
# REQUEST SCHEMA
# --------------------------------------------------

class Transaction(BaseModel):

    transaction_id: str = "UNKNOWN"

    amount: float

    payment_method: str

    customer_type: str

    subscription_type: str

    failure_reason: str

    retry_count: int

    previous_success_rate: float

    days_since_last_payment: int

    checkout_completed: int

    customer_tenure_days: int

    recovered: int = 0


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "RevivePay API is running"
    }


# --------------------------------------------------
# HEALTH
# --------------------------------------------------

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# --------------------------------------------------
# ML PREDICTION
# --------------------------------------------------

def get_recovery_score(transaction):

    data = transaction.model_dump()

    input_data = {
        key: value
        for key, value in data.items()
        if key not in [
            "transaction_id",
            "recovered"
        ]
    }

    input_df = pd.DataFrame(
        [input_data]
    )

    probability = model.predict_proba(
        input_df
    )[0][1]

    expected_recovery = (
        transaction.amount
        * probability
    )

    return (
        probability,
        expected_recovery
    )
# @app.post("/predict")
# def predict_transaction(transaction: Transaction):

#     recovery_probability, expected_recovery = get_recovery_score(
#         transaction
#     )

#     return {
#         "transaction_id": transaction.transaction_id,
#         "ml": {
#             "recovery_probability": round(
#                 recovery_probability,
#                 4
#             ),
#             "expected_recovery_value": round(
#                 expected_recovery,
#                 2
#             )
#         }
#     }
@app.post("/predict")
def predict_transaction(transaction: Transaction):

    print("PREDICTION INPUT:")
    print(transaction.model_dump())

    recovery_probability, expected_recovery = get_recovery_score(
        transaction
    )

    print("PREDICTION:", recovery_probability)

    return {
        "transaction_id": transaction.transaction_id,
        "ml": {
            "recovery_probability": round(
                recovery_probability,
                4
            ),
            "expected_recovery_value": round(
                expected_recovery,
                2
            )
        }
    }



@app.post("/diagnose")
def diagnose_transaction(transaction: Transaction):

    recovery_probability, expected_recovery = get_recovery_score(
        transaction
    )

    transaction_data = transaction.model_dump()

    transaction_data["recovery_probability"] = recovery_probability

    ai_response = diagnose_payment(
        transaction_data
    )

    return {
        "transaction_id": transaction.transaction_id,

        "ml": {
            "recovery_probability": round(
                recovery_probability,
                4
            ),
            "expected_recovery_value": round(
                expected_recovery,
                2
            )
        },

        "ai": {
            "analysis": ai_response
        }
    }


# policy

@app.post("/policy")
def policy_check(transaction: Transaction):

    transaction_data = transaction.model_dump()

    recovery_probability, expected_recovery = get_recovery_score(
        transaction
    )

    transaction_data["recovery_probability"] = recovery_probability

    # Get AI recommendation
    ai_response = diagnose_payment(
        transaction_data
    )

    # Extract recommended action
    recommended_action = "STOP"

    for line in ai_response.splitlines():
        if line.startswith("Recommended Action:"):
            recommended_action = (
                line.split(":", 1)[1]
                .strip()
                .upper()
            )
            break

    # Evaluate deterministic policy
    policy_result = evaluate_policy(
        transaction_data,
        recommended_action
    )

    return {
        "transaction_id": transaction.transaction_id,

        "ml": {
            "recovery_probability": round(
                recovery_probability,
                4
            ),
            "expected_recovery_value": round(
                expected_recovery,
                2
            )
        },

        "ai": {
            "recommended_action": recommended_action,
            "analysis": ai_response
        },

        "policy": policy_result
    }
# recovery 
@app.post("/recovery")
def run_recovery(transaction: Transaction):

    transaction_data = transaction.model_dump()

    # ================================================
    # ML
    # ================================================

    recovery_probability, expected_recovery = get_recovery_score(
        transaction
    )

    transaction_data["recovery_probability"] = (
        recovery_probability
    )

    transaction_data["expected_recovery_value"] = (
        expected_recovery
    )


    # ================================================
    # AI
    # ================================================

    ai_response = diagnose_payment(
        transaction_data
    )

    recommended_action = "STOP"

    for line in ai_response.splitlines():

        if line.startswith("Recommended Action:"):

            recommended_action = (
                line.split(":", 1)[1]
                .strip()
                .upper()
            )

            break


    # ================================================
    # POLICY
    # ================================================

    policy_result = evaluate_policy(
        transaction_data,
        recommended_action
    )


    # ================================================
    # SIMULATOR
    # ================================================

    final_action = policy_result[
        "final_action"
    ]

    simulation = simulate_recovery(
        transaction_data,
        final_action
    )


    # ================================================
    # AUDIT
    # ================================================

    audit_event = create_audit_event(
        transaction=transaction_data,

        recovery_probability=
            recovery_probability,

        expected_recovery_value=
            expected_recovery,

        ai_recommendation=
            recommended_action,

        policy_result=
            policy_result,

        simulation_result=
            simulation
    )


    # ================================================
    # RESPONSE
    # ================================================

    return {

        "transaction_id":
            transaction.transaction_id,

        "ml": {

            "recovery_probability":
                round(
                    recovery_probability,
                    4
                ),

            "expected_recovery_value":
                round(
                    expected_recovery,
                    2
                )
        },

        "ai": {

            "recommended_action":
                recommended_action,

            "analysis":
                ai_response
        },

        "policy":
            policy_result,

        "recovery":
            simulation,

        "audit":
            audit_event
    }
    
# analytics
@app.get("/analytics")
def get_analytics():

    # ================================================
    # LOAD DATASET
    # ================================================

    df = pd.read_csv(
        "data/transactions.csv"
    )

    failed_df = df[
        df["payment_status"] == "failed"
    ].copy()

    # Evaluate first 100 failed transactions
    batch = failed_df.head(100).copy()


    # ================================================
    # ML FEATURES
    # ================================================

    features = [
        "amount",
        "payment_method",
        "customer_type",
        "subscription_type",
        "failure_reason",
        "retry_count",
        "previous_success_rate",
        "days_since_last_payment",
        "checkout_completed",
        "customer_tenure_days"
    ]

    X_batch = batch[features]


    # ================================================
    # ML PREDICTION
    # ================================================

    probabilities = model.predict_proba(
        X_batch
    )[:, 1]

    batch["recovery_probability"] = probabilities

    batch["expected_recovery_value"] = (
        batch["amount"]
        * batch["recovery_probability"]
    )


    # ================================================
    # METRICS
    # ================================================

    total_failed = len(batch)

    recovery_attempts = 0
    successful_recoveries = 0
    policy_blocks = 0

    revenue_at_risk = batch[
        "amount"
    ].sum()

    expected_recovery = batch[
        "expected_recovery_value"
    ].sum()

    actual_recovered = 0


    # ================================================
    # PROCESS TRANSACTIONS
    # ================================================

    for _, row in batch.iterrows():

        transaction = row.to_dict()

        probability = transaction[
            "recovery_probability"
        ]

        failure_reason = transaction[
            "failure_reason"
        ]


        # --------------------------------------------
        # DETERMINISTIC RECOMMENDATION
        # --------------------------------------------

        if failure_reason in [
            "network_error",
            "bank_timeout"
        ]:

            recommended_action = "RETRY"

        elif failure_reason == "insufficient_funds":

            recommended_action = "REMINDER"

        elif failure_reason == "expired_card":

            recommended_action = (
                "UPDATE_PAYMENT_METHOD"
            )

        else:

            recommended_action = "STOP"


        # --------------------------------------------
        # POLICY
        # --------------------------------------------

        policy_result = evaluate_policy(
            transaction,
            recommended_action
        )


        if policy_result["decision"] == "BLOCK":

            policy_blocks += 1


        # --------------------------------------------
        # SIMULATOR
        # --------------------------------------------

        final_action = policy_result[
            "final_action"
        ]

        simulation = simulate_recovery(
            transaction,
            final_action
        )


        if simulation["status"] == "EXECUTED":

            recovery_attempts += 1


        if simulation["outcome"] == "RECOVERED":

            successful_recoveries += 1

            actual_recovered += transaction[
                "amount"
            ]


    # ================================================
    # FINAL METRICS
    # ================================================

    recovery_rate = (
        successful_recoveries
        / total_failed
        * 100
        if total_failed > 0
        else 0
    )


    attempt_success_rate = (
        successful_recoveries
        / recovery_attempts
        * 100
        if recovery_attempts > 0
        else 0
    )


    # ================================================
    # RESPONSE
    # ================================================

    return {

        "total_failed":
            total_failed,

        "recovery_attempts":
            recovery_attempts,

        "successful_recoveries":
            successful_recoveries,

        "recovery_rate":
            round(
                recovery_rate,
                2
            ),

        "attempt_success_rate":
            round(
                attempt_success_rate,
                2
            ),

        "revenue_at_risk":
            round(
                float(revenue_at_risk),
                2
            ),

        "expected_recovery":
            round(
                float(expected_recovery),
                2
            ),

        "actual_recovered":
            round(
                float(actual_recovered),
                2
            ),

        "policy_blocks":
            policy_blocks
    }

# audit
@app.get("/audit")
def get_audit():

    audit_file = "audit_log.json"

    if not os.path.exists(audit_file):
        return []

    try:
        with open(
            audit_file,
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    except (json.JSONDecodeError, OSError):

        return []
# --------------------------------------------------
# COMPLETE RECOVERY WORKFLOW
# --------------------------------------------------

@app.post("/recover")
def recover(transaction: Transaction):

    # ----------------------------------------------
    # STEP 1 — ML
    # ----------------------------------------------

    (
        recovery_probability,
        expected_recovery_value
    ) = get_recovery_score(
        transaction
    )


    # ----------------------------------------------
    # Add ML result for AI
    # ----------------------------------------------

    transaction_data = transaction.model_dump()

    transaction_data[
        "recovery_probability"
    ] = recovery_probability


    # ----------------------------------------------
    # STEP 2 — GEMINI AI
    # ----------------------------------------------

    ai_response = diagnose_payment(
        transaction_data
    )


    # ----------------------------------------------
    # Extract AI recommendation
    # ----------------------------------------------

    recommended_action = "STOP"

    for action in [
        "RETRY",
        "REMINDER",
        "UPDATE_PAYMENT_METHOD",
        "STOP"
    ]:

        if action in ai_response.upper():

            recommended_action = action
            break


    # ----------------------------------------------
    # STEP 3 — POLICY ENGINE
    # ----------------------------------------------

    policy_result = evaluate_policy(
        transaction_data,
        recommended_action
    )


    # ----------------------------------------------
    # STEP 4 — SIMULATOR
    # ----------------------------------------------

    final_action = policy_result[
        "final_action"
    ]

    simulation_result = simulate_recovery(
        transaction_data,
        final_action
    )


    # ----------------------------------------------
    # STEP 5 — AUDIT TRAIL
    # ----------------------------------------------

    audit_event = create_audit_event(
        transaction_data,
        recovery_probability,
        expected_recovery_value,
        recommended_action,
        policy_result,
        simulation_result
    )


    # ----------------------------------------------
    # FINAL RESPONSE
    # ----------------------------------------------

    return {

        "transaction_id":
            transaction.transaction_id,

        "ml": {

            "recovery_probability":
                round(
                    recovery_probability,
                    4
                ),

            "expected_recovery_value":
                round(
                    expected_recovery_value,
                    2
                )
        },

        "ai": {

            "recommendation":
                recommended_action,

            "analysis":
                ai_response
        },

        "policy": policy_result,

        "execution": simulation_result,

        "audit": {
        key: value
        for key, value in audit_event.items()
        if key != "transaction_id"
      }
    }
@app.get("/metrics")
def get_metrics():

    import pandas as pd

    df = pd.read_csv("data/transactions.csv")

    failed = df[
        df["payment_status"] == "failed"
    ].copy()

    # ML predictions
    features = [
        "amount",
        "payment_method",
        "customer_type",
        "subscription_type",
        "failure_reason",
        "retry_count",
        "previous_success_rate",
        "days_since_last_payment",
        "checkout_completed",
        "customer_tenure_days"
    ]

    probabilities = model.predict_proba(
        failed[features]
    )[:, 1]

    failed["recovery_probability"] = probabilities

    failed["expected_recovery_value"] = (
        failed["amount"]
        * failed["recovery_probability"]
    )

    return {
        "total_failed_payments": len(failed),

        "revenue_at_risk": round(
            float(failed["amount"].sum()),
            2
        ),

        "expected_recovery": round(
            float(
                failed[
                    "expected_recovery_value"
                ].sum()
            ),
            2
        ),

        "failure_reasons": (
            failed
            .groupby("failure_reason")
            .agg(
                transactions=(
                    "failure_reason",
                    "count"
                ),
                revenue_at_risk=(
                    "amount",
                    "sum"
                ),
                avg_recovery_probability=(
                    "recovery_probability",
                    "mean"
                )
            )
            .reset_index()
            .to_dict(orient="records")
        )
    }

@app.get("/audit")
def get_audit():
    import json
    import os

    audit_file = "audit_log.json"

    if not os.path.exists(audit_file):
        return []

    with open(audit_file, "r", encoding="utf-8") as file:
        return json.load(file)