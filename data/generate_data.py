import pandas as pd
import numpy as np

np.random.seed(42)

N = 10000

# Basic transaction information
transaction_id = [f"TX{i:06d}" for i in range(1, N + 1)]
customer_id = [f"C{np.random.randint(1, 3001):05d}" for _ in range(N)]

amount = np.round(
    np.random.lognormal(mean=7, sigma=1, size=N),
    2
)

amount = np.clip(amount, 100, 50000)

payment_method = np.random.choice(
    ["UPI", "CARD", "NETBANKING", "WALLET"],
    N,
    p=[0.55, 0.25, 0.15, 0.05]
)

customer_type = np.random.choice(
    ["new", "returning"],
    N,
    p=[0.35, 0.65]
)

subscription_type = np.random.choice(
    ["one_time", "monthly", "yearly"],
    N,
    p=[0.45, 0.40, 0.15]
)

payment_status = np.random.choice(
    ["success", "failed"],
    N,
    p=[0.72, 0.28]
)

failure_reasons = [
    "insufficient_funds",
    "bank_timeout",
    "card_declined",
    "network_error",
    "expired_card"
]

failure_reason = []

for status in payment_status:
    if status == "failed":
        failure_reason.append(np.random.choice(failure_reasons))
    else:
        failure_reason.append("none")

retry_count = np.random.randint(0, 4, N)

previous_success_rate = np.round(
    np.random.beta(8, 2, N),
    2
)

days_since_last_payment = np.random.randint(1, 365, N)

checkout_completed = np.random.choice(
    [0, 1],
    N,
    p=[0.15, 0.85]
)

customer_tenure_days = np.random.randint(1, 1500, N)


# -----------------------------
# Recovery probability
# -----------------------------

recovery_score = (
    0.45 * previous_success_rate
    + 0.20 * (1 - retry_count / 3)
    + 0.15 * (customer_type == "returning")
    + 0.10 * (checkout_completed == 1)
    + 0.10 * (np.array(failure_reason) == "bank_timeout")
)

# Add randomness
recovery_score += np.random.normal(0, 0.08, N)

recovery_probability = np.clip(
    recovery_score,
    0,
    1
)

# Only failed payments can be recovered
recovered = (
    (payment_status == "failed")
    & (recovery_probability > 0.55)
).astype(int)


# -----------------------------
# Create DataFrame
# -----------------------------

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


# Save dataset
df.to_csv("transactions.csv", index=False)

print("Dataset generated successfully!")
print(f"Total transactions: {len(df)}")
print(f"Failed payments: {(df['payment_status'] == 'failed').sum()}")
print(f"Recovered payments: {df['recovered'].sum()}")
print("\nFirst 5 rows:")
print(df.head())