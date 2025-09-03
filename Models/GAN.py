import os
import cv2
import numpy as np
from tensorflow.keras import layers
from tensorflow.keras.models import Sequential
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt

# ========================
# GAN Architecture
# ========================

def build_generator(latent_dim, img_shape):
    model = Sequential()
    model.add(layers.Dense(128, activation="relu", input_dim=latent_dim))
    model.add(layers.BatchNormalization())
    model.add(layers.Dense(256, activation="relu"))
    model.add(layers.BatchNormalization())
    model.add(layers.Dense(np.prod(img_shape), activation="tanh"))
    model.add(layers.Reshape(img_shape))
    return model

def build_discriminator(img_shape):
    model = Sequential()
    model.add(layers.Flatten(input_shape=img_shape))
    model.add(layers.Dense(512, activation="relu"))
    model.add(layers.Dense(1, activation="sigmoid"))
    return model

# ========================
# Training Function
# ========================

def train_gan(images, output_dir, target_count, epochs=300, batch_size=32, latent_dim=100):
    img_shape = images[0].shape
    generator = build_generator(latent_dim, img_shape)
    discriminator = build_discriminator(img_shape)

    discriminator.compile(loss="binary_crossentropy", optimizer=Adam(0.0002, 0.5), metrics=["accuracy"])
    discriminator.trainable = False

    # Combined model (Generator + Discriminator)
    gan = Sequential([generator, discriminator])
    gan.compile(loss="binary_crossentropy", optimizer=Adam(0.0002, 0.5))

    real_images = np.array(images) / 127.5 - 1.0  # Normalize to [-1,1]

    half_batch = batch_size // 2

    for epoch in range(epochs):
        # ---------------------
        # Train Discriminator
        # ---------------------
        idx = np.random.randint(0, real_images.shape[0], half_batch)
        real = real_images[idx]

        noise = np.random.normal(0, 1, (half_batch, latent_dim))
        fake = generator.predict(noise)

        d_loss_real = discriminator.train_on_batch(real, np.ones((half_batch, 1)))
        d_loss_fake = discriminator.train_on_batch(fake, np.zeros((half_batch, 1)))
        d_loss = 0.5 * np.add(d_loss_real, d_loss_fake)

        # ---------------------
        # Train Generator
        # ---------------------
        noise = np.random.normal(0, 1, (batch_size, latent_dim))
        g_loss = gan.train_on_batch(noise, np.ones((batch_size, 1)))

        if epoch % 50 == 0:
            print(f"[Epoch {epoch}/{epochs}] D loss: {d_loss[0]:.4f}, acc: {100*d_loss[1]:.2f}% | G loss: {g_loss:.4f}")

    # Generate until target_count is reached
    current_count = len(images)
    needed = target_count - current_count

    if needed > 0:
        os.makedirs(output_dir, exist_ok=True)
        for i in range(needed):
            noise = np.random.normal(0, 1, (1, latent_dim))
            gen_img = generator.predict(noise)[0]
            gen_img = 0.5 * gen_img + 0.5  # Rescale to [0,1]
            gen_img = (gen_img * 255).astype("uint8")

            cv2.imwrite(os.path.join(output_dir, f"gen_{i}.png"), gen_img)

        print(f"Generated {needed} new images for class -> {output_dir}")


# ========================
# Main Balancing Script
# ========================

dataset_path = r"C:\Users\kartik\Desktop\Envira 2.0\GAN Data\All_img"

# Detect class folders
class_folders = [os.path.join(dataset_path, c) for c in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, c))]

# Count images in each class
class_counts = {}
for folder in class_folders:
    count = len([f for f in os.listdir(folder) if f.endswith((".jpg", ".png", ".jpeg"))])
    class_counts[folder] = count

print("Class distribution before balancing:", class_counts)

# Find target size = max class size
target_size = max(class_counts.values())

# Process each class
for folder in class_folders:
    images = []
    for img_name in os.listdir(folder):
        if img_name.endswith((".jpg", ".png", ".jpeg")):
            img_path = os.path.join(folder, img_name)
            img = cv2.imread(img_path)
            img = cv2.resize(img, (64, 64))  # Resize for GAN training
            images.append(img)

    images = np.array(images)
    if len(images) == 0:
        continue

    if len(images) < target_size:
        print(f"Training GAN for class {os.path.basename(folder)} ({len(images)} -> {target_size})...")
        train_gan(images, folder, target_size)
    else:
        print(f"Class {os.path.basename(folder)} already balanced with {len(images)} images.")

print("Dataset balancing completed!")
