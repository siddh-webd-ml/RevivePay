import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=api_key)


def diagnose_payment(transaction):

    prompt = f"""
You are RevivePay, an AI revenue recovery assistant for merchants.

Analyze the following failed payment and recommend ONE safe recovery action.

TRANSACTION:
Amount: ₹{transaction['amount']}
Payment Method: {transaction['payment_method']}
Customer Type: {transaction['customer_type']}
Subscription: {transaction['subscription_type']}
Failure Reason: {transaction['failure_reason']}
Retry Count: {transaction['retry_count']}
Previous Success Rate: {transaction['previous_success_rate']}
Checkout Completed: {transaction['checkout_completed']}
Customer Tenure: {transaction['customer_tenure_days']} days
Recovery Probability: {transaction['recovery_probability']}

AVAILABLE ACTIONS:
- RETRY
- REMINDER
- UPDATE_PAYMENT_METHOD
- STOP

RULES:
1. Never execute a payment.
2. Only recommend an action.
3. If retry_count >= 2, recommend STOP.
4. If recovery probability is very low, recommend STOP.
5. Network errors and bank timeouts can usually justify RETRY.
6. Insufficient funds can justify REMINDER.
7. Expired cards can justify UPDATE_PAYMENT_METHOD.
8. Card declines should be handled conservatively.
9. Do not invent information.

Return exactly this format:

Diagnosis: <short diagnosis>
Recommended Action: <one action from the list>
Reason: <short explanation>
Confidence: <High/Medium/Low>
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return response.text

    except Exception as e:

        print(
            f"Gemini unavailable: {e}"
        )

        # Safe fallback
        failure_reason = transaction[
            "failure_reason"
        ]

        probability = transaction[
            "recovery_probability"
        ]

        if failure_reason in [
            "network_error",
            "bank_timeout"
        ] and probability >= 0.50:

            return """
    Diagnosis: Temporary payment infrastructure failure.
    Recommended Action: RETRY
    Reason: Safe deterministic fallback because the AI service is temporarily unavailable.
    Confidence: Medium
    """

        elif failure_reason == "insufficient_funds":

            return """
    Diagnosis: Insufficient funds detected.
    Recommended Action: REMINDER
    Reason: Safe deterministic fallback because the AI service is temporarily unavailable.
    Confidence: Medium
    """

        elif failure_reason == "expired_card":

            return """
    Diagnosis: Expired payment method.
    Recommended Action: UPDATE_PAYMENT_METHOD
    Reason: Safe deterministic fallback because the AI service is temporarily unavailable.
    Confidence: Medium
    """

        else:

            return """
    Diagnosis: Payment failure requires conservative handling.
    Recommended Action: STOP
    Reason: AI service unavailable and no safe automatic recovery action was identified.
    Confidence: Low
    """