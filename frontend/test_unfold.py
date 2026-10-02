import numpy as np

arr = np.random.randn(7, 101, 241)
pad = 4
import torch
# We want to extract 9x9 patches for every pixel from (4, 4) to (101-4, 241-4)
# Actually, just unfold:
t = torch.tensor(arr).unsqueeze(0) # (1, 7, 101, 241)
# Unfold: kernel_size=9, stride=1, padding=0
patches = torch.nn.functional.unfold(t, kernel_size=9, stride=1)
# patches is (1, 7*9*9, L) where L is (101-8) * (241-8)
patches = patches.transpose(1, 2).reshape(-1, 7, 9, 9)
print(patches.shape)
