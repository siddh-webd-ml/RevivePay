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
import joblib
import pandas as pd

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