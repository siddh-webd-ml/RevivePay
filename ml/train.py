import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
import joblib
from sklearn.linear_model import LogisticRegression
# from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score
)


# --------------------------------------------------
# 1. LOAD DATA
# --------------------------------------------------

df = pd.read_csv("../data/transactions.csv")


# We only care about failed payments
df = df[
    df["payment_status"] == "failed"
].copy()


# --------------------------------------------------
# 2. FEATURES + TARGET
# --------------------------------------------------

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

X = df[features]

y = df["recovered"]


# --------------------------------------------------
# 3. CATEGORICAL / NUMERICAL FEATURES
# --------------------------------------------------

categorical_features = [
    "payment_method",
    "customer_type",
    "subscription_type",
    "failure_reason"
]

numerical_features = [
    "amount",
    "retry_count",
    "previous_success_rate",
    "days_since_last_payment",
    "checkout_completed",
    "customer_tenure_days"
]


# --------------------------------------------------
# 4. PREPROCESSING
# --------------------------------------------------

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "numerical",
            StandardScaler(),
            numerical_features
        )
    ]
)


# --------------------------------------------------
# 5. MODEL
# --------------------------------------------------

model = LogisticRegression(
    max_iter=2000,
    class_weight="balanced"
)
# model = RandomForestClassifier(
#     n_estimators=300,
#     max_depth=8,
#     min_samples_leaf=5,
#     class_weight="balanced",
#     random_state=42,
#     n_jobs=-1
# )
# --------------------------------------------------
# 6. PIPELINE
# --------------------------------------------------

pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),

        (
            "model",
            model
        )
    ]
)


# --------------------------------------------------
# 7. TRAIN / TEST SPLIT
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# --------------------------------------------------
# 8. TRAIN
# --------------------------------------------------

pipeline.fit(
    X_train,
    y_train
)


# --------------------------------------------------
# 9. PREDICTION
# --------------------------------------------------

y_pred = pipeline.predict(X_test)

y_probability = pipeline.predict_proba(
    X_test
)[:, 1]

# --------------------------------------------------
# 10. probability
# --------------------------------------------------
recovery_probability = pipeline.predict_proba(X_test)[:, 1]

# test_results = X_test.copy()

# test_results["actual_recovered"] = y_test.values

# test_results["recovery_probability"] = recovery_probability

# test_results["expected_recovery_value"] = (
#     test_results["amount"]
#     * test_results["recovery_probability"]
# )
test_results = X_test.copy()

test_results["actual_recovered"] = y_test

test_results["recovery_probability"] = recovery_probability

test_results["expected_recovery_value"] = (
    test_results["amount"]
    * test_results["recovery_probability"]
)
top_transactions = test_results.sort_values(
    "expected_recovery_value",
    ascending=False
).head(20)

print("\nTop 20 Revenue Recovery Opportunities:")

print(
    top_transactions[
        [
            "amount",
            "failure_reason",
            "recovery_probability",
            "expected_recovery_value",
            "actual_recovered"
        ]
    ].to_string(index=False)
)


# --------------------------------------------------
# 11. EVALUATION
# --------------------------------------------------

print("\n================================")
print(" REVIVEPAY - LOGISTIC REGRESSION")
print("================================")

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred
    )
)


print("\nConfusion Matrix:")

print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


print(
    "\nROC-AUC:",
    round(
        roc_auc_score(
            y_test,
            y_probability
        ),
        4
    )
)

joblib.dump(
    pipeline,
    "revivepay_model.pkl"
)

print("\nModel saved successfully!")