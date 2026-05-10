"""File Organizer Example

This script organizes files from a folder into subfolders based on file extension.
Usage:
    python file-organizer.py ./downloads
"""

from pathlib import Path
import shutil
import sys

CATEGORIES = {
    "Images": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "Documents": [".pdf", ".docx", ".txt", ".md"],
    "Code": [".py", ".js", ".html", ".css", ".lua"],
    "Archives": [".zip", ".rar", ".7z"],
}


def get_category(extension: str) -> str:
    for category, extensions in CATEGORIES.items():
        if extension.lower() in extensions:
            return category
    return "Other"


def organize(folder_path: str) -> None:
    folder = Path(folder_path)

    if not folder.exists() or not folder.is_dir():
        print("Please provide a valid folder path.")
        return

    for item in folder.iterdir():
        if item.is_file():
            category = get_category(item.suffix)
            target_folder = folder / category
            target_folder.mkdir(exist_ok=True)
            shutil.move(str(item), str(target_folder / item.name))
            print(f"Moved {item.name} to {category}/")


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "."
    organize(path)
