ALLOWED_ACTIONS = {
    "RETRY",
    "REMINDER",
    "UPDATE_PAYMENT_METHOD",
    "STOP"
}


TRANSIENT_FAILURES = {
    "network_error",
    "bank_timeout"
}


def evaluate_policy(transaction, recommended_action):

    amount = transaction["amount"]
    retry_count = transaction["retry_count"]
    recovery_probability = transaction["recovery_probability"]
    failure_reason = transaction["failure_reason"]

    action = recommended_action.upper().strip()

    # --------------------------------------------------
    # 1. Validate AI action
    # --------------------------------------------------

    if action not in ALLOWED_ACTIONS:

        return {
            "decision": "BLOCK",
            "final_action": "STOP",
            "reason": "AI recommended an unsupported action."
        }


    # --------------------------------------------------
    # 2. Already recovered
    # --------------------------------------------------

    if transaction.get("recovered", 0) == 1:

        return {
            "decision": "BLOCK",
            "final_action": "STOP",
            "reason": "Payment has already been recovered."
        }


    # --------------------------------------------------
    # 3. Maximum retry rule
    # --------------------------------------------------

    if retry_count >= 2 and action == "RETRY":

        return {
            "decision": "BLOCK",
            "final_action": "STOP",
            "reason": "Maximum retry limit reached."
        }


    # --------------------------------------------------
    # 4. Very low recovery probability
    # --------------------------------------------------

    if recovery_probability < 0.20:

        return {
            "decision": "BLOCK",
            "final_action": "STOP",
            "reason": "Recovery probability is below the minimum threshold."
        }


    # --------------------------------------------------
    # 5. RETRY policy
    # --------------------------------------------------

    if action == "RETRY":

        if failure_reason not in TRANSIENT_FAILURES:

            return {
                "decision": "BLOCK",
                "final_action": "STOP",
                "reason": (
                    "Retry is only allowed for transient "
                    "network or bank failures."
                )
            }

        if recovery_probability < 0.50:

            return {
                "decision": "BLOCK",
                "final_action": "STOP",
                "reason": (
                    "Recovery probability is too low "
                    "for an automatic retry."
                )
            }

        return {
            "decision": "ALLOW",
            "final_action": "RETRY",
            "reason": (
                "Transient failure with sufficient "
                "recovery probability."
            )
        }


    # --------------------------------------------------
    # 6. REMINDER policy
    # --------------------------------------------------

    if action == "REMINDER":

        if failure_reason != "insufficient_funds":

            return {
                "decision": "BLOCK",
                "final_action": "STOP",
                "reason": (
                    "Reminder is primarily intended "
                    "for insufficient-funds cases."
                )
            }

        return {
            "decision": "ALLOW",
            "final_action": "REMINDER",
            "reason": (
                "Insufficient funds detected; "
                "customer reminder is appropriate."
            )
        }


    # --------------------------------------------------
    # 7. UPDATE PAYMENT METHOD
    # --------------------------------------------------

    if action == "UPDATE_PAYMENT_METHOD":

        if failure_reason != "expired_card":

            return {
                "decision": "BLOCK",
                "final_action": "STOP",
                "reason": (
                    "Payment-method update is only "
                    "appropriate for expired cards."
                )
            }

        return {
            "decision": "ALLOW",
            "final_action": "UPDATE_PAYMENT_METHOD",
            "reason": (
                "Expired card detected; customer "
                "should update payment method."
            )
        }


    # --------------------------------------------------
    # 8. STOP
    # --------------------------------------------------

    if action == "STOP":

        return {
            "decision": "ALLOW",
            "final_action": "STOP",
            "reason": "AI recommended stopping recovery."
        }


    # --------------------------------------------------
    # 9. Safety fallback
    # --------------------------------------------------

    return {
        "decision": "BLOCK",
        "final_action": "STOP",
        "reason": "Fallback safety rule triggered."
    }