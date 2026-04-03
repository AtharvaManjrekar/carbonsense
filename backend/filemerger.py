import pandas as pd

ml_df = pd.read_csv("dataset2.csv")         # distance_km dataset
lifestyle_df = pd.read_csv("dataset1.csv")  # Body Type dataset

# Clean column names
lifestyle_df.columns = lifestyle_df.columns.str.strip()
ml_df.columns = ml_df.columns.str.strip()

print("ML DATASET:", ml_df.columns)
print("LIFESTYLE DATASET:", lifestyle_df.columns)

ml_df = ml_df[[
    "distance_km",
    "electricity_kwh",
    "food_type",
    "screen_time_hours",
    "waste_generated_kg",
    "transport_mode",
    "carbon_footprint_kg"
]]

lifestyle_df = lifestyle_df[[
    "Vehicle Monthly Distance Km",
    "Diet",
    "How Long TV PC Daily Hour",
    "Waste Bag Weekly Count",
    "Transport",
    "CarbonEmission"
]]


# Rename ML dataset
ml_df.columns = [
    "travel_km",
    "electricity",
    "food",
    "screen_time",
    "waste",
    "transport",
    "emission"
]

# Rename lifestyle dataset
lifestyle_df.columns = [
    "travel_km",
    "food",
    "screen_time",
    "waste",
    "transport",
    "emission"
]

lifestyle_df["electricity"] = ml_df["electricity"].mean()

lifestyle_df = lifestyle_df[[
    "travel_km",
    "electricity",
    "food",
    "screen_time",
    "waste",
    "transport",
    "emission"
]]

final_df = pd.concat([ml_df, lifestyle_df], ignore_index=True)

final_df.to_csv("final_dataset.csv", index=False)

print("Final dataset created successfully ✅")
print("Total rows:", len(final_df))