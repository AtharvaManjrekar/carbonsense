import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm, poisson, expon

df = pd.read_csv("final_cleaned_dataset.csv")

data = df["emission"]

# -------------------------------
# NORMAL DISTRIBUTION
# -------------------------------
mu = np.mean(data)
sigma = np.std(data)

x = np.linspace(min(data), max(data), 100)
pdf = norm.pdf(x, mu, sigma)

plt.figure()
plt.hist(data, bins=30, density=True)
plt.plot(x, pdf)
plt.title("Normal Distribution (MLE)")
plt.savefig("mle_normal.png")

# -------------------------------
# POISSON (approx using mean)
# -------------------------------
lam = np.mean(data)

x_p = np.arange(0, 20)
plt.figure()
plt.bar(x_p, poisson.pmf(x_p, lam))
plt.title("Poisson Distribution")
plt.savefig("mle_poisson.png")

# -------------------------------
# EXPONENTIAL
# -------------------------------
lambda_exp = 1 / np.mean(data)

x_e = np.linspace(0, max(data), 100)
plt.figure()
plt.plot(x_e, expon.pdf(x_e, scale=1/lambda_exp))
plt.title("Exponential Distribution")
plt.savefig("mle_exponential.png")

print("✅ MLE done")