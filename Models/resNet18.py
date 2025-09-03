import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
from torch.optim import lr_scheduler
from torchvision.models import resnet18, ResNet18_Weights
import os

# ====== Paths ======
data_dir = r"C:\Users\kartik\Desktop\Envira 2.0\GAN Data\All_img"
assert os.path.exists(data_dir), f"Dataset path does not exist: {data_dir}"

num_classes = 6  # adjust according to your dataset
batch_size = 32
num_epochs = 20 
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
val_split = 0.2  # 20% for validation

print(f"Using device: {device}")

# ====== Data Augmentation ======
data_transforms = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ====== Dataset & Train/Val Split ======
print("Loading dataset...")
full_dataset = datasets.ImageFolder(data_dir, transform=data_transforms)
print(f"Total images found: {len(full_dataset)} in {data_dir}")

val_size = int(len(full_dataset) * val_split)
train_size = len(full_dataset) - val_size
train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
print(f"Train size: {len(train_dataset)}, Val size: {len(val_dataset)}")

train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

# ====== Model Setup ======
print("Setting up model...")
model = resnet18(weights=ResNet18_Weights.DEFAULT)

# Unfreeze last two layers for fine-tuning
child_counter = 0
for child in model.children():
    child_counter += 1
    if child_counter < 7:  # freeze first 6 layers
        for param in child.parameters():
            param.requires_grad = False

# Replace the classifier
num_ftrs = model.fc.in_features
model.fc = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(num_ftrs, num_classes)
)

model = model.to(device)

# ====== Loss and Optimizer ======
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=0.001)
scheduler = lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3, verbose=True)

# ====== Training Loop ======
print("Starting training...")
best_val_acc = 0.0

for epoch in range(num_epochs):
    print(f"\nEpoch {epoch+1}/{num_epochs}")
    model.train()
    running_loss = 0.0
    running_corrects = 0
    
    for i, (inputs, labels) in enumerate(train_loader):
        inputs, labels = inputs.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        _, preds = torch.max(outputs, 1)
        running_loss += loss.item() * inputs.size(0)
        running_corrects += torch.sum(preds == labels.data)

        if (i+1) % 10 == 0:
            print(f"  [Batch {i+1}/{len(train_loader)}] loss: {loss.item():.4f}")

    epoch_loss = running_loss / len(train_dataset)
    epoch_acc = running_corrects.double() / len(train_dataset)
    
    # Validation
    model.eval()
    val_loss = 0.0
    val_corrects = 0
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            _, preds = torch.max(outputs, 1)
            val_loss += loss.item() * inputs.size(0)
            val_corrects += torch.sum(preds == labels.data)
    
    val_loss = val_loss / len(val_dataset)
    val_acc = val_corrects.double() / len(val_dataset)
    
    scheduler.step(val_loss)
    
    print(f"Train Loss: {epoch_loss:.4f}, Train Acc: {epoch_acc:.4f} | "
          f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}")
    
    # Save best model
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), "best_resnet18.pth")
        print("Model saved!")

print("Training Complete. Best Val Acc:", best_val_acc)


