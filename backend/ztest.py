import pandas as pd
import numpy as np

df = pd.read_csv("final_cleaned_dataset.csv")

sample = df["emission"].sample(1000)
population_mean = df["emission"].mean()

z = (sample.mean() - population_mean) / (sample.std()/np.sqrt(len(sample)))

print("Z-Test Value:", z)