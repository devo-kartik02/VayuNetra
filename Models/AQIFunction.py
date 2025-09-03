import pandas as pd

# AQI breakpoints for PM2.5
def pm25_to_aqi(pm25):
    if pm25 <= 12.0:
        return 0  # Good
    elif pm25 <= 35.4:
        return 1  # Moderate
    elif pm25 <= 55.4:
        return 2  # Unhealthy for Sensitive
    elif pm25 <= 150.4:
        return 3  # Unhealthy
    elif pm25 <= 250.4:
        return 4  # Very Unhealthy
    else:
        return 5  # Hazardous

# Load your dataset
df = pd.read_csv(r"C:\Users\kartik\Desktop\Envira 2.0\dataset\PRSA_Data_Wanshouxigong_20130301-20170228.csv")

# Keep only needed columns
df = df[["PM2.5", "TEMP"]].copy()

# Create AQI_Class column
df["AQI_Class"] = df["PM2.5"].apply(pm25_to_aqi)

# Save processed dataset
df.to_csv("processed_sensor_dataset.csv", index=False)

print(df.head())
