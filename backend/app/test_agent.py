from agent import diagnose_payment


transaction = {
    "amount": 19679.74,
    "payment_method": "UPI",
    "customer_type": "returning",
    "subscription_type": "monthly",
    "failure_reason": "network_error",
    "retry_count": 0,
    "previous_success_rate": 0.91,
    "days_since_last_payment": 30,
    "checkout_completed": 1,
    "customer_tenure_days": 582,
    "recovery_probability": 0.8224
}


result = diagnose_payment(transaction)

print("\n================================")
print(" REVIVEPAY AI AGENT")
print("================================")

print(result)