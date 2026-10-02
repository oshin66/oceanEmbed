import os
import re

directory = '/Users/oshinmendhe10gmail.com/Documents/earth2/src/components/UI'

replacements = {
    'text-cyan-400': 'text-white',
    'text-cyan-300': 'text-white',
    'text-cyan-200': 'text-white',
    'text-cyan-100': 'text-white',
    'text-cyan-50': 'text-white',
    'text-cyan-500': 'text-white',
    'text-cyan-200/70': 'text-white/70',
    'text-cyan-200/50': 'text-white/50',
    'text-cyan-500/10': 'text-white/10',
    'text-cyan-500/20': 'text-white/20',
    'text-cyan-500/30': 'text-white/30',
}

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))
