import pandas as pd
from scipy.stats import ttest_ind

df = pd.read_csv("final_cleaned_dataset.csv")

# Split veg vs non-veg
group1 = df[df["food_encoded"] == 0]["emission"]
group2 = df[df["food_encoded"] == 1]["emission"]

t_stat, p_value = ttest_ind(group1, group2)

print("T-Test Result:")
print("t-stat:", t_stat)
print("p-value:", p_value)