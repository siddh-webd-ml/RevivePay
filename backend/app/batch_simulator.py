# import pandas as pd
# import joblib

# from agent import diagnose_payment
# from policy import evaluate_policy
# from simulator import simulate_recovery

# # --------------------------------------------------
# # LOAD MODEL + DATA
# # --------------------------------------------------

# model = joblib.load(
#     "ml/revivepay_model.pkl"
# )

# df = pd.read_csv(
#     "data/transactions.csv"
# )


# # Only failed transactions
# failed_df = df[
#     df["payment_status"] == "failed"
# ].copy()


# # Take first 50 for our evaluation batch
# batch = failed_df.head(50).copy()


# # --------------------------------------------------
# # METRICS
# # --------------------------------------------------

# total_failed = len(batch)

# recovery_attempts = 0
# successful_recoveries = 0

# total_amount = 0
# expected_revenue = 0
# actual_revenue = 0

# policy_blocks = 0


# # --------------------------------------------------
# # PROCESS BATCH
# # --------------------------------------------------

# for _, row in batch.iterrows():

#     transaction = row.to_dict()

#     # ----------------------------------------------
#     # ML SCORE
#     # ----------------------------------------------

#     features = {
#         key: transaction[key]
#         for key in [
#             "amount",
#             "payment_method",
#             "customer_type",
#             "subscription_type",
#             "failure_reason",
#             "retry_count",
#             "previous_success_rate",
#             "days_since_last_payment",
#             "checkout_completed",
#             "customer_tenure_days"
#         ]
#     }

#     input_df = pd.DataFrame(
#         [features]
#     )

#     probability = model.predict_proba(
#         input_df
#     )[0][1]

#     expected_value = (
#         transaction["amount"]
#         * probability
#     )


#     transaction[
#         "recovery_probability"
#     ] = probability


#     # ----------------------------------------------
#     # GEMINI AI
#     # ----------------------------------------------

#     ai_response = diagnose_payment(
#         transaction
#     )


#     # ----------------------------------------------
#     # EXTRACT RECOMMENDATION
#     # ----------------------------------------------

#     recommended_action = "STOP"

#     for action in [
#         "RETRY",
#         "REMINDER",
#         "UPDATE_PAYMENT_METHOD",
#         "STOP"
#     ]:

#         if action in ai_response.upper():

#             recommended_action = action
#             break


#     # ----------------------------------------------
#     # POLICY
#     # ----------------------------------------------

#     policy_result = evaluate_policy(
#         transaction,
#         recommended_action
#     )


#     if policy_result["decision"] == "BLOCK":

#         policy_blocks += 1


#     # ----------------------------------------------
#     # SIMULATE
#     # ----------------------------------------------

#     final_action = policy_result[
#         "final_action"
#     ]

#     simulation = simulate_recovery(
#         transaction,
#         final_action
#     )


#     # ----------------------------------------------
#     # METRICS
#     # ----------------------------------------------

#     total_amount += transaction["amount"]

#     expected_revenue += expected_value


#     if simulation["status"] == "EXECUTED":

#         recovery_attempts += 1


#     if simulation["outcome"] == "RECOVERED":

#         successful_recoveries += 1

#         actual_revenue += transaction["amount"]


# # --------------------------------------------------
# # FINAL METRICS
# # --------------------------------------------------

# recovery_rate = (
#     successful_recoveries
#     / total_failed
#     * 100
#     if total_failed
#     else 0
# )


# # --------------------------------------------------
# # RESULTS
# # --------------------------------------------------

# print("\n========================================")
# print(" REVIVEPAY BATCH RECOVERY")
# print("========================================")

# print(
#     f"\nTransactions evaluated: {total_failed}"
# )

# print(
#     f"Recovery attempts: {recovery_attempts}"
# )

# print(
#     f"Successful recoveries: {successful_recoveries}"
# )

# print(
#     f"Recovery rate: {recovery_rate:.2f}%"
# )

# print(
#     f"\nRevenue at risk: ₹{total_amount:,.2f}"
# )

# print(
#     f"Expected recovery: ₹{expected_revenue:,.2f}"
# )

# print(
#     f"Actual simulated recovery: ₹{actual_revenue:,.2f}"
# )

# print(
#     f"\nPolicy blocks: {policy_blocks}"
# )

# print("\n========================================")


import pandas as pd
import joblib

from policy import evaluate_policy
from simulator import simulate_recovery


# ================================================
# LOAD MODEL
# ================================================

model = joblib.load(
    "ml/revivepay_model.pkl"
)


# ================================================
# LOAD DATASET
# ================================================

df = pd.read_csv(
    "data/transactions.csv"
)


# Only failed payments
failed_df = df[
    df["payment_status"] == "failed"
].copy()


# Evaluate 100 transactions
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
# BATCH ML PREDICTION
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

revenue_at_risk = batch["amount"].sum()

expected_recovery = (
    batch["expected_recovery_value"].sum()
)

actual_recovered = 0


# ================================================
# PROCESS EACH TRANSACTION
# ================================================

for _, row in batch.iterrows():

    transaction = row.to_dict()

    probability = transaction[
        "recovery_probability"
    ]

    failure_reason = transaction[
        "failure_reason"
    ]

    retry_count = transaction[
        "retry_count"
    ]


    # --------------------------------------------
    # DETERMINISTIC AI-LIKE RECOMMENDATION
    # --------------------------------------------

    if failure_reason in [
        "network_error",
        "bank_timeout"
    ]:

        recommended_action = "RETRY"

    elif failure_reason == "insufficient_funds":

        recommended_action = "REMINDER"

    elif failure_reason == "expired_card":

        recommended_action = "UPDATE_PAYMENT_METHOD"

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
)


attempt_success_rate = (
    successful_recoveries
    / recovery_attempts
    * 100
    if recovery_attempts > 0
    else 0
)


# ================================================
# DISPLAY RESULTS
# ================================================

print("\n========================================")
print(" REVIVEPAY BATCH RECOVERY")
print("========================================")

print(
    f"\nTransactions evaluated: {total_failed}"
)

print(
    f"Recovery attempts: {recovery_attempts}"
)

print(
    f"Successful recoveries: {successful_recoveries}"
)

print(
    f"Recovery rate: {recovery_rate:.2f}%"
)

print(
    f"Attempt success rate: "
    f"{attempt_success_rate:.2f}%"
)

print(
    f"\nRevenue at risk: "
    f"₹{revenue_at_risk:,.2f}"
)

print(
    f"Expected recovery: "
    f"₹{expected_recovery:,.2f}"
)

print(
    f"Actual simulated recovery: "
    f"₹{actual_recovered:,.2f}"
)

print(
    f"\nPolicy blocks: {policy_blocks}"
)

print("\n========================================")