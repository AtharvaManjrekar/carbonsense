import pandas as pd

# Load dataset
# df = pd.read_csv("final_dataset1.xlsx")
df = pd.read_excel("final_dataset1.xlsx")

# Remove unwanted empty columns (important)
df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

# -------------------------------
# Encode transport column
# -------------------------------
df["transport_encoded"] = df["transport"].astype("category").cat.codes

# Show mapping
transport_mapping = dict(enumerate(df["transport"].astype("category").cat.categories))
print("\n🚗 Transport Mapping:")
print(transport_mapping)

# -------------------------------
# Drop old transport column
# -------------------------------
df = df.drop("transport", axis=1)

# Rename encoded column
df = df.rename(columns={"transport_encoded": "transport"})

# -------------------------------
# Save cleaned dataset
# -------------------------------
df.to_csv("final_cleaned_dataset.csv", index=False)

print("\n✅ Final cleaned dataset saved successfully!")
print("Shape:", df.shape)