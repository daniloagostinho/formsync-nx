#!/usr/bin/env python3
"""
Script para criar ícones simples para a extensão Chrome
Usa PIL (Pillow) para gerar ícones básicos
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("Pillow não encontrado. Instalando...")
    import subprocess
    subprocess.check_call(["pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    """Cria um ícone simples com o símbolo de cadeado"""
    
    # Criar imagem com fundo transparente
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Cores
    primary_color = (102, 126, 234)  # #667eea
    secondary_color = (118, 75, 162)  # #764ba2
    
    # Desenhar fundo circular com gradiente
    center = size // 2
    radius = int(size * 0.4)
    
    # Gradiente simples (do centro para fora)
    for r in range(radius, 0, -1):
        ratio = r / radius
        color = tuple(int(c1 + (c2 - c1) * ratio) for c1, c2 in zip(primary_color, secondary_color))
        draw.ellipse([center - r, center - r, center + r, center + r], fill=color + (255,))
    
    # Desenhar cadeado
    lock_width = int(size * 0.3)
    lock_height = int(size * 0.4)
    lock_x = center - lock_width // 2
    lock_y = center - lock_height // 2
    
    # Corpo do cadeado
    draw.rectangle([lock_x, lock_y, lock_x + lock_width, lock_y + lock_height], 
                   fill='white', outline='white', width=2)
    
    # Arco do cadeado
    arc_width = int(size * 0.2)
    arc_height = int(size * 0.15)
    arc_x = center - arc_width // 2
    arc_y = lock_y - arc_height
    
    draw.arc([arc_x, arc_y, arc_x + arc_width, arc_y + arc_height], 
             0, 180, fill='white', width=2)
    
    # Fechadura
    lock_hole_x = center
    lock_hole_y = center
    hole_radius = int(size * 0.08)
    draw.ellipse([lock_hole_x - hole_radius, lock_hole_y - hole_radius, 
                   lock_hole_x + hole_radius, lock_hole_y + hole_radius], 
                  fill=primary_color)
    
    # Salvar ícone
    img.save(filename, 'PNG')
    print(f"Ícone criado: {filename}")

def main():
    """Cria todos os ícones necessários"""
    
    # Tamanhos necessários para Chrome
    sizes = [16, 48, 128]
    
    for size in sizes:
        filename = f"icon{size}.png"
        create_icon(size, filename)
    
    print("\n✅ Todos os ícones foram criados com sucesso!")
    print("📁 Arquivos criados:")
    for size in sizes:
        print(f"   - icon{size}.png ({size}x{size}px)")

if __name__ == "__main__":
    main()
