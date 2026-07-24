import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import time
import copy

def train_model():
    print("=" * 60)
    print("  MEDICAL AI - X-RAY CNN TRAINING (PyTorch)")
    print("=" * 60)

    data_dir = os.path.join(os.path.dirname(__file__), '../../data/chest_xray')
    
    # Image transformations
    data_transforms = {
        'train': transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(10),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    print("\n[1/5] Loading datasets...")
    image_datasets = {
        x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
        for x in ['train', 'val']
    }
    
    # Handle class imbalance in train dataset
    train_targets = image_datasets['train'].targets
    num_normal = train_targets.count(0)
    num_pneumonia = train_targets.count(1)
    
    # Calculate weights for loss function
    weight_normal = (num_normal + num_pneumonia) / (2.0 * num_normal)
    weight_pneumonia = (num_normal + num_pneumonia) / (2.0 * num_pneumonia)
    class_weights = torch.FloatTensor([weight_normal, weight_pneumonia])
    
    dataloaders = {
        x: DataLoader(image_datasets[x], batch_size=32, shuffle=(x == 'train'), num_workers=4)
        for x in ['train', 'val']
    }
    
    dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
    class_names = image_datasets['train'].classes
    
    print(f"   Train: {dataset_sizes['train']} | Val: {dataset_sizes['val']}")
    print(f"   Classes: {class_names}")

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"\n[2/5] Initializing MobileNetV2 on {device}...")
    
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    # Freeze earlier layers to speed up training
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace classifier
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, 2)
    model = model.to(device)
    
    class_weights = class_weights.to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.Adam(model.classifier[1].parameters(), lr=0.001)

    print("\n[3/5] Training model (1 epoch for speed/demonstration)...")
    num_epochs = 1
    
    since = time.time()
    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0

    for epoch in range(num_epochs):
        print(f'Epoch {epoch}/{num_epochs - 1}')
        print('-' * 10)

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_model_wts = copy.deepcopy(model.state_dict())
        print()

    time_elapsed = time.time() - since
    print(f"\n[4/5] Training complete in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
    print(f"Best val Acc: {best_acc:4f}")

    print("\n[5/5] Saving model...")
    model.load_state_dict(best_model_wts)
    
    os.makedirs(os.path.join(os.path.dirname(__file__), 'models'), exist_ok=True)
    save_path = os.path.join(os.path.dirname(__file__), 'models', 'xray_cnn_model.pth')
    
    torch.save({
        'model_state_dict': model.state_dict(),
        'class_names': class_names
    }, save_path)
    
    print(f"  Saved: {save_path}")

if __name__ == '__main__':
    # Due to Windows multiprocessing with dataloader, we need freeze_support
    import multiprocessing
    multiprocessing.freeze_support()
    train_model()
