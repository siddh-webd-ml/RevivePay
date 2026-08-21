# from datetime import datetime


# def create_audit_event(
#     transaction,
#     recovery_probability,
#     expected_recovery_value,
#     ai_recommendation,
#     policy_result,
#     simulation_result
# ):

#     return {
#         "timestamp": datetime.now().isoformat(),

#         "transaction_id": transaction.get(
#             "transaction_id",
#             "UNKNOWN"
#         ),

#         "amount": transaction["amount"],

#         "recovery_probability": recovery_probability,

#         "expected_recovery_value": expected_recovery_value,

#         "ai_recommendation": ai_recommendation,

#         "policy_decision": policy_result[
#             "decision"
#         ],

#         "final_action": policy_result[
#             "final_action"
#         ],

#         "policy_reason": policy_result[
#             "reason"
#         ],

#         "execution_status": simulation_result[
#             "status"
#         ],

#         "execution_outcome": simulation_result[
#             "outcome"
#         ]
#     }



import json
import os
from datetime import datetime


AUDIT_FILE = "audit_log.json"


def create_audit_event(
    transaction,
    recovery_probability,
    expected_recovery_value,
    ai_recommendation,
    policy_result,
    simulation_result
):

    event = {
        "timestamp": datetime.now().isoformat(),

        "transaction_id": transaction.get(
            "transaction_id",
            "UNKNOWN"
        ),

        "amount": transaction["amount"],

        "recovery_probability": round(
            recovery_probability,
            4
        ),

        "expected_recovery_value": round(
            expected_recovery_value,
            2
        ),

        "ai_recommendation": ai_recommendation,

        "policy_decision": policy_result[
            "decision"
        ],

        "final_action": policy_result[
            "final_action"
        ],

        "policy_reason": policy_result[
            "reason"
        ],

        "execution_status": simulation_result[
            "status"
        ],

        "execution_outcome": simulation_result[
            "outcome"
        ]
    }


    # -----------------------------------------
    # LOAD EXISTING AUDIT LOG
    # -----------------------------------------

    if os.path.exists(AUDIT_FILE):

        try:

            with open(
                AUDIT_FILE,
                "r",
                encoding="utf-8"
            ) as file:

                audit_log = json.load(file)

        except (json.JSONDecodeError, OSError):

            audit_log = []

    else:

        audit_log = []


    # -----------------------------------------
    # ADD NEW EVENT
    # -----------------------------------------

    audit_log.append(event)


    # -----------------------------------------
    # SAVE AUDIT LOG
    # -----------------------------------------

    with open(
        AUDIT_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            audit_log,
            file,
            indent=2
        )


    return event