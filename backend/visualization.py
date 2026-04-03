import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load dataset
df = pd.read_csv("final_cleaned_dataset.csv")

# -------------------------------
# 1. Histogram (Emission Distribution)
# -------------------------------
plt.figure()
sns.histplot(df["emission"], bins=30, kde=True)
plt.title("Emission Distribution")
plt.savefig("histogram.png")

# -------------------------------
# 2. Scatter Plot (Travel vs Emission)
# -------------------------------
plt.figure()
sns.scatterplot(x=df["travel_km"], y=df["emission"])
plt.title("Travel vs Emission")
plt.savefig("scatter.png")

# -------------------------------
# 3. Electricity vs Emission
# -------------------------------
plt.figure()
sns.scatterplot(x=df["electricity"], y=df["emission"])
plt.title("Electricity vs Emission")
plt.savefig("electricity.png")

# -------------------------------
# 4. Correlation Heatmap
# -------------------------------
plt.figure()
sns.heatmap(df.corr(), annot=True, cmap="coolwarm")
plt.title("Correlation Heatmap")
plt.savefig("heatmap.png")

print("✅ Graphs generated successfully!")