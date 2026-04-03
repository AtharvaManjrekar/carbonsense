import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression

# Load dataset
df = pd.read_csv("final_cleaned_dataset.csv")

# -------------------------------
# 1. CORRELATION MATRIX
# -------------------------------
corr = df.corr()

print("\n📊 Correlation Matrix:")
print(corr)

# Save heatmap again (important for this experiment)
plt.figure()
sns.heatmap(corr, annot=True, cmap="coolwarm")
plt.title("Correlation Matrix")
plt.savefig("correlation_matrix.png")

# -------------------------------
# 2. SIMPLE LINEAR REGRESSION (SLR)
# Travel → Emission
# -------------------------------
X = df[["travel_km"]]
y = df["emission"]

model = LinearRegression()
model.fit(X, y)

# Get coefficients
b0 = model.intercept_
b1 = model.coef_[0]

print("\n📈 SLR Equation:")
print(f"Emission = {b0:.2f} + {b1:.2f} * Travel")

# -------------------------------
# 3. PLOT REGRESSION LINE
# -------------------------------
plt.figure()
sns.scatterplot(x=df["travel_km"], y=df["emission"])
plt.plot(df["travel_km"], model.predict(X), color="red")
plt.title("Simple Linear Regression (Travel vs Emission)")
plt.savefig("slr.png")

print("\n✅ Correlation + SLR completed!")