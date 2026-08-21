import random
from datetime import datetime


def simulate_recovery(transaction, action):
    """
    Simulates a recovery action.
    No real payment is executed.
    """

    action = action.upper().strip()

    # STOP means no recovery attempt
    if action == "STOP":
        return {
            "status": "NOT_EXECUTED",
            "outcome": "STOPPED",
            "message": "Recovery action was stopped by policy.",
            "timestamp": datetime.now().isoformat()
        }

    # Simulated recovery probability
    probability = transaction["recovery_probability"]

    # Different actions have different effectiveness
    action_modifier = {
        "RETRY": 1.00,
        "REMINDER": 0.75,
        "UPDATE_PAYMENT_METHOD": 0.65
    }

    modifier = action_modifier.get(action, 0)

    effective_probability = min(
        probability * modifier,
        0.95
    )

    # Simulate outcome
    recovered = random.random() < effective_probability

    if recovered:
        outcome = "RECOVERED"
    else:
        outcome = "FAILED"

    return {
        "status": "EXECUTED",
        "action": action,
        "outcome": outcome,
        "effective_probability": round(
            effective_probability,
            4
        ),
        "amount": transaction["amount"],
        "timestamp": datetime.now().isoformat()
    }