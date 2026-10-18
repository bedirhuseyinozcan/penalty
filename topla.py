import os

output_file = "tum_kodlar.txt"

# İçeriği TXT'ye EKLENECEK kaynak kod ve konfigürasyon dosyaları
include_exts = (
    '.ts', '.tsx', '.js', '.jsx', '.mjs',
    '.json', '.css', '.html', '.md',
    '.env.example'
)

include_names = (
    'Dockerfile', 'docker-compose.yml', '.gitignore', 'LICENSE'
)

# Kesinlikle içine girilmeyecek ağır, binary veya derleme klasörleri
exclude_dirs = {
    'node_modules', '.expo', '.git', '.github', 
    'dist', 'build', '.vscode', '.idea', 'kaggle', 
    'blurred', 'web-build'
}

# İçeriği DEVASA veri setleri veya anlamsız olan, kod okumasında atlanacak dosyalar
exclude_files = {
    output_file,
    'topla.py',
    'package-lock.json',
    'tsconfig.tsbuildinfo',
    'search-index.json',  # 250 KB'lık devasa arama indeksi txt'yi şişirmemesi için atlanır
    '.env'  # Güvenlik için gerçek gizli anahtarlar atlanır
}

def generate_file_tree(startpath):
    """Tüm projeyi görsel bir ağaç olarak listeler."""
    tree_str = "PROJE DOSYA VE KLASÖR AĞACI:\n" + "=" * 50 + "\n"
    for root, dirs, files in os.walk(startpath):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        level = root.replace(startpath, '').count(os.sep)
        indent = '    ' * level
        folder_name = os.path.basename(root) or "penalty (KÖK DİZİN)"
        tree_str += f"{indent}📁 {folder_name}/\n"
        subindent = '    ' * (level + 1)
        for f in sorted(files):
            if f == output_file or f == 'topla.py':
                continue
            tree_str += f"{subindent}📄 {f}\n"
    tree_str += "=" * 50 + "\n\n"
    return tree_str

with open(output_file, 'w', encoding='utf-8') as outfile:
    # 1. Aşama: En başa tüm projenin mimari ağacını bas
    outfile.write(generate_file_tree('.'))
    
    # 2. Aşama: Sadece okunabilir kod ve ayar dosyalarının içeriğini bas
    outfile.write("DOSYA KOD İÇERİKLERİ:\n" + "=" * 50 + "\n")
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in sorted(files):
            if file in exclude_files:
                continue
                
            # Sadece belirlenen kod ve konfigürasyon dosyalarının içi okunur
            if file.endswith(include_exts) or file in include_names:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, '.')
                
                outfile.write(f"\n{'=' * 25}\n")
                outfile.write(f"DOSYA: {rel_path}\n")
                outfile.write(f"{'=' * 25}\n\n")
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as infile:
                        outfile.write(infile.read())
                        outfile.write("\n")
                except Exception as e:
                    outfile.write(f"Okuma hatası: {e}\n")

print(f"Başarılı! Hem backend hem mobile kodları '{output_file}' içine toplandı.")
