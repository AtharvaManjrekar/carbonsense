import pandas as pd

# Load your final dataset
df = pd.read_csv("final_dataset.csv")

print("\n✅ First 5 rows:")
print(df.head())

# -------------------------------
# 1. CHECK MISSING VALUES
# -------------------------------
print("\n🔍 Missing Values:")
print(df.isnull().sum())

# -------------------------------
# 2. CHECK DATA TYPES
# -------------------------------
print("\n📊 Data Types:")
print(df.dtypes)

# -------------------------------
# 3. BASIC STATISTICS
# -------------------------------
print("\n📈 Summary Statistics:")
print(df.describe())

# -------------------------------
# 4. UNIQUE VALUES (IMPORTANT)
# -------------------------------
print("\n🍽 Food Column Values:")
print(df["food"].unique())

print("\n🚗 Transport Column Values:")
print(df["transport"].unique())

# -------------------------------
# 5. DATASET SIZE
# -------------------------------
print("\n📦 Dataset Shape (rows, columns):")
print(df.shape)

