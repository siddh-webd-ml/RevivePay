from policy import evaluate_policy


def test_case(name, transaction, ai_action):

    result = evaluate_policy(
        transaction,
        ai_action
    )

    print("\n==============================")
    print(name)
    print("==============================")
    print("AI Recommendation:", ai_action)
    print("Policy Decision:", result["decision"])
    print("Final Action:", result["final_action"])
    print("Reason:", result["reason"])


# -----------------------------------------
# CASE 1 — Valid retry
# -----------------------------------------

test_case(
    "CASE 1: Valid Network Retry",

    {
        "amount": 19679.74,
        "failure_reason": "network_error",
        "retry_count": 0,
        "recovery_probability": 0.8224,
        "recovered": 0
    },

    "RETRY"
)


# -----------------------------------------
# CASE 2 — Retry limit exceeded
# -----------------------------------------

test_case(
    "CASE 2: Retry Limit Exceeded",

    {
        "amount": 5000,
        "failure_reason": "network_error",
        "retry_count": 3,
        "recovery_probability": 0.80,
        "recovered": 0
    },

    "RETRY"
)


# -----------------------------------------
# CASE 3 — Expired card
# -----------------------------------------

test_case(
    "CASE 3: Expired Card",

    {
        "amount": 3500,
        "failure_reason": "expired_card",
        "retry_count": 0,
        "recovery_probability": 0.45,
        "recovered": 0
    },

    "UPDATE_PAYMENT_METHOD"
)


# -----------------------------------------
# CASE 4 — Low probability
# -----------------------------------------

test_case(
    "CASE 4: Very Low Recovery Probability",

    {
        "amount": 8000,
        "failure_reason": "network_error",
        "retry_count": 0,
        "recovery_probability": 0.12,
        "recovered": 0
    },

    "RETRY"
)


# -----------------------------------------
# CASE 5 — Invalid AI action
# -----------------------------------------

test_case(
    "CASE 5: Invalid AI Recommendation",

    {
        "amount": 5000,
        "failure_reason": "network_error",
        "retry_count": 0,
        "recovery_probability": 0.80,
        "recovered": 0
    },

    "TRANSFER_MONEY"
)
