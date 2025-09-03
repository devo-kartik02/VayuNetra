# resume_resnet18.py
import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms
from torchvision.models import resnet18, ResNet18_Weights
from torch.optim import lr_scheduler

# -------------------------
# Config / paths (edit if needed)
# -------------------------
data_dir = r"C:\Users\kartik\Desktop\Envira 2.0\GAN Data\All_img"
checkpoint_path = r"C:\Users\kartik\Desktop\Envira 2.0\Models\best_resnet18.pth"  # your saved state_dict
num_classes = 6
batch_size = 32
extra_epochs = 20               # how many more epochs to run
initial_num_epochs_already_trained = 20  # optional label (not required)
val_split = 0.2
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Early stopping & optimizer params
patience = 5
lr = 0.001                      # same LR you used originally
reduce_factor = 0.1
reduce_patience = 3

# -------------------------
# Sanity checks
# -------------------------
assert os.path.exists(data_dir), f"Data path not found: {data_dir}"
print("Using device:", device)
print("Data path:", data_dir)

# -------------------------
# Transforms (same as original training code)
# -------------------------
data_transforms = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# -------------------------
# Dataset and split (same as original)
# -------------------------
full_dataset = datasets.ImageFolder(data_dir, transform=data_transforms)
n_total = len(full_dataset)
val_size = int(n_total * val_split)
train_size = n_total - val_size
train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])

print(f"Total images: {n_total} | Train: {len(train_dataset)} | Val: {len(val_dataset)}")

train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

# -------------------------
# Model setup (match original EXACT head)
# -------------------------
print("Building model (ResNet18) and replacing fc with the exact head used earlier...")
model = resnet18(weights=ResNet18_Weights.DEFAULT)
# freeze first children exactly as you did previously
child_counter = 0
for child in model.children():
    child_counter += 1
    if child_counter < 7:
        for param in child.parameters():
            param.requires_grad = False

num_ftrs = model.fc.in_features
# This is the exact head you used in training
model.fc = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(num_ftrs, num_classes)
)

model = model.to(device)

# -------------------------
# Load saved state_dict (weights-only checkpoint)
# -------------------------
if os.path.exists(checkpoint_path):
    print("Loading saved weights from:", checkpoint_path)
    state_dict = torch.load(checkpoint_path, map_location=device)
    # load into model (expect exact matching keys)
    model.load_state_dict(state_dict)
    print("Weights loaded successfully — resuming from saved state_dict.")
else:
    print("No checkpoint found at path. Training will start from the pretrained backbone + new head.")

# -------------------------
# Criterion, optimizer, scheduler (recreate optimizer; optimizer state not available)
# -------------------------
criterion = nn.CrossEntropyLoss()
# train only parameters that have requires_grad=True (your head + any unfrozen layers)
trainable_params = filter(lambda p: p.requires_grad, model.parameters())
optimizer = optim.Adam(trainable_params, lr=lr)
scheduler = lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=reduce_factor,
                                           patience=reduce_patience, verbose=True)

# -------------------------
# EarlyStopping (based on val accuracy)
# -------------------------
class EarlyStopping:
    def __init__(self, patience=5):
        self.patience = patience
        self.counter = 0
        self.best_acc = 0.0
        self.early_stop = False

    def step(self, val_acc):
        if val_acc <= self.best_acc:
            self.counter += 1
            print(f"EarlyStopping: no improvement ({self.counter}/{self.patience})")
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_acc = val_acc
            self.counter = 0

early_stopper = EarlyStopping(patience=patience)

# If you know the previous best val acc from earlier training (e.g. 0.8565),
# you can initialize early_stopper.best_acc to that so we only accept improvements over it.
# Set to 0.8565 if that's your known best val acc.
# early_stopper.best_acc = 0.8565
# best_val_acc = early_stopper.best_acc

best_val_acc = 0.0  # track best seen in this resume session (or set to known previous val acc)

# -------------------------
# Training loop (resume)
# -------------------------
total_epochs = extra_epochs
print(f"Starting resume training for {total_epochs} epochs (or until early stopping)...")

for epoch in range(1, total_epochs + 1):
    model.train()
    running_loss = 0.0
    running_corrects = 0
    total_samples = 0

    for i, (inputs, labels) in enumerate(train_loader, start=1):
        inputs = inputs.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        _, preds = torch.max(outputs, 1)
        running_loss += loss.item() * inputs.size(0)
        running_corrects += torch.sum(preds == labels.data).item()
        total_samples += inputs.size(0)

        if i % 20 == 0:
            print(f"  [Batch {i}/{len(train_loader)}] loss: {loss.item():.4f}")

    epoch_loss = running_loss / total_samples
    epoch_acc = running_corrects / total_samples

    # Validation
    model.eval()
    val_loss = 0.0
    val_corrects = 0
    val_samples = 0
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs = inputs.to(device)
            labels = labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)

            _, preds = torch.max(outputs, 1)
            val_loss += loss.item() * inputs.size(0)
            val_corrects += torch.sum(preds == labels.data).item()
            val_samples += inputs.size(0)

    val_loss_avg = val_loss / val_samples
    val_acc = val_corrects / val_samples

    print(f"Epoch {epoch}/{total_epochs}  Train Loss: {epoch_loss:.4f}, Train Acc: {epoch_acc:.4f}  |  Val Loss: {val_loss_avg:.4f}, Val Acc: {val_acc:.4f}")

    # Scheduler step (on validation loss)
    scheduler.step(val_loss_avg)

    # Save best
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), checkpoint_path)
        print(f"Model improved — saved to {checkpoint_path} (Val Acc: {best_val_acc:.4f})")
    else:
        print("No improvement this epoch.")

    # Early stopping check
    early_stopper.step(val_acc)
    if early_stopper.early_stop:
        print("Early stopping triggered. Stopping training.")
        break

print("Resume training finished. Best Val Acc in this session:", best_val_acc)
