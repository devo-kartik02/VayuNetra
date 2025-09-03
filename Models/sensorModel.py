# aqi_full_pipeline_fixed.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
import pickle

# 1. Load dataset
data = pd.read_csv(r"C:\Users\kartik\Desktop\Envira 2.0\Models\processed_sensor_dataset.csv")  # Replace with your path
print(data.head())

# 2. Map AQI_Class to approximate AQI values (midpoints)
class_to_aqi = {0: 25, 1: 75, 2: 125, 3: 175, 4: 250, 5: 400}
data['AQI'] = data['AQI_Class'].map(class_to_aqi)

# 3. Features and targets
X = data[['PM2.5', 'TEMP']]
y_reg = data['AQI']

# 4. Split dataset for regression
X_train, X_test, y_train, y_test = train_test_split(
    X, y_reg, test_size=0.2, random_state=42
)

# 5. Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Save scaler
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

# 6. Train regression model
reg_model = RandomForestRegressor(n_estimators=200, random_state=42)
reg_model.fit(X_train_scaled, y_train)

# Evaluate regression
y_pred = reg_model.predict(X_test_scaled)
print("Regression R2 Score:", r2_score(y_test, y_pred))
print("Regression MSE:", mean_squared_error(y_test, y_pred))

# Save regression model
with open('aqi_model.pkl', 'wb') as f:
    pickle.dump(reg_model, f)

# 7. Train classification model
def aqi_to_class(aqi):
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Severe"

data['AQI_Class'] = data['AQI'].apply(aqi_to_class)
y_class = data['AQI_Class']

# Split for classification
_, _, y_train_class, y_test_class = train_test_split(
    X, y_class, test_size=0.2, random_state=42
)

clf_model = RandomForestClassifier(n_estimators=200, random_state=42)
clf_model.fit(X_train_scaled, y_train_class)

# Evaluate classification
y_pred_class = clf_model.predict(X_test_scaled)
print("\nClassification Accuracy:", accuracy_score(y_test_class, y_pred_class))
print("\nClassification Report:\n", classification_report(y_test_class, y_pred_class))

# Save classification model
with open('aqi_class_model.pkl', 'wb') as f:
    pickle.dump(clf_model, f)

print("\nModels and scaler saved successfully!")

# 8. Real-time prediction function (fixed warning)
def predict_aqi_class_confidence(pm25, temp):
    # Load models and scaler
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    with open('aqi_model.pkl', 'rb') as f:
        reg_model = pickle.load(f)
    with open('aqi_class_model.pkl', 'rb') as f:
        clf_model = pickle.load(f)

    # Pass DataFrame with column names to avoid warning
    X_input = pd.DataFrame([[pm25, temp]], columns=['PM2.5', 'TEMP'])
    X_input_scaled = scaler.transform(X_input)

    # Predict AQI value
    aqi_pred = reg_model.predict(X_input_scaled)[0]

    # Predict AQI class
    class_pred = clf_model.predict(X_input_scaled)[0]

    # Confidence scores
    class_probs = clf_model.predict_proba(X_input_scaled)[0]
    class_confidence = dict(zip(clf_model.classes_, class_probs))

    return aqi_pred, class_pred, class_confidence

# Example usage
pred_aqi, pred_class, confidence = predict_aqi_class_confidence(pm25=120, temp=35)
print(f"Predicted AQI: {pred_aqi:.2f}, AQI Class: {pred_class}")
print("Confidence Scores:", confidence)
