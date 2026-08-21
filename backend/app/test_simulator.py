from simulator import simulate_recovery


transaction = {
    "amount": 19679.74,
    "failure_reason": "network_error",
    "retry_count": 0,
    "recovery_probability": 0.8224,
    "recovered": 0
}


result = simulate_recovery(
    transaction,
    "RETRY"
)


print("\n================================")
print(" REVIVEPAY RECOVERY SIMULATOR")
print("================================")

print("Status:", result["status"])
print("Action:", result["action"])
print("Outcome:", result["outcome"])
print(
    "Effective Probability:",
    result["effective_probability"]
)
print("Amount:", result["amount"])
print("Timestamp:", result["timestamp"])