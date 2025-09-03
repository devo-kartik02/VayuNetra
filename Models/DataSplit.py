import os
import shutil
import random

# Path to your dataset
dataset_path = r"C:\Users\kartik\Desktop\Envira 2.0\Data\All_img"

# Get all class folders
class_folders = [f for f in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, f))]

# Count images in each folder
class_counts = {}
for folder in class_folders:
    folder_path = os.path.join(dataset_path, folder)
    class_counts[folder] = len(os.listdir(folder_path))

print("Class distribution before balancing:", class_counts)

# Find max count
max_count = max(class_counts.values())

# Oversample each class to match max_count
for folder in class_folders:
    folder_path = os.path.join(dataset_path, folder)
    images = os.listdir(folder_path)
    count = len(images)
    
    if count < max_count:
        print(f"Oversampling class {folder} from {count} -> {max_count}")
        while len(images) < max_count:
            img = random.choice(images)
            src = os.path.join(folder_path, img)
            new_img_name = f"copy_{len(images)}_{img}"
            dst = os.path.join(folder_path, new_img_name)
            shutil.copy(src, dst)
            images.append(new_img_name)

# Re-check distribution
new_class_counts = {}
for folder in class_folders:
    folder_path = os.path.join(dataset_path, folder)
    new_class_counts[folder] = len(os.listdir(folder_path))

print("Class distribution after balancing:", new_class_counts)
