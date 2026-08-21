# import pandas as pd
# import numpy as np

# np.random.seed(42)

# N = 10000

# # Basic transaction information
# transaction_id = [f"TX{i:06d}" for i in range(1, N + 1)]
# customer_id = [f"C{np.random.randint(1, 3001):05d}" for _ in range(N)]

# amount = np.round(
#     np.random.lognormal(mean=7, sigma=1, size=N),
#     2
# )

# amount = np.clip(amount, 100, 50000)

# payment_method = np.random.choice(
#     ["UPI", "CARD", "NETBANKING", "WALLET"],
#     N,
#     p=[0.55, 0.25, 0.15, 0.05]
# )

# customer_type = np.random.choice(
#     ["new", "returning"],
#     N,
#     p=[0.35, 0.65]
# )

# subscription_type = np.random.choice(
#     ["one_time", "monthly", "yearly"],
#     N,
#     p=[0.45, 0.40, 0.15]
# )

# payment_status = np.random.choice(
#     ["success", "failed"],
#     N,
#     p=[0.72, 0.28]
# )

# failure_reasons = [
#     "insufficient_funds",
#     "bank_timeout",
#     "card_declined",
#     "network_error",
#     "expired_card"
# ]

# failure_reason = []

# for status in payment_status:
#     if status == "failed":
#         failure_reason.append(np.random.choice(failure_reasons))
#     else:
#         failure_reason.append("none")

# retry_count = np.random.randint(0, 4, N)

# previous_success_rate = np.round(
#     np.random.beta(8, 2, N),
#     2
# )

# days_since_last_payment = np.random.randint(1, 365, N)

# checkout_completed = np.random.choice(
#     [0, 1],
#     N,
#     p=[0.15, 0.85]
# )

# customer_tenure_days = np.random.randint(1, 1500, N)


# # -----------------------------
# # Recovery probability
# # -----------------------------

# recovery_score = (
#     0.45 * previous_success_rate
#     + 0.20 * (1 - retry_count / 3)
#     + 0.15 * (customer_type == "returning")
#     + 0.10 * (checkout_completed == 1)
#     + 0.10 * (np.array(failure_reason) == "bank_timeout")
# )

# # Add randomness
# recovery_score += np.random.normal(0, 0.08, N)

# recovery_probability = np.clip(
#     recovery_score,
#     0,
#     1
# )

# # Only failed payments can be recovered
# recovered = (
#     (payment_status == "failed")
#     & (recovery_probability > 0.55)
# ).astype(int)


# # -----------------------------
# # Create DataFrame
# # -----------------------------

# df = pd.DataFrame({
#     "transaction_id": transaction_id,
#     "customer_id": customer_id,
#     "amount": amount,
#     "payment_method": payment_method,
#     "customer_type": customer_type,
#     "subscription_type": subscription_type,
#     "payment_status": payment_status,
#     "failure_reason": failure_reason,
#     "retry_count": retry_count,
#     "previous_success_rate": previous_success_rate,
#     "days_since_last_payment": days_since_last_payment,
#     "checkout_completed": checkout_completed,
#     "customer_tenure_days": customer_tenure_days,
#     "recovered": recovered
# })


# # Save dataset
# df.to_csv("transactions.csv", index=False)

# print("Dataset generated successfully!")
# print(f"Total transactions: {len(df)}")
# print(f"Failed payments: {(df['payment_status'] == 'failed').sum()}")
# print(f"Recovered payments: {df['recovered'].sum()}")
# print("\nFirst 5 rows:")
# print(df.head())

import pandas as pd
import numpy as np

# Reproducible results
rng = np.random.default_rng(42)

N = 10000

# --------------------------------------------------
# 1. BASIC TRANSACTION DATA
# --------------------------------------------------

transaction_id = [f"TX{i:06d}" for i in range(1, N + 1)]

customer_id = [
    f"C{rng.integers(1, 3001):05d}"
    for _ in range(N)
]

# Payment amount
amount = np.round(
    rng.lognormal(mean=7.0, sigma=0.9, size=N),
    2
)

amount = np.clip(amount, 100, 50000)


# --------------------------------------------------
# 2. CUSTOMER / PAYMENT FEATURES
# --------------------------------------------------

payment_method = rng.choice(
    ["UPI", "CARD", "NETBANKING", "WALLET"],
    N,
    p=[0.55, 0.25, 0.15, 0.05]
)

customer_type = rng.choice(
    ["new", "returning"],
    N,
    p=[0.35, 0.65]
)

subscription_type = rng.choice(
    ["one_time", "monthly", "yearly"],
    N,
    p=[0.45, 0.40, 0.15]
)

previous_success_rate = np.round(
    rng.beta(7, 2.5, N),
    2
)

days_since_last_payment = rng.integers(
    1,
    365,
    N
)

checkout_completed = rng.choice(
    [0, 1],
    N,
    p=[0.15, 0.85]
)

customer_tenure_days = rng.integers(
    1,
    1500,
    N
)


# --------------------------------------------------
# 3. PAYMENT STATUS
# --------------------------------------------------

payment_status = rng.choice(
    ["success", "failed"],
    N,
    p=[0.70, 0.30]
)


# --------------------------------------------------
# 4. FAILURE REASON
# --------------------------------------------------

failure_reason = []

for status in payment_status:

    if status == "success":
        failure_reason.append("none")

    else:
        failure_reason.append(
            rng.choice(
                [
                    "bank_timeout",
                    "network_error",
                    "insufficient_funds",
                    "card_declined",
                    "expired_card"
                ],
                p=[
                    0.25,
                    0.20,
                    0.25,
                    0.20,
                    0.10
                ]
            )
        )

failure_reason = np.array(failure_reason)


# --------------------------------------------------
# 5. RETRY COUNT
# --------------------------------------------------

retry_count = np.zeros(N, dtype=int)

failed_mask = payment_status == "failed"

retry_count[failed_mask] = rng.choice(
    [0, 1, 2, 3],
    failed_mask.sum(),
    p=[0.45, 0.30, 0.17, 0.08]
)


# --------------------------------------------------
# 6. BASE RECOVERY PROBABILITY
# --------------------------------------------------

recovery_probability = np.zeros(N)

# Only failed payments are candidates for recovery

for i in range(N):

    if payment_status[i] != "failed":
        continue

    # Start with conservative probability
    p = 0.18

    # Failure reason
    reason_effect = {
        "bank_timeout": 0.20,
        "network_error": 0.18,
        "insufficient_funds": 0.05,
        "card_declined": -0.03,
        "expired_card": -0.10
    }

    p += reason_effect[failure_reason[i]]

    # Returning customer
    if customer_type[i] == "returning":
        p += 0.08

    # Previous payment behaviour
    if previous_success_rate[i] >= 0.85:
        p += 0.10
    elif previous_success_rate[i] < 0.50:
        p -= 0.08

    # Checkout behaviour
    if checkout_completed[i] == 0:
        p -= 0.05

    # Retries reduce likelihood
    p -= retry_count[i] * 0.07

    # Very stale customers
    if days_since_last_payment[i] > 250:
        p -= 0.04

    # Small unobserved/random effects
    p += rng.normal(0, 0.05)

    recovery_probability[i] = np.clip(
        p,
        0.03,
        0.85
    )


# --------------------------------------------------
# 7. HISTORICAL RECOVERY OUTCOME
# --------------------------------------------------

# IMPORTANT:
# We sample from probability rather than using:
# probability > threshold.
#
# This makes the outcome noisy and more realistic.

recovered = np.zeros(N, dtype=int)

for i in range(N):

    if payment_status[i] == "failed":

        recovered[i] = rng.binomial(
            1,
            recovery_probability[i]
        )


# --------------------------------------------------
# 8. CREATE DATAFRAME
# --------------------------------------------------

df = pd.DataFrame({

    "transaction_id": transaction_id,

    "customer_id": customer_id,

    "amount": amount,

    "payment_method": payment_method,

    "customer_type": customer_type,

    "subscription_type": subscription_type,

    "payment_status": payment_status,

    "failure_reason": failure_reason,

    "retry_count": retry_count,

    "previous_success_rate": previous_success_rate,

    "days_since_last_payment": days_since_last_payment,

    "checkout_completed": checkout_completed,

    "customer_tenure_days": customer_tenure_days,

    "recovered": recovered

})


# --------------------------------------------------
# 9. SAVE DATASET
# --------------------------------------------------

df.to_csv(
    "transactions.csv",
    index=False
)


# --------------------------------------------------
# 10. SUMMARY
# --------------------------------------------------

failed_df = df[
    df["payment_status"] == "failed"
]

recovered_df = failed_df[
    failed_df["recovered"] == 1
]

failed_count = len(failed_df)

recovered_count = len(recovered_df)

recovery_rate = (
    recovered_count / failed_count * 100
    if failed_count > 0
    else 0
)

recovered_revenue = recovered_df["amount"].sum()


print("\n================================")
print(" REVIVEPAY DATASET V2")
print("================================")

print(f"\nTotal transactions: {len(df)}")

print(
    f"Successful payments: "
    f"{(df['payment_status'] == 'success').sum()}"
)

print(
    f"Failed payments: {failed_count}"
)

print(
    f"Recovered payments: {recovered_count}"
)

print(
    f"Historical recovery rate: "
    f"{recovery_rate:.2f}%"
)

print(
    f"Historically recovered revenue: "
    f"₹{recovered_revenue:,.2f}"
)

print("\nFailure reason distribution:")

print(
    failed_df["failure_reason"]
    .value_counts()
)

print("\nRecovery by failure reason:")

print(
    failed_df.groupby("failure_reason")["recovered"]
    .agg(["count", "sum", "mean"])
    .sort_values("mean", ascending=False)
)

print("\nDataset saved to transactions.csv")