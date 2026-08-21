import pandas as pd

df = pd.read_csv("../data/transactions.csv")

print("Shape:", df.shape)

print("\nFirst 5 rows:")
print(df.head())

print("\nDataset info:")
print(df.info())

print("\nMissing values:")
print(df.isnull().sum())

print("\nTarget distribution:")
print(df["recovered"].value_counts())

failed_df = df[df["payment_status"] == "failed"].copy()

print("\nFailed transactions:", failed_df.shape)

print("\nFailed payment recovery distribution:")
print(failed_df["recovered"].value_counts())