#!/usr/bin/env python3
"""
Script pour générer toutes les icônes TrackShip à partir du logo Foil'in Paris
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Chemins
ASSETS_DIR = "assets"
LOGO_PATH = os.path.join(ASSETS_DIR, "logo.png")

def create_icon_1024(logo_img, output_path):
    """Créer icon.png 1024x1024 avec logo centré sur fond blanc"""
    # Créer image 1024x1024 fond blanc
    icon = Image.new('RGBA', (1024, 1024), (255, 255, 255, 255))

    # Redimensionner logo à 800x800 (laisse marge de 112px de chaque côté)
    logo_resized = logo_img.resize((800, 800), Image.Resampling.LANCZOS)

    # Coller logo centré
    icon.paste(logo_resized, (112, 112), logo_resized)

    icon.save(output_path, 'PNG')
    print(f"OK - Cree: {output_path}")

def create_adaptive_icon_1024(logo_img, output_path):
    """Créer adaptive-icon.png 1024x1024 avec safe zone Android"""
    # Créer image 1024x1024 transparente
    icon = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))

    # Pour adaptive icon, zone sûre = cercle de 66% du diamètre
    # Logo doit être plus petit: 700x700 centré
    logo_resized = logo_img.resize((700, 700), Image.Resampling.LANCZOS)

    # Coller logo centré
    icon.paste(logo_resized, (162, 162), logo_resized)

    icon.save(output_path, 'PNG')
    print(f"OK - Cree: {output_path}")

def create_splash_1284x2778(logo_img, output_path):
    """Créer splash.png 1284x2778 avec logo centré sur fond bleu marine"""
    # Fond bleu marine #2c3e50
    splash = Image.new('RGB', (1284, 2778), (44, 62, 80))

    # Logo 600x600 centré
    logo_resized = logo_img.resize((600, 600), Image.Resampling.LANCZOS)

    # Convertir en RGBA pour transparence
    splash_rgba = splash.convert('RGBA')

    # Position centrée
    x = (1284 - 600) // 2
    y = (2778 - 600) // 2

    splash_rgba.paste(logo_resized, (x, y), logo_resized)

    # Convertir en RGB pour sauvegarder
    final_splash = splash_rgba.convert('RGB')
    final_splash.save(output_path, 'PNG')
    print(f"OK - Cree: {output_path}")

def create_notification_icon_96(logo_img, output_path):
    """Créer notification-icon.png 96x96 simplifié"""
    # Redimensionner logo à 96x96
    notif_icon = logo_img.resize((96, 96), Image.Resampling.LANCZOS)

    notif_icon.save(output_path, 'PNG')
    print(f"OK - Cree: {output_path}")

def main():
    print("Generation des icones TrackShip...")
    print(f"Dossier assets: {ASSETS_DIR}")

    # Vérifier que logo.png existe
    if not os.path.exists(LOGO_PATH):
        print(f"ERREUR: {LOGO_PATH} introuvable!")
        return

    # Charger le logo
    print(f"\nChargement du logo: {LOGO_PATH}")
    logo = Image.open(LOGO_PATH)
    print(f"Dimensions originales: {logo.size}")

    # Créer les 4 icônes
    print("\nCreation des icones...\n")

    create_icon_1024(logo, os.path.join(ASSETS_DIR, "icon.png"))
    create_adaptive_icon_1024(logo, os.path.join(ASSETS_DIR, "adaptive-icon.png"))
    create_splash_1284x2778(logo, os.path.join(ASSETS_DIR, "splash.png"))
    create_notification_icon_96(logo, os.path.join(ASSETS_DIR, "notification-icon.png"))

    print("\nOK - Toutes les icones ont ete generees avec succes!")
    print("\nFichiers crees:")
    print("   - icon.png (1024x1024) - Icone principale")
    print("   - adaptive-icon.png (1024x1024) - Android adaptive")
    print("   - splash.png (1284x2778) - Ecran de chargement")
    print("   - notification-icon.png (96x96) - Notifications")
    print("\nProchaine etape: eas build --platform android --profile preview")

if __name__ == "__main__":
    main()
