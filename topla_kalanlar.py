import os

target_files = [
    os.path.join('mobile', 'src', 'screens', 'ClubLogoScreen.tsx'),
    os.path.join('mobile', 'src', 'screens', 'FootballBingoScreen.tsx'),
    os.path.join('mobile', 'src', 'screens', 'TicTacToeScreen.tsx'),
    os.path.join('mobile', 'src', 'screens', 'HomeScreen.tsx'),
    os.path.join('mobile', 'src', 'screens', 'LevelMapScreen.tsx'),
    os.path.join('mobile', 'src', 'stores', 'useGameStore.ts'),
    os.path.join('mobile', 'App.tsx'),
]

output_file = 'tum_kodlar_kalan_ekranlar.txt'

with open(output_file, 'w', encoding='utf-8') as outfile:
    outfile.write("KESİLEN VE TAMAMLANAN DOSYALAR (PART 2):\n" + "=" * 50 + "\n\n")
    for file_path in target_files:
        if os.path.exists(file_path):
            outfile.write(f"\n{'=' * 30}\n")
            outfile.write(f"DOSYA: {file_path}\n")
            outfile.write(f"{'=' * 30}\n\n")
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as infile:
                outfile.write(infile.read())
                outfile.write("\n")
        else:
            print(f"Uyarı: {file_path} bulunamadı!")

print(f"Başarılı! Kalan dosyalar '{output_file}' içine aktarıldı.")
