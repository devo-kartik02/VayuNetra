import serial
import csv
import time
from datetime import datetime
import os
from collections import deque

# ------------------------------
# Connect to Arduino
# ------------------------------
try:
    ser = serial.Serial('COM7', 115200, timeout=1)
    time.sleep(2)
    print("Arduino connected on COM7")
except serial.SerialException as e:
    print(f"Error: {e}")
    print("Please check the port number and ensure the Arduino is connected.")
    exit()

# ------------------------------
# CSV setup
# ------------------------------
file_name = "sensor_data.csv"
fields = ["timestamp", "pm25_ug_m3", "gas_ppm"]

file_exists = os.path.isfile(file_name)

with open(file_name, 'a', newline='') as f:
    writer = csv.writer(f)
    if not file_exists:
        writer.writerow(fields)

print("Logging PM2.5 + Gas sensor data... Press Ctrl+C to stop.")

# ------------------------------
# Gas sensor smoothing buffer
# ------------------------------
gas_buffer = deque(maxlen=5)  # keep last 5 readings for moving average

# ------------------------------
# Main loop
# ------------------------------
try:
    while True:
        # Read from Arduino
        line = ser.readline().decode("utf-8", errors="ignore").strip()

        # Skip empty or invalid lines
        if not line or not line[0].isdigit():
            time.sleep(0.1)
            continue

        try:
            parts = line.split(",")
            if len(parts) == 3:
                timestamp_ms = float(parts[0])
                raw_pm25 = float(parts[1])
                raw_gas = float(parts[2])

                # ------------------------------
                # Adjust PM2.5 to realistic range
                # ------------------------------
                pm25 = max(round(raw_pm25, 2), 0.0)

                # ------------------------------
                # Adjust Gas sensor value
                # ------------------------------
                # Example calibration factor: divide by 10
                gas_ppm_calibrated = max(round(raw_gas / 10, 2), 0.0)

                # Moving average smoothing
                gas_buffer.append(gas_ppm_calibrated)
                gas_smoothed = round(sum(gas_buffer) / len(gas_buffer), 2)

            else:
                continue

        except (ValueError, IndexError) as e:
            print("Parse error:", str(e), " Line:", line)
            continue

        # ------------------------------
        # Timestamp
        # ------------------------------
        pc_time = time.strftime("%Y-%m-%d %H:%M:%S")

        # ------------------------------
        # Write to CSV
        # ------------------------------
        with open(file_name, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([pc_time, pm25, gas_smoothed])

        # ------------------------------
        # Print to console
        # ------------------------------
        print(f"[REAL] {pc_time} -> PM2.5: {pm25} µg/m³ | Gas: {gas_smoothed} ppm")

        # Delay between readings
        time.sleep(5)

except KeyboardInterrupt:
    print("\nStopped logging.")
    ser.close()
