from PIL import Image
import os

# Load the team photo
img = Image.open('public/images/team/team-photo.jpg')
width, height = img.size

print(f"📷 Original image size: {width}x{height}")

# Calculate crop regions for each person
third = width // 3

# Brian (left) - person on the left with glasses
brian_region = (0, 0, int(third * 1.3), height)
brian = img.crop(brian_region)
brian_resized = brian.resize((200, 200), Image.Resampling.LANCZOS)
brian_resized.save('public/images/team/brian-avatar.jpg', quality=95)
print("✅ Brian avatar created")

# Lester (middle) - person in the middle
lester_region = (int(third * 0.7), 0, int(third * 2.3), height)
lester = img.crop(lester_region)
lester_resized = lester.resize((200, 200), Image.Resampling.LANCZOS)
lester_resized.save('public/images/team/lester-avatar.jpg', quality=95)
print("✅ Lester avatar created")

# Alessa (right) - person on the right
alessa_region = (int(third * 1.7), 0, width, height)
alessa = img.crop(alessa_region)
alessa_resized = alessa.resize((200, 200), Image.Resampling.LANCZOS)
alessa_resized.save('public/images/team/alessa-avatar.jpg', quality=95)
print("✅ Alessa avatar created")

print("\n🎉 All avatars created successfully!")
print("📁 Saved to: public/images/team/")
