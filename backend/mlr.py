import pandas as pd
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt
from sklearn.metrics import r2_score

# -------------------------------
# Load dataset
# -------------------------------
df = pd.read_csv("final_cleaned_dataset.csv")

# -------------------------------
# MULTIPLE LINEAR REGRESSION
# -------------------------------
X = df[["travel_km", "electricity", "food_encoded", "screen_time", "waste"]]
y = df["emission"]

model = LinearRegression()
model.fit(X, y)

# -------------------------------
# Print coefficients
# -------------------------------
print("\n📊 Coefficients:")
for col, coef in zip(X.columns, model.coef_):
    print(f"{col}: {coef}")

print("\nIntercept:", model.intercept_)

# -------------------------------
# Prediction for full dataset
# -------------------------------
y_pred = model.predict(X)

# -------------------------------
# FULL DATASET GRAPH (POPULATION)
# -------------------------------
plt.figure(figsize=(8,6))
plt.scatter(y, y_pred, alpha=0.3)
plt.xlabel("Actual Emission")
plt.ylabel("Predicted Emission")
plt.title("MLR (Full Dataset - Population)")
plt.savefig("mlr_full.png")
plt.close()

# -------------------------------
# SAMPLE GRAPH (SAMPLING)
# -------------------------------
sample_df = df.sample(1000, random_state=42)

X_sample = sample_df[X.columns]
y_sample = sample_df["emission"]
y_pred_sample = model.predict(X_sample)

plt.figure(figsize=(8,6))
plt.scatter(y_sample, y_pred_sample, alpha=0.5)

# Ideal prediction line
plt.plot(
    [y_sample.min(), y_sample.max()],
    [y_sample.min(), y_sample.max()],
    color="red",
    linestyle="--"
)

plt.xlabel("Actual Emission")
plt.ylabel("Predicted Emission")
plt.title("MLR (Sampled Data - 1000 rows)")
plt.savefig("mlr_sample.png")
plt.close()

r2 = r2_score(y, y_pred)
print("R2 Score:", r2)

print("\n✅ MLR + Sampling completed!")