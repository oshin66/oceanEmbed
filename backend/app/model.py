import torch
import torch.nn as nn
import threading
from .config import settings
import os

class OceanEmbedCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(7, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, 15)
        )

    def forward(self, x):
        return self.net(x)


device = None
model_instance = None
model_loaded = False
_inference_lock = threading.Lock()


def _resolve_device(requested: str) -> torch.device:
    """
    Resolve the requested device string to a torch.device.
    Falls back to CPU if the requested device is unavailable.
    MPS is kept as an option but must be explicitly requested AND verified.
    """
    req = requested.strip().lower()
    if req == "mps":
        if torch.backends.mps.is_available() and torch.backends.mps.is_built():
            return torch.device("mps")
        else:
            print("[OceanEmbed] WARNING: MPS requested but unavailable — falling back to CPU")
            return torch.device("cpu")
    else:
        return torch.device("cpu")


def load_model():
    global device, model_instance, model_loaded

    # Resolve device from settings (DEVICE env var, defaults to "cpu")
    device = _resolve_device(settings.device)
    print(f"[OceanEmbed] Resolved device: {device}")

    # Safety: limit CPU threads to avoid tensor iterator race conditions
    if device.type == "cpu":
        torch.set_num_threads(1)
        print(f"[OceanEmbed] CPU threads set to 1 for stable inference")

    if not os.path.exists(settings.model_path):
        raise FileNotFoundError(f"Model checkpoint not found at {settings.model_path}")

    # Always load weights onto the resolved device
    model_instance = OceanEmbedCNN().to(device)
    ckpt = torch.load(
        settings.model_path,
        map_location=device,
        weights_only=False
    )
    model_instance.load_state_dict(ckpt['model_state_dict'])
    model_instance.eval()
    # Freeze all parameters — read-only after load
    for param in model_instance.parameters():
        param.requires_grad_(False)

    model_loaded = True
    print(f"[OceanEmbed] MODEL DEVICE: {device}")
    print(f"[OceanEmbed] MODEL LOADED: true")


def predict_cnn(tensor_x: torch.Tensor) -> "np.ndarray":
    """
    Run inference on tensor_x.
    - tensor_x must already be on CPU (we move it to device here)
    - Uses a lock to prevent concurrent inference
    - Logs shape and device before/after
    """
    import numpy as np

    with _inference_lock:
        print(f"[OceanEmbed] PREDICT START | device={device} | input_shape={tuple(tensor_x.shape)}")

        # Ensure input is on the correct device
        x = tensor_x.to(device)
        print(f"[OceanEmbed] tensor device={x.device} | dtype={x.dtype}")

        with torch.no_grad():
            out = model_instance(x)

        result = out.cpu().numpy()
        print(f"[OceanEmbed] PREDICT COMPLETE | output_shape={result.shape}")
        return result
