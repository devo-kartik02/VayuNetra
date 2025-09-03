import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

# -------- SETTINGS -------- #
MODEL_PATH = r"C:\Users\kartik\Desktop\Envira 2.0\Models\best_resnet18.pth"
CLASS_NAMES = ["Good", "Moderate", "Severe", "Unhealthy_for_seneitive_groups", "Unhealthy", "Very_Unhealthy"]  # adjust to your dataset
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -------- LOAD MODEL -------- #
model = models.resnet18(weights=None)  # do NOT use pretrained here
num_ftrs = model.fc.in_features

# ⚠️ SAME as training architecture
model.fc = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(num_ftrs, len(CLASS_NAMES))
)

# Load saved weights
state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
model.load_state_dict(state_dict)
model = model.to(DEVICE)
model.eval()

# -------- TRANSFORMS -------- #
transform = transforms.Compose([
    transforms.Resize((224, 224)),   # match training
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# -------- INFERENCE FUNCTION -------- #
def predict_image(img_path):
    image = Image.open(img_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(image)
        _, preds = torch.max(outputs, 1)
        predicted_class = CLASS_NAMES[preds.item()]

    return predicted_class

# -------- TEST -------- #
if __name__ == "__main__":
    test_img = r"C:\Users\kartik\Desktop\Envira 2.0\GAN Data\Testing Img\download (4).jpg"  # replace with actual image
    prediction = predict_image(test_img)
    print(f"Predicted Class: {prediction}")
