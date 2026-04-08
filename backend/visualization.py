from pathlib import Path

import matplotlib
import pandas as pd
import seaborn as sns

matplotlib.use("Agg")
import matplotlib.pyplot as plt


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "final_cleaned_dataset.csv"
OUTPUT_DIR = BASE_DIR


def save_plot(filename):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / filename)
    plt.close()


def generate_visualizations():
    df = pd.read_csv(DATASET_PATH)

    plt.figure()
    sns.histplot(df["emission"], bins=30, kde=True)
    plt.title("Emission Distribution")
    save_plot("histogram.png")

    plt.figure()
    sns.scatterplot(x=df["travel_km"], y=df["emission"])
    plt.title("Travel vs Emission")
    save_plot("scatter.png")

    plt.figure()
    sns.scatterplot(x=df["electricity"], y=df["emission"])
    plt.title("Electricity vs Emission")
    save_plot("electricity.png")

    plt.figure()
    sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm")
    plt.title("Correlation Heatmap")
    save_plot("heatmap.png")

    print("Graphs generated successfully.")


if __name__ == "__main__":
    generate_visualizations()
