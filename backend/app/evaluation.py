import pandas as pd
import joblib

from policy import evaluate_policy
from simulator import simulate_recovery


# ================================================
# LOAD MODEL + DATA
# ================================================

model = joblib.load(
    "ml/revivepay_model.pkl"
)

df = pd.read_csv(
    "data/transactions.csv"
)


# ================================================
# FAILED TRANSACTIONS
# ================================================

failed_df = df[
    df["payment_status"] == "failed"
].copy()


# Use 500 transactions for evaluation
batch = failed_df.head(500).copy()


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


# ================================================
# ML BATCH PREDICTION
# ================================================

batch["recovery_probability"] = model.predict_proba(
    batch[features]
)[:, 1]

batch["expected_recovery_value"] = (
    batch["amount"]
    * batch["recovery_probability"]
)


# ================================================
# RESULT STORAGE
# ================================================

results = []


# ================================================
# PROCESS TRANSACTIONS
# ================================================

for _, row in batch.iterrows():

    transaction = row.to_dict()

    failure_reason = transaction[
        "failure_reason"
    ]

    probability = transaction[
        "recovery_probability"
    ]


    # --------------------------------------------
    # RECOVERY STRATEGY
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


    # --------------------------------------------
    # SIMULATION
    # --------------------------------------------

    simulation = simulate_recovery(
        transaction,
        policy_result["final_action"]
    )


    results.append({

        "failure_reason":
            failure_reason,

        "amount":
            transaction["amount"],

        "recovery_probability":
            probability,

        "expected_recovery_value":
            transaction[
                "expected_recovery_value"
            ],

        "policy_decision":
            policy_result["decision"],

        "final_action":
            policy_result["final_action"],

        "execution_status":
            simulation["status"],

        "outcome":
            simulation["outcome"]

    })


# ================================================
# CREATE RESULTS DATAFRAME
# ================================================

results_df = pd.DataFrame(results)


# ================================================
# FAILURE REASON ANALYSIS
# ================================================

summary = (
    results_df
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
        ),

        expected_recovery=(
            "expected_recovery_value",
            "sum"
        ),

        policy_blocks=(
            "policy_decision",
            lambda x:
            (x == "BLOCK").sum()
        ),

        recovery_attempts=(
            "execution_status",
            lambda x:
            (x == "EXECUTED").sum()
        ),

        successful_recoveries=(
            "outcome",
            lambda x:
            (x == "RECOVERED").sum()
        )

    )
    .reset_index()
)


# ================================================
# RECOVERY RATE
# ================================================

summary["recovery_rate"] = (
    summary["successful_recoveries"]
    / summary["transactions"]
    * 100
)


summary["attempt_success_rate"] = (
    summary["successful_recoveries"]
    / summary["recovery_attempts"]
    * 100
).fillna(0)


# ================================================
# DISPLAY
# ================================================

print("\n========================================")
print(" REVIVEPAY FAILURE REASON ANALYSIS")
print("========================================\n")


display_columns = [
    "failure_reason",
    "transactions",
    "revenue_at_risk",
    "avg_recovery_probability",
    "expected_recovery",
    "policy_blocks",
    "recovery_attempts",
    "successful_recoveries",
    "recovery_rate",
    "attempt_success_rate"
]


print(
    summary[
        display_columns
    ].to_string(
        index=False
    )
)


print("\n========================================")