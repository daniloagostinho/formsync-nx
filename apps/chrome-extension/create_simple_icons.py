#!/usr/bin/env python3
"""
Script simples para criar ícones básicos para a extensão
Usa apenas a biblioteca padrão do Python
"""

import os

def create_simple_icon(size, filename):
    """Cria um arquivo SVG simples como ícone"""
    
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Círculo de fundo -->
  <circle cx="{size//2}" cy="{size//2}" r="{size//2 - 4}" fill="url(#grad)" stroke="#fff" stroke-width="2"/>
  
  <!-- Cadeado -->
  <rect x="{size//2 - size//6}" y="{size//2 - size//8}" width="{size//3}" height="{size//3}" 
        fill="white" rx="2"/>
  
  <!-- Arco do cadeado -->
  <path d="M {size//2 - size//6} {size//2 - size//8} Q {size//2} {size//2 - size//4} {size//2 + size//6} {size//2 - size//8}" 
        stroke="white" stroke-width="3" fill="none"/>
  
  <!-- Fechadura -->
  <circle cx="{size//2}" cy="{size//2}" r="{size//20}" fill="#667eea"/>
</svg>'''
    
    with open(filename, 'w') as f:
        f.write(svg_content)
    
    print(f"Ícone SVG criado: {filename}")

def create_text_icon(size, filename):
    """Cria um arquivo de texto simples como fallback"""
    
    # Para extensões Chrome, precisamos de PNG, mas vamos criar um arquivo de texto
    # que indica como criar o ícone manualmente
    content = f"""Ícone {size}x{size} para MyPassword

Para criar este ícone:
1. Use qualquer editor de imagem (GIMP, Photoshop, etc.)
2. Crie uma imagem {size}x{size} pixels
3. Use um fundo circular com gradiente azul/roxo
4. Adicione um símbolo de cadeado branco no centro
5. Salve como PNG

Ou use um serviço online como:
- https://www.favicon-generator.org/
- https://favicon.io/

Cores sugeridas:
- Azul: #667eea
- Roxo: #764ba2
- Branco: #ffffff
"""
    
    with open(filename + '.txt', 'w') as f:
        f.write(content)
    
    print(f"Instruções de ícone criadas: {filename}.txt")

def main():
    """Cria todos os ícones necessários"""
    
    # Tamanhos necessários para Chrome
    sizes = [16, 48, 128]
    
    print("🔐 Criando ícones para MyPassword...")
    print("=" * 40)
    
    for size in sizes:
        # Criar ícone SVG
        svg_filename = f"icon{size}.svg"
        create_simple_icon(size, svg_filename)
        
        # Criar instruções de texto
        txt_filename = f"icon{size}"
        create_text_icon(size, txt_filename)
    
    print("\n✅ Ícones criados com sucesso!")
    print("📁 Arquivos criados:")
    for size in sizes:
        print(f"   - icon{size}.svg ({size}x{size}px)")
        print(f"   - icon{size}.txt (instruções)")
    
    print("\n💡 Para usar com Chrome:")
    print("1. Converta os SVGs para PNG usando um conversor online")
    print("2. Ou crie ícones PNG manualmente seguindo as instruções")
    print("3. Substitua os arquivos .txt pelos .png correspondentes")

if __name__ == "__main__":
    main()

