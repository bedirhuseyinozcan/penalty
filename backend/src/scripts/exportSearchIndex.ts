import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { PlayerModel } from '../models/Player';
import { connectDatabase } from '../config/db';
import { fixAndOrderCareerPath } from '../utils/careerPathUtils';

const BAD_CLUB_NAMES = new Set(['Without Club', 'Unknown', 'Career break', 'Retired', 'Kulüp']);

// 🏟️ Kulüp -> Lig Eşleşme Haritası (Kariyer Geçmişinden Lig Çıkarımı İçin)
export const CLUB_TO_LEAGUE_MAP: Record<string, string> = {
  // 🇪🇸 La Liga
  'Real Madrid': 'la_liga',
  'Barcelona': 'la_liga',
  'Atlético': 'la_liga',
  'Atlético Madrid': 'la_liga',
  'Valencia': 'la_liga',
  'Sevilla FC': 'la_liga',
  'Villarreal': 'la_liga',
  'Real Sociedad': 'la_liga',
  'Real Betis': 'la_liga',
  'Athletic Club': 'la_liga',
  'Celta': 'la_liga',
  'Espanyol': 'la_liga',
  'Getafe': 'la_liga',
  'CA Osasuna': 'la_liga',
  'RCD Mallorca': 'la_liga',
  'Rayo Vallecano': 'la_liga',
  'Deportivo Alavés': 'la_liga',
  'Alavés': 'la_liga',
  'Girona': 'la_liga',
  'UD Las Palmas': 'la_liga',
  'CD Leganés': 'la_liga',
  'Real Valladolid': 'la_liga',
  'Dep. A Coruña': 'la_liga',
  'Málaga CF': 'la_liga',
  'Real Zaragoza': 'la_liga',
  'Levante': 'la_liga',
  'Granada CF': 'la_liga',
  'Cádiz CF': 'la_liga',
  'UD Almería': 'la_liga',
  'SD Eibar': 'la_liga',
  'Sporting Gijón': 'la_liga',
  'Racing': 'la_liga',
  'CD Tenerife': 'la_liga',
  'Elche CF': 'la_liga',
  'Real Oviedo': 'la_liga',

  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
  'Man Utd': 'premier_league',
  'Manchester United': 'premier_league',
  'Man City': 'premier_league',
  'Manchester City': 'premier_league',
  'Liverpool': 'premier_league',
  'Arsenal': 'premier_league',
  'Chelsea': 'premier_league',
  'Tottenham': 'premier_league',
  'Newcastle': 'premier_league',
  'Aston Villa': 'premier_league',
  'Everton': 'premier_league',
  'West Ham': 'premier_league',
  'Brighton': 'premier_league',
  'Crystal Palace': 'premier_league',
  'Fulham': 'premier_league',
  'Wolves': 'premier_league',
  'Bournemouth': 'premier_league',
  'Brentford': 'premier_league',
  "Nott'm Forest": 'premier_league',
  'Leicester': 'premier_league',
  'Southampton': 'premier_league',
  'Ipswich': 'premier_league',
  'Leeds': 'premier_league',
  'Burnley': 'premier_league',
  'Sunderland': 'premier_league',
  'Middlesbrough': 'premier_league',
  'Blackburn': 'premier_league',
  'Bolton': 'premier_league',
  'Stoke City': 'premier_league',
  'Swansea': 'premier_league',
  'Watford': 'premier_league',
  'West Brom': 'premier_league',
  'Portsmouth': 'premier_league',
  'Wigan': 'premier_league',
  'QPR': 'premier_league',
  'Reading': 'premier_league',
  'Norwich': 'premier_league',
  'Hull City': 'premier_league',
  'Birmingham': 'premier_league',
  'Charlton': 'premier_league',
  'Derby': 'premier_league',
  'Sheffield Utd.': 'premier_league',

  // 🇮🇹 Serie A
  'AC Milan': 'serie_a',
  'Inter': 'serie_a',
  'Juventus': 'serie_a',
  'Roma': 'serie_a',
  'Napoli': 'serie_a',
  'Lazio': 'serie_a',
  'Fiorentina': 'serie_a',
  'Atalanta': 'serie_a',
  'Bologna': 'serie_a',
  'Torino': 'serie_a',
  'Udinese': 'serie_a',
  'Genoa': 'serie_a',
  'Cagliari': 'serie_a',
  'Parma': 'serie_a',
  'Hellas Verona': 'serie_a',
  'FC Empoli': 'serie_a',
  'Lecce': 'serie_a',
  'Monza': 'serie_a',
  'Como': 'serie_a',
  'Venezia': 'serie_a',
  'Sampdoria': 'serie_a',
  'Sassuolo': 'serie_a',
  'Salernitana': 'serie_a',
  'Spezia': 'serie_a',
  'Benevento': 'serie_a',
  'Crotone': 'serie_a',
  'SPAL': 'serie_a',
  'Chievo Verona': 'serie_a',
  'Palermo': 'serie_a',
  'Brescia': 'serie_a',
  'Catania': 'serie_a',
  'Siena': 'serie_a',
  'Livorno': 'serie_a',
  'Reggina': 'serie_a',
  'Perugia': 'serie_a',
  'Bari': 'serie_a',
  'LR Vicenza': 'serie_a',
  'Piacenza': 'serie_a',
  'Pescara': 'serie_a',
  'Ascoli': 'serie_a',
  'Messina': 'serie_a',

  // 🇩🇪 Bundesliga
  'Bayern Munich': 'bundesliga',
  'Dortmund': 'bundesliga',
  'Leverkusen': 'bundesliga',
  'Leipzig': 'bundesliga',
  'Stuttgart': 'bundesliga',
  'Frankfurt': 'bundesliga',
  'Wolfsburg': 'bundesliga',
  'Mönchengladbach': 'bundesliga',
  'Werder Bremen': 'bundesliga',
  'Freiburg': 'bundesliga',
  'Hoffenheim': 'bundesliga',
  'Mainz': 'bundesliga',
  'Augsburg': 'bundesliga',
  'Union Berlin': 'bundesliga',
  'VfL Bochum': 'bundesliga',
  'Heidenheim': 'bundesliga',
  'St. Pauli': 'bundesliga',
  'Holstein Kiel': 'bundesliga',
  'FC Schalke 04': 'bundesliga',
  'Hamburg': 'bundesliga',
  'Hertha BSC': 'bundesliga',
  '1.FC Köln': 'bundesliga',
  'Hannover 96': 'bundesliga',
  '1.FC Nürnberg': 'bundesliga',
  "1.FC K'lautern": 'bundesliga',
  '1860 Munich': 'bundesliga',
  'Arminia': 'bundesliga',
  'Darmstadt 98': 'bundesliga',
  'Fortuna': 'bundesliga',
  'MSV Duisburg': 'bundesliga',
  'Hansa Rostock': 'bundesliga',
  'Energie Cottbus': 'bundesliga',
  'Karlsruher SC': 'bundesliga',

  // 🇫🇷 Ligue 1
  'PSG': 'ligue_1',
  'Monaco': 'ligue_1',
  'Marseille': 'ligue_1',
  'Lyon': 'ligue_1',
  'Lille': 'ligue_1',
  'Nice': 'ligue_1',
  'Lens': 'ligue_1',
  'Rennes': 'ligue_1',
  'Reims': 'ligue_1',
  'Toulouse': 'ligue_1',
  'Montpellier': 'ligue_1',
  'R. Strasbourg': 'ligue_1',
  'FC Nantes': 'ligue_1',
  'Le Havre AC': 'ligue_1',
  'AJ Auxerre': 'ligue_1',
  'Angers SCO': 'ligue_1',
  'Saint-Étienne': 'ligue_1',
  'Stade Brestois': 'ligue_1',
  'G. Bordeaux': 'ligue_1',
  'FC Lorient': 'ligue_1',
  'FC Metz': 'ligue_1',
  'Clermont Foot': 'ligue_1',
  'Troyes': 'ligue_1',
  'SC Bastia': 'ligue_1',
  'Guingamp': 'ligue_1',
  'SM Caen': 'ligue_1',
  'FC Sochaux': 'ligue_1',
  'AS Nancy': 'ligue_1',
  'Evian TG': 'ligue_1',
  'Dijon': 'ligue_1',
  'Amiens SC': 'ligue_1',
  'Nîmes Olympique': 'ligue_1',
  'AC Ajaccio': 'ligue_1',
  'Valenciennes FC': 'ligue_1',
  'CS Sedan': 'ligue_1',
  'Le Mans FC': 'ligue_1',
  'Cannes': 'ligue_1',

  // 🇹🇷 Süper Lig
  'Galatasaray': 'super_lig',
  'Fenerbahçe': 'super_lig',
  'Beşiktaş': 'super_lig',
  'Trabzonspor': 'super_lig',
  'Basaksehir': 'super_lig',
  'Başakşehir': 'super_lig',
  'Samsunspor': 'super_lig',
  'Eyüpspor': 'super_lig',
  'Göztepe': 'super_lig',
  'Sivasspor': 'super_lig',
  'Alanyaspor': 'super_lig',
  'Konyaspor': 'super_lig',
  'Kasimpasa': 'super_lig',
  'Kasımpaşa': 'super_lig',
  'C. Rizespor': 'super_lig',
  'Çaykur Rizespor': 'super_lig',
  'Antalyaspor': 'super_lig',
  'Gaziantep FK': 'super_lig',
  'Kayserispor': 'super_lig',
  'Bodrum FK': 'super_lig',
  'Hatayspor': 'super_lig',
  'Adana Demirspor': 'super_lig',
  'Bursaspor': 'super_lig',
  'Eskisehirspor': 'super_lig',
  'Ankaragücü': 'super_lig',
  'Genclerbirligi': 'super_lig',
  'Gençlerbirliği': 'super_lig',
  'Gaziantepspor': 'super_lig',
  'Karagümrük': 'super_lig',
  'Istanbulspor': 'super_lig',
  'Pendikspor': 'super_lig',
  'Y. Malatyaspor': 'super_lig',
  'Denizlispor': 'super_lig',
  'Manisaspor': 'super_lig',
  'Akhisarspor': 'super_lig',
  'Mersin TY': 'super_lig',
  'Kardemir Karabük': 'super_lig',
  'Orduspor': 'super_lig',
  'Elazığspor': 'super_lig',
  'K. Erciyesspor': 'super_lig',
  'Sakaryaspor': 'super_lig',
  'Kocaelispor': 'super_lig',
  'Altay': 'super_lig',
  'Ankaraspor': 'super_lig',
};

function normalizeTrophyName(str: string): string {
  return (str || '')
    .replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/ß/g, 'ss')
    .replace(/đ/g, 'd')
    .replace(/ð/g, 'd')
    .replace(/þ/g, 'th')
    .replace(/ł/g, 'l')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 🏆 FIFA Dünya Kupası Kazanan Oyuncular (TMID Bazlı Doğrulanmış Liste)
export const WORLD_CUP_WINNER_TMIDS = new Set<string>([
  'tmid_342229', // Kylian Mbappé (France)
  'tmid_648195', // Enzo Fernández (Argentina)
  'tmid_576024', // Julián Alvarez (Argentina)
  'tmid_288230', // Ousmane Dembélé (France)
  'tmid_406625', // Lautaro Martínez (Argentina)
  'tmid_534033', // Alexis Mac Allister (Argentina)
  'tmid_480762', // Lisandro Martínez (Argentina)
  'tmid_355915', // Cristian Romero (Argentina)
  'tmid_401578', // Exequiel Palacios (Argentina)
  'tmid_281963', // Lucas Hernández (France)
  'tmid_424042', // Nahuel Molina (Argentina)
  'tmid_353366', // Benjamin Pavard (France)
  'tmid_190393', // Corentin Tolisso (France)
  'tmid_111873', // Emiliano Martínez (Argentina)
  'tmid_480763', // Juan Foyth (Argentina)
  'tmid_229604', // Gerónimo Rulli (Argentina)
  'tmid_206050', // Paulo Dybala (Argentina)
  'tmid_184892', // Florian Thauvin (France)
  'tmid_124502', // Matthias Ginter (Germany)
  'tmid_131225', // Nicolás Tagliafico (Argentina)
  'tmid_225083', // N'Golo Kanté (France)
  'tmid_17259', // Manuel Neuer (Germany)
  'tmid_342385', // Guido Rodríguez (Argentina)
  'tmid_74842', // Mario Götze (Germany)
  'tmid_205562', // Thomas Lemar (France)
  'tmid_161869', // Djibril Sidibé (France)
  'tmid_82442', // Olivier Giroud (France)
  'tmid_21327', // Ron-Robert Zieler (Germany)
  'tmid_28003', // Lionel Messi (Argentina)
  'tmid_203496', // Nabil Fekir (France)
  'tmid_85148', // Julian Draxler (Germany)
  'tmid_122153', // Paul Pogba (France)
  'tmid_45320', // Ángel Di María (Argentina)
  'tmid_17965', // Hugo Lloris (France)
  'tmid_54781', // Nicolás Otamendi (Argentina)
  'tmid_25557', // Sergio Ramos (Spain)
  'tmid_15452', // Raúl Albiol (Spain)
  'tmid_44068', // Juan Mata (Spain)
  'tmid_3373', // Ronaldinho (Brazil)
  'tmid_3140', // Ronaldo Nazário (Brazil)
  'tmid_3979', // Iker Casillas (Spain)
  'tmid_7518', // Roberto Carlos (Brazil)
  'tmid_5775', // Fabio Cannavaro (Italy)
  'tmid_3366', // Kaká (Brazil)
  'tmid_31909', // Toni Kroos (Germany)
  'tmid_7476', // Xabi Alonso (Spain)
  'tmid_35664', // Mesut Özil (Germany)
  'tmid_29401', // Sami Khedira (Germany)
  'tmid_28260', // Álvaro Arbeloa (Spain)
  'tmid_9209', // Christian Karembeu (France)
  'tmid_24474', // Bodo Illgner (Germany)
  'tmid_7607', // Xavi (Spain)
  'tmid_7600', // Andrés Iniesta (Spain)
  'tmid_7594', // Carles Puyol (Spain)
  'tmid_18944', // Gerard Piqué (Spain)
  'tmid_65230', // Sergio Busquets (Spain)
  'tmid_7980', // David Villa (Spain)
  'tmid_3207', // Thierry Henry (France)
  'tmid_3372', // Rivaldo (Brazil)
  'tmid_7942', // Romário (Brazil)
  'tmid_8806', // Cesc Fàbregas (Spain)
  'tmid_7589', // Víctor Valdés (Spain)
  'tmid_7829', // Juliano Belletti (Brazil)
  'tmid_5343', // Edmílson (Brazil)
  'tmid_5757', // Gianluca Zambrotta (Italy)
  'tmid_7767', // Fernando Torres (Spain)
  'tmid_7486', // Joan Capdevila (Spain)
  'tmid_4171', // Alessandro Nesta (Italy)
  'tmid_5937', // Cafu (Brazil)
  'tmid_5813', // Gennaro Gattuso (Italy)
  'tmid_5817', // Andrea Pirlo (Italy)
  'tmid_5821', // Filippo Inzaghi (Italy)
  'tmid_5800', // Dida (Brazil)
  'tmid_42049', // Franco Baresi (Italy)
  'tmid_3154', // Marcel Desailly (France)
  'tmid_5837', // Massimo Oddo (Italy)
  'tmid_5023', // Gianluigi Buffon (Italy)
  'tmid_4289', // Alessandro Del Piero (Italy)
  'tmid_7109', // Andrea Barzagli (Italy)
  'tmid_4146', // David Trezeguet (France)
  'tmid_5762', // Mauro Camoranesi (Italy)
  'tmid_75553', // Didier Deschamps (France)
  'tmid_33923', // Blaise Matuidi (France)
  'tmid_77', // Lúcio (Brazil)
  'tmid_5958', // Francesco Totti (Italy)
  'tmid_15185', // Lukas Podolski (Germany)
  'tmid_44017', // Javi Martínez (Spain)
  'tmid_2219', // Philipp Lahm (Germany)
  'tmid_2514', // Bastian Schweinsteiger (Germany)
  'tmid_3521', // Lilian Thuram (France)
  'tmid_35518', // David Silva (Spain)
  'tmid_5778', // Marco Materazzi (Italy)
  'tmid_5947', // Daniele De Rossi (Italy)
  'tmid_4151', // Aldair (Brazil)
  'tmid_5939', // Vincent Candela (France)
  'tmid_10', // Miroslav Klose (Germany)
  'tmid_5980', // Luca Toni (Italy)
  'tmid_5878', // Alberto Gilardino (Italy)
  'tmid_5826', // Angelo Peruzzi (Italy)
  'tmid_65278', // Pedro (Spain)
  'tmid_3183', // Patrick Vieira (France)
  'tmid_3185', // Robert Pirès (France)
  'tmid_3194', // Gilberto Silva (Brazil)
  'tmid_6710', // Per Mertesacker (Germany)
  'tmid_210', // Bixente Lizarazu (France)
  'tmid_26485', // Jérôme Boateng (Germany)
  'tmid_26', // Roman Weidenfeller (Germany)
  'tmid_39020', // Benedikt Höwedes (Germany)
  'tmid_72347', // Franz Beckenbauer (Germany)
  'tmid_35604', // Gerd Müller (Germany)
  'tmid_1527', // Lothar Matthäus (Germany)
  'tmid_16980', // Jürgen Klinsmann (Germany)
  'tmid_13775', // Rudi Völler (Germany)
  'tmid_7825', // Pepe Reina (Spain)
  'tmid_15956', // Jesús Navas (Spain)
  'tmid_23951', // Steve Mandanda (France)
  'tmid_8024', // Diego Maradona (Argentina)
  'tmid_17121', // Pelé (Brazil)
  'tmid_3113', // Laurent Blanc (France)
  'tmid_3289', // Fabien Barthez (France)
  'tmid_3166', // Emmanuel Petit (France)
  'tmid_4', // Youri Djorkaeff (France)
  'tmid_5855', // Claudio Taffarel (Brazil)
  'tmid_39728', // Mats Hummels (Germany)
  'tmid_16056', // Andreas Brehme (Germany)
  'tmid_164770', // Raphaël Varane (France)
  'tmid_3111', // Zinédine Zidane (France)
  'tmid_16973', // Jorginho (Brazil 1994)
]);

// ⭐ UEFA Şampiyonlar Ligi / Şampiyon Kulüpler Kupası Kazanan Oyuncular (TMID Bazlı Doğrulanmış Liste)
export const UCL_WINNER_TMIDS = new Set<string>([
  'tmid_418560', // Erling Haaland (Man City)
  'tmid_581678', // Jude Bellingham (Real Madrid)
  'tmid_371998', // Vinicius Junior (Real Madrid)
  'tmid_576024', // Julián Alvarez (Man City)
  'tmid_568177', // Cole Palmer (Man City)
  'tmid_861410', // Arda Güler (Real Madrid)
  'tmid_369081', // Federico Valverde (Real Madrid)
  'tmid_398073', // Achraf Hakimi (Real Madrid)
  'tmid_413112', // Aurélien Tchouaméni (Real Madrid)
  'tmid_406635', // Phil Foden (Man City)
  'tmid_357565', // Rodri (Man City)
  'tmid_309400', // Kai Havertz (Chelsea)
  'tmid_472423', // Reece James (Chelsea)
  'tmid_314353', // Trent Alexander-Arnold (Liverpool)
  'tmid_258004', // Rúben Dias (Man City)
  'tmid_640428', // Eduardo Camavinga (Real Madrid)
  'tmid_412363', // Rodrygo (Real Madrid)
  'tmid_424204', // Alphonso Davies (Bayern Munich)
  'tmid_315779', // Christian Pulisic (Chelsea)
  'tmid_314678', // Brahim Díaz (Real Madrid)
  'tmid_161056', // Joshua Kimmich (Bayern Munich)
  'tmid_701057', // Rico Lewis (Man City)
  'tmid_392768', // Callum Hudson-Odoi (Chelsea)
  'tmid_346483', // Mason Mount (Chelsea)
  'tmid_241641', // Bernardo Silva (Man City)
  'tmid_423744', // Billy Gilmour (Chelsea)
  'tmid_282411', // Marcos Llorente (Real Madrid)
  'tmid_203460', // Jack Grealish (Man City)
  'tmid_159471', // Serge Gnabry (Bayern Munich)
  'tmid_401530', // Éder Militão (Real Madrid)
  'tmid_331726', // Tammy Abraham (Chelsea)
  'tmid_281963', // Lucas Hernández (Bayern Munich)
  'tmid_284730', // Manuel Akanji (Man City)
  'tmid_148455', // Mohamed Salah (Liverpool)
  'tmid_108390', // Thibaut Courtois (Real Madrid)
  'tmid_139208', // Virgil van Dijk (Liverpool)
  'tmid_366930', // Sergio Gómez (Man City)
  'tmid_105470', // Alisson (Liverpool)
  'tmid_296622', // Marco Asensio (Fenerbahçe)
  'tmid_404839', // Andriy Lunin (Real Madrid)
  'tmid_186590', // John Stones (Man City)
  'tmid_353366', // Benjamin Pavard (Bayern Munich)
  'tmid_256178', // Joe Gomez (Liverpool)
  'tmid_153084', // Leon Goretzka (Bayern Munich)
  'tmid_190393', // Corentin Tolisso (Bayern Munich)
  'tmid_316125', // Ben Chilwell (Chelsea)
  'tmid_177476', // Nathan Aké (Man City)
  'tmid_51471', // Mateo Kovacic (Chelsea)
  'tmid_181778', // Emerson (Chelsea)
  'tmid_238223', // Ederson (Man City)
  'tmid_196948', // Andreas Christensen (Chelsea)
  'tmid_176553', // Aymeric Laporte (Athletic Club)
  'tmid_88755', // Kevin De Bruyne (Man City)
  'tmid_225693', // Fabinho (Trabzonspor)
  'tmid_341264', // Fran García (Real Madrid)
  'tmid_182712', // João Cancelo (Barcelona)
  'tmid_234803', // Andrew Robertson (Liverpool)
  'tmid_86202', // Antonio Rüdiger (Real Madrid)
  'tmid_319745', // Dani Ceballos (Real Madrid)
  'tmid_344600', // Michaël Cuisance (Bayern Munich)
  'tmid_192279', // Kepa Arrizabalaga (Real Madrid)
  'tmid_298976', // Borja Mayoral (Real Madrid)
  'tmid_291417', // Ferland Mendy (Real Madrid)
  'tmid_225083', // N'Golo Kanté (Fenerbahçe)
  'tmid_17259', // Manuel Neuer (Bayern Munich)
  'tmid_27992', // Luka Modrić (AC Milan)
  'tmid_85288', // Isco (Real Betis)
  'tmid_138927', // Daniel Carvajal (Real Madrid)
  'tmid_119296', // Emre Can (Bayern Munich)
  'tmid_59016', // David Alaba (Udinese)
  'tmid_53622', // İlkay Gündoğan (Galatasaray)
  'tmid_221316', // Lucas Vázquez (Real Madrid)
  'tmid_112515', // Marcos Alonso (Celta)
  'tmid_61651', // Jordan Henderson (Chelsea)
  'tmid_82442', // Olivier Giroud (Lille)
  'tmid_99922', // Marc Bartra (Real Betis)
  'tmid_40680', // Sven Ulreich (Bayern Munich)
  'tmid_225020', // Mariano Díaz (Real Madrid)
  'tmid_28003', // Lionel Messi (Legend)
  'tmid_8198', // Cristiano Ronaldo (Legend)
  'tmid_68290', // Neymar (Legend)
  'tmid_16306', // Casemiro (Legend)
  'tmid_200512', // Sadio Mané (Legend)
  'tmid_131789', // Roberto Firmino (Legend)
  'tmid_18922', // Karim Benzema (Legend)
  'tmid_171424', // Riyad Mahrez (Legend)
  'tmid_170527', // Timo Werner (Legend)
  'tmid_80444', // Philippe Coutinho (Legend)
  'tmid_49499', // Georginio Wijnaldum (Legend)
  'tmid_217111', // Hakim Ziyech (Legend)
  'tmid_41384', // Marko Arnautovic (Legend)
  'tmid_81999', // Joselu (Legend)
  'tmid_45320', // Ángel Di María (Legend)
  'tmid_88103', // James Rodríguez (Legend)
  'tmid_145707', // Danilo (Legend)
  'tmid_58884', // Nacho Fernández (Legend)
  'tmid_44352', // Luis Suárez (Legend)
  'tmid_42460', // Ivan Perisic (Legend)
  'tmid_86792', // Xherdan Shaqiri (Legend)
  'tmid_25557', // Sergio Ramos (Legend)
  'tmid_79422', // Keylor Navas (Legend)
  'tmid_29241', // Thiago Silva (Legend)
  'tmid_44068', // Juan Mata (Legend)
  'tmid_37838', // Dejan Lovren (Legend)
  'tmid_10471', // Luiz Gustavo (Legend)
  'tmid_46741', // David Luiz (Legend)
  'tmid_33706', // Nani (Legend)
  'tmid_3373', // Ronaldinho (Legend)
  'tmid_7349', // Raúl (Legend)
  'tmid_3979', // Iker Casillas (Legend)
  'tmid_7518', // Roberto Carlos (Legend)
  'tmid_3446', // Luís Figo (Legend)
  'tmid_7530', // Guti (Legend)
  'tmid_7513', // Fernando Hierro (Legend)
  'tmid_7515', // Míchel Salgado (Legend)
  'tmid_7514', // Iván Helguera (Legend)
  'tmid_3980', // Steve McManaman (Legend)
  'tmid_7531', // Fernando Morientes (Legend)
  'tmid_4182', // Claude Makélélé (Legend)
  'tmid_3139', // David Beckham (Legend)
  'tmid_4673', // Wesley Sneijder (Legend)
  'tmid_4360', // Arjen Robben (Legend)
  'tmid_3366', // Kaká (Legend)
  'tmid_39381', // Gareth Bale (Legend)
  'tmid_31909', // Toni Kroos (Legend)
  'tmid_44501', // Marcelo (Legend)
  'tmid_14132', // Pepe (Legend)
  'tmid_7476', // Xabi Alonso (Legend)
  'tmid_29401', // Sami Khedira (Legend)
  'tmid_28260', // Álvaro Arbeloa (Legend)
  'tmid_5938', // Walter Samuel (Legend)
  'tmid_7527', // Santiago Solari (Legend)
  'tmid_24481', // Predrag Mijatović (Legend)
  'tmid_1407', // Davor Suker (Legend)
  'tmid_4168', // Clarence Seedorf (Legend)
  'tmid_5811', // Fernando Redondo (Legend)
  'tmid_9209', // Christian Karembeu (Legend)
  'tmid_24474', // Bodo Illgner (Legend)
  'tmid_8023', // Michael Laudrup (Legend)
  'tmid_7607', // Xavi (Legend)
  'tmid_7600', // Andrés Iniesta (Legend)
  'tmid_7594', // Carles Puyol (Legend)
  'tmid_18944', // Gerard Piqué (Legend)
  'tmid_65230', // Sergio Busquets (Legend)
  'tmid_69751', // Jordi Alba (Legend)
  'tmid_15951', // Dani Alves (Legend)
  'tmid_7980', // David Villa (Legend)
  'tmid_4257', // Samuel Eto'o (Legend)
  'tmid_3207', // Thierry Henry (Legend)
  'tmid_3372', // Rivaldo (Legend)
  'tmid_8564', // Deco (Legend)
  'tmid_7940', // Ronald Koeman (Legend)
  'tmid_7938', // Hristo Stoichkov (Legend)
  'tmid_5950', // Pep Guardiola (Legend)
  'tmid_4385', // Patrick Kluivert (Legend)
  'tmid_3513', // Marc Overmars (Legend)
  'tmid_3518', // Frank de Boer (Legend)
  'tmid_3191', // Giovanni van Bronckhorst (Legend)
  'tmid_3514', // Henrik Larsson (Legend)
  'tmid_5299', // Ludovic Giuly (Legend)
  'tmid_2904', // Rafa Márquez (Legend)
  'tmid_5283', // Éric Abidal (Legend)
  'tmid_13091', // Yaya Touré (Legend)
  'tmid_5486', // Seydou Keita (Legend)
  'tmid_19981', // Javier Mascherano (Legend)
  'tmid_32467', // Ivan Rakitic (Legend)
  'tmid_7589', // Víctor Valdés (Legend)
  'tmid_40423', // Claudio Bravo (Legend)
  'tmid_34495', // Adriano Correia (Legend)
  'tmid_4317', // Maxwell (Legend)
  'tmid_7829', // Juliano Belletti (Legend)
  'tmid_5343', // Edmílson (Legend)
  'tmid_3359', // Sylvinho (Legend)
  'tmid_44675', // Bojan Krkic (Legend)
  'tmid_7767', // Fernando Torres (Legend)
  'tmid_34572', // Mario Mandžukić (Legend)
  'tmid_7562', // Santiago Cañizares (Legend)
  'tmid_5803', // Paolo Maldini (Legend)
  'tmid_4171', // Alessandro Nesta (Legend)
  'tmid_5937', // Cafu (Legend)
  'tmid_5813', // Gennaro Gattuso (Legend)
  'tmid_5817', // Andrea Pirlo (Legend)
  'tmid_5821', // Filippo Inzaghi (Legend)
  'tmid_3522', // Andriy Shevchenko (Legend)
  'tmid_5800', // Dida (Legend)
  'tmid_10055', // Alessandro Costacurta (Legend)
  'tmid_42049', // Franco Baresi (Legend)
  'tmid_74471', // Marco van Basten (Legend)
  'tmid_101045', // Ruud Gullit (Legend)
  'tmid_70667', // Frank Rijkaard (Legend)
  'tmid_89545', // Zvonimir Boban (Legend)
  'tmid_35894', // Dejan Savicevic (Legend)
  'tmid_3154', // Marcel Desailly (Legend)
  'tmid_5818', // Massimo Ambrosini (Legend)
  'tmid_5819', // Serginho (Legend)
  'tmid_3557', // Jaap Stam (Legend)
  'tmid_3624', // Rui Costa (Legend)
  'tmid_4169', // Jon Dahl Tomasson (Legend)
  'tmid_3532', // Marek Jankulovski (Legend)
  'tmid_5837', // Massimo Oddo (Legend)
  'tmid_3515', // Mark van Bommel (Legend)
  'tmid_4276', // Carlos Tévez (Legend)
  'tmid_4289', // Alessandro Del Piero (Legend)
  'tmid_5758', // Edgar Davids (Legend)
  'tmid_5749', // Ciro Ferrara (Legend)
  'tmid_5751', // Gianluca Pessotto (Legend)
  'tmid_5748', // Alessio Tacchinardi (Legend)
  'tmid_5759', // Antonio Conte (Legend)
  'tmid_75553', // Didier Deschamps (Legend)
  'tmid_4226', // Fabrizio Ravanelli (Legend)
  'tmid_16036', // Gianluca Vialli (Legend)
  'tmid_1161', // Javier Zanetti (Legend)
  'tmid_18301', // Maicon (Legend)
  'tmid_77', // Lúcio (Legend)
  'tmid_22412', // Júlio César (Legend)
  'tmid_9828', // Ricardo Carvalho (Legend)
  'tmid_54170', // Ramires (Legend)
  'tmid_44017', // Javi Martínez (Legend)
  'tmid_3216', // Milan Baros (Legend)
  'tmid_3966', // Djibril Cissé (Legend)
  'tmid_22068', // Franck Ribéry (Legend)
  'tmid_2219', // Philipp Lahm (Legend)
  'tmid_2514', // Bastian Schweinsteiger (Legend)
  'tmid_206', // Oliver Kahn (Legend)
  'tmid_3430', // Kakhaber Kaladze (Legend)
  'tmid_7520', // Esteban Cambiasso (Legend)
  'tmid_22202', // Diego Milito (Legend)
  'tmid_5778', // Marco Materazzi (Legend)
  'tmid_5772', // Iván Córdoba (Legend)
  'tmid_4314', // Cristian Chivu (Legend)
  'tmid_3428', // Dejan Stanković (Legend)
  'tmid_7602', // Thiago Motta (Legend)
  'tmid_12563', // Goran Pandev (Legend)
  'tmid_5878', // Alberto Gilardino (Legend)
  'tmid_5826', // Angelo Peruzzi (Legend)
  'tmid_3332', // Wayne Rooney (Legend)
  'tmid_3397', // Paul Scholes (Legend)
  'tmid_3406', // Ryan Giggs (Legend)
  'tmid_3235', // Rio Ferdinand (Legend)
  'tmid_19726', // Nemanja Vidic (Legend)
  'tmid_5285', // Patrice Evra (Legend)
  'tmid_3516', // Edwin van der Sar (Legend)
  'tmid_3403', // Gary Neville (Legend)
  'tmid_3396', // Roy Keane (Legend)
  'tmid_3465', // Peter Schmeichel (Legend)
  'tmid_3394', // Ole Gunnar Solskjaer (Legend)
  'tmid_3223', // Dwight Yorke (Legend)
  'tmid_3238', // Andy Cole (Legend)
  'tmid_3392', // Teddy Sheringham (Legend)
  'tmid_4280', // Denis Irwin (Legend)
  'tmid_3543', // Nicky Butt (Legend)
  'tmid_3404', // Phil Neville (Legend)
  'tmid_3405', // Wes Brown (Legend)
  'tmid_3540', // John O'Shea (Legend)
  'tmid_3547', // Darren Fletcher (Legend)
  'tmid_3878', // Michael Carrick (Legend)
  'tmid_4592', // Ji-sung Park (Legend)
  'tmid_65278', // Pedro (Legend)
  'tmid_3109', // Steven Gerrard (Legend)
  'tmid_3597', // Jamie Carragher (Legend)
  'tmid_3470', // Sami Hyypiä (Legend)
  'tmid_3220', // John Arne Riise (Legend)
  'tmid_3209', // Jerzy Dudek (Legend)
  'tmid_919', // Dietmar Hamann (Legend)
  'tmid_7920', // Luis García (Legend)
  'tmid_3241', // Harry Kewell (Legend)
  'tmid_47082', // Daniel Sturridge (Legend)
  'tmid_82105', // Joël Matip (Legend)
  'tmid_148368', // Divock Origi (Legend)
  'tmid_60444', // Thiago Alcántara (Legend)
  'tmid_3182', // Ashley Cole (Legend)
  'tmid_3133', // Nwankwo Kanu (Legend)
  'tmid_3924', // Didier Drogba (Legend)
  'tmid_3163', // Frank Lampard (Legend)
  'tmid_3160', // John Terry (Legend)
  'tmid_5658', // Petr Cech (Legend)
  'tmid_50202', // Eden Hazard (Legend)
  'tmid_5588', // Michael Essien (Legend)
  'tmid_9832', // Paulo Ferreira (Legend)
  'tmid_3176', // Eidur Gudjohnsen (Legend)
  'tmid_5461', // Florent Malouda (Legend)
  'tmid_7971', // Salomon Kalou (Legend)
  'tmid_3226', // Nicolas Anelka (Legend)
  'tmid_36827', // Branislav Ivanovic (Legend)
  'tmid_27511', // Gary Cahill (Legend)
  'tmid_30739', // John Obi Mikel (Legend)
  'tmid_3333', // James Milner (Legend)
  'tmid_6288', // Mario Gómez (Legend)
  'tmid_532', // Claudio Pizarro (Legend)
  'tmid_198', // Giovane Élber (Legend)
  'tmid_217', // Mehmet Scholl (Legend)
  'tmid_197', // Stefan Effenberg (Legend)
  'tmid_210', // Bixente Lizarazu (Legend)
  'tmid_213', // Willy Sagnol (Legend)
  'tmid_4740', // Daniel Van Buyten (Legend)
  'tmid_89', // Zé Roberto (Legend)
  'tmid_26485', // Jérôme Boateng (Legend)
  'tmid_129473', // Rafinha (Legend)
  'tmid_54659', // Holger Badstuber (Legend)
  'tmid_16136', // Dante (Legend)
  'tmid_72347', // Franz Beckenbauer (Legend)
  'tmid_35604', // Gerd Müller (Legend)
  'tmid_13775', // Rudi Völler (Legend)
  'tmid_72343', // Karl-Heinz Rummenigge (Legend)
  'tmid_77010', // Matthias Sammer (Legend)
  'tmid_8016', // Vítor Baía (Legend)
  'tmid_3091', // Benni McCarthy (Legend)
  'tmid_9822', // Maniche (Legend)
  'tmid_9826', // Costinha (Legend)
  'tmid_9831', // Nuno Valente (Legend)
  'tmid_15760', // Ibrahim Afellay (Legend)
  'tmid_8021', // Johan Cruyff (Legend)
  'tmid_88994', // Michel Platini (Legend)
  'tmid_3289', // Fabien Barthez (Legend)
  'tmid_18912', // Yoann Gourcuff (Legend)
  'tmid_13168', // Raúl Meireles (Legend)
  'tmid_43530', // Adam Lallana (Legend)
  'tmid_45146', // Mario Balotelli (Legend)
  'tmid_9813', // Bosingwa (Legend)
  'tmid_57500', // César Azpilicueta (Legend)
  'tmid_164770', // Raphaël Varane (Legend)
  'tmid_3111', // Zinédine Zidane (Legend)
  'tmid_102017', // Jorginho (Chelsea 2021)
  'tmid_38253', // Robert Lewandowski (Bayern Munich 2020)
]);

// 🌟 Ballon d'Or Kazanan Oyuncular (TMID Bazlı Doğrulanmış Liste)
export const BALLON_DOR_WINNER_TMIDS = new Set<string>([
  'tmid_357565', // Rodri (Spain)
  'tmid_27992', // Luka Modrić (Croatia)
  'tmid_28003', // Lionel Messi (Argentina)
  'tmid_8198', // Cristiano Ronaldo (Portugal)
  'tmid_18922', // Karim Benzema (France)
  'tmid_3373', // Ronaldinho (Brazil)
  'tmid_3140', // Ronaldo Nazário (Brazil)
  'tmid_3446', // Luís Figo (Portugal)
  'tmid_1397', // Michael Owen (England)
  'tmid_5775', // Fabio Cannavaro (Italy)
  'tmid_3366', // Kaká (Brazil)
  'tmid_3372', // Rivaldo (Brazil)
  'tmid_7938', // Hristo Stoichkov (Bulgaria)
  'tmid_3522', // Andriy Shevchenko (Ukraine)
  'tmid_74471', // Marco van Basten (Netherlands)
  'tmid_101045', // Ruud Gullit (Netherlands)
  'tmid_8542', // George Weah (Liberia)
  'tmid_3603', // Pavel Nedved (Czech Republic)
  'tmid_4153', // Roberto Baggio (Italy)
  'tmid_72347', // Franz Beckenbauer (Germany)
  'tmid_35604', // Gerd Müller (Germany)
  'tmid_1527', // Lothar Matthäus (Germany)
  'tmid_72343', // Karl-Heinz Rummenigge (Germany)
  'tmid_8021', // Johan Cruyff (Netherlands)
  'tmid_88994', // Michel Platini (France)
  'tmid_3111', // Zinédine Zidane (France)
]);

// 👟 Gol Kralı / Altın Ayakkabı Kazanan Oyuncular (TMID Bazlı Doğrulanmış Liste)
export const GOLDEN_BOOT_WINNER_TMIDS = new Set<string>([
  'tmid_418560', // Erling Haaland (Norway)
  'tmid_342229', // Kylian Mbappé (France)
  'tmid_401923', // Victor Osimhen (Nigeria)
  'tmid_132098', // Harry Kane (England)
  'tmid_148455', // Mohamed Salah (Egypt)
  'tmid_238407', // Alexander Sørloth (Norway)
  'tmid_58864', // Pierre-Emerick Aubameyang (Gabon)
  'tmid_28396', // Edin Dzeko (Bosnia-Herzegovina)
  'tmid_271966', // Mbaye Diagne (Senegal)
  'tmid_28003', // Lionel Messi (Argentina)
  'tmid_8198', // Cristiano Ronaldo (Portugal)
  'tmid_258626', // Talisca (Brazil)
  'tmid_200512', // Sadio Mané (Senegal)
  'tmid_18922', // Karim Benzema (France)
  'tmid_93720', // Alexandre Lacazette (France)
  'tmid_68863', // Mauro Icardi (Argentina)
  'tmid_88103', // James Rodríguez (Colombia)
  'tmid_44352', // Luis Suárez (Uruguay)
  'tmid_197838', // Jamie Vardy (England)
  'tmid_80562', // Hulk (Brazil)
  'tmid_139503', // Enner Valencia (Ecuador)
  'tmid_48280', // Edinson Cavani (Uruguay)
  'tmid_45671', // Cenk Tosun (Türkiye)
  'tmid_39152', // Radamel Falcao (Colombia)
  'tmid_3140', // Ronaldo Nazário (Brazil)
  'tmid_7349', // Raúl (Spain)
  'tmid_1397', // Michael Owen (England)
  'tmid_3407', // Ruud van Nistelrooy (Netherlands)
  'tmid_39153', // Gonzalo Higuaín (Argentina)
  'tmid_1407', // Davor Suker (Croatia)
  'tmid_84528', // Hugo Sánchez (Mexico)
  'tmid_117598', // Emilio Butragueño (Spain)
  'tmid_7980', // David Villa (Spain)
  'tmid_4257', // Samuel Eto'o (Cameroon)
  'tmid_3207', // Thierry Henry (France)
  'tmid_3372', // Rivaldo (Brazil)
  'tmid_7942', // Romário (Brazil)
  'tmid_7938', // Hristo Stoichkov (Bulgaria)
  'tmid_4385', // Patrick Kluivert (Netherlands)
  'tmid_3455', // Zlatan Ibrahimović (Sweden)
  'tmid_26399', // Sergio Agüero (Argentina)
  'tmid_3408', // Diego Forlán (Uruguay)
  'tmid_3994', // Roy Makaay (Netherlands)
  'tmid_7504', // Diego Tristán (Spain)
  'tmid_5821', // Filippo Inzaghi (Italy)
  'tmid_3522', // Andriy Shevchenko (Ukraine)
  'tmid_74471', // Marco van Basten (Netherlands)
  'tmid_101045', // Ruud Gullit (Netherlands)
  'tmid_3410', // Hernán Crespo (Argentina)
  'tmid_4276', // Carlos Tévez (Argentina)
  'tmid_4289', // Alessandro Del Piero (Italy)
  'tmid_4146', // David Trezeguet (France)
  'tmid_16036', // Gianluca Vialli (Italy)
  'tmid_4153', // Roberto Baggio (Italy)
  'tmid_5958', // Francesco Totti (Italy)
  'tmid_7939', // Gheorghe Hagi (Romania)
  'tmid_34987', // Burak Yılmaz (Türkiye)
  'tmid_5797', // Christian Vieri (Italy)
  'tmid_3216', // Milan Baros (Czech Republic)
  'tmid_3966', // Djibril Cissé (France)
  'tmid_50143', // Jonas (Brazil)
  'tmid_5959', // Gabriel Batistuta (Argentina)
  'tmid_10', // Miroslav Klose (Germany)
  'tmid_5980', // Luca Toni (Italy)
  'tmid_6031', // Antonio Di Natale (Italy)
  'tmid_22328', // Fabio Quagliarella (Italy)
  'tmid_3332', // Wayne Rooney (England)
  'tmid_3223', // Dwight Yorke (Trinidad and Tobago)
  'tmid_65', // Dimitar Berbatov (Bulgaria)
  'tmid_4380', // Robin van Persie (Netherlands)
  'tmid_105521', // Ciro Immobile (Italy)
  'tmid_4010', // Dirk Kuyt (Netherlands)
  'tmid_3187', // Dennis Bergkamp (Netherlands)
  'tmid_3924', // Didier Drogba (Cote d'Ivoire)
  'tmid_3175', // Jimmy Floyd Hasselbaink (Netherlands)
  'tmid_3226', // Nicolas Anelka (France)
  'tmid_3110', // Alan Shearer (England)
  'tmid_104637', // Ian Wright (England)
  'tmid_22256', // Gary Lineker (England)
  'tmid_6288', // Mario Gómez (Germany)
  'tmid_532', // Claudio Pizarro (Peru)
  'tmid_198', // Giovane Élber (Brazil)
  'tmid_4357', // Klaas-Jan Huntelaar (Netherlands)
  'tmid_6237', // Stefan Kießling (Germany)
  'tmid_37772', // Grafite (Brazil)
  'tmid_35604', // Gerd Müller (Germany)
  'tmid_16980', // Jürgen Klinsmann (Germany)
  'tmid_13775', // Rudi Völler (Germany)
  'tmid_72343', // Karl-Heinz Rummenigge (Germany)
  'tmid_3623', // Pauleta (Portugal)
  'tmid_6118', // Mamadou Niang (Senegal)
  'tmid_22382', // Moussa Sow (Senegal)
  'tmid_74418', // Jackson Martínez (Colombia)
  'tmid_3091', // Benni McCarthy (South Africa)
  'tmid_45865', // Óscar Cardozo (Paraguay)
  'tmid_4358', // Mateja Kežman (Serbia)
  'tmid_3520', // Pierre van Hooijdonk (Netherlands)
  'tmid_8021', // Johan Cruyff (Netherlands)
  'tmid_17121', // Pelé (Brazil)
  'tmid_88994', // Michel Platini (France)
  'tmid_18537', // Alex de Souza (Brazil)
  'tmid_3625', // Jardel (Brazil)
  'tmid_7043', // Semih Şentürk (Türkiye)
  'tmid_3363', // Hakan Şükür (Türkiye)
  'tmid_3377', // Arif Erdem (Türkiye)
  'tmid_22388', // Bafétimbi Gomis (France)
  'tmid_6875', // İlhan Mansız (Türkiye)
  'tmid_9487', // Shota Arveladze (Georgia)
  'tmid_6924', // Fatih Tekke (Türkiye)
  'tmid_18829', // Vágner Love (Brazil)
  'tmid_16402', // Theofanis Gekas (Greece)
  'tmid_91924', // Metin Oktay (Türkiye)
  'tmid_137057', // Lefter Küçükandonyadis (Türkiye)
  'tmid_92239', // Feyyaz Uçar (Türkiye)
  'tmid_90976', // Tanju Çolak (Türkiye)
  'tmid_92225', // Aykut Kocaman (Türkiye)
  'tmid_5332', // Fernandão (Brazil)
  'tmid_73480', // Aatif Chahechouhe (Morocco)
  'tmid_38253', // Robert Lewandowski (Poland)
]);

// 🥇 Kariyerinde Lig Şampiyonluğu Bulunan Oyuncular (Sezon Bazlı Doğrulanmış TMID Listesi)
export const LEAGUE_CHAMPION_WINNER_TMIDS = new Set<string>([
  'tmid_418560', // Erling Haaland (Man City)
  'tmid_937958', // Lamine Yamal (Barcelona)
  'tmid_342229', // Kylian Mbappé (Real Madrid)
  'tmid_566723', // Michael Olise (Bayern Munich)
  'tmid_581678', // Jude Bellingham (Real Madrid)
  'tmid_683840', // Pedri (Barcelona)
  'tmid_670681', // João Neves (PSG)
  'tmid_487469', // Vitinha (PSG)
  'tmid_502670', // Khvicha Kvaratskhelia (PSG)
  'tmid_371998', // Vinicius Junior (Real Madrid)
  'tmid_914562', // Désiré Doué (PSG)
  'tmid_648195', // Enzo Fernández (Man City)
  'tmid_576024', // Julián Alvarez (Atlético)
  'tmid_568177', // Cole Palmer (Chelsea)
  'tmid_636703', // Fermín López (Barcelona)
  'tmid_288230', // Ousmane Dembélé (PSG)
  'tmid_451276', // Dominik Szoboszlai (Liverpool)
  'tmid_708265', // Bradley Barcola (Liverpool)
  'tmid_861410', // Arda Güler (Real Madrid)
  'tmid_962110', // Pau Cubarsí (Barcelona)
  'tmid_397033', // Sandro Tonali (Tottenham)
  'tmid_369081', // Federico Valverde (Real Madrid)
  'tmid_792380', // Aleksandar Pavlovic (Bayern Munich)
  'tmid_598577', // Florian Wirtz (Liverpool)
  'tmid_406625', // Lautaro Martínez (Inter)
  'tmid_709726', // Hugo Ekitiké (Liverpool)
  'tmid_661171', // Willian Pacho (PSG)
  'tmid_398073', // Achraf Hakimi (PSG)
  'tmid_616341', // Nuno Mendes (PSG)
  'tmid_810092', // Warren Zaïre-Emery (PSG)
  'tmid_580195', // Jamal Musiala (Bayern Munich)
  'tmid_486049', // Jérémy Doku (Man City)
  'tmid_627442', // Benjamin Šeško (Man Utd)
  'tmid_434675', // Cody Gakpo (Liverpool)
  'tmid_475959', // Josko Gvardiol (Man City)
  'tmid_344695', // Dayot Upamecano (Bayern Munich)
  'tmid_478573', // Ryan Gravenberch (Liverpool)
  'tmid_411295', // Raphinha (Barcelona)
  'tmid_413112', // Aurélien Tchouaméni (Real Madrid)
  'tmid_534033', // Alexis Mac Allister (Liverpool)
  'tmid_420243', // Jurriën Timber (Arsenal)
  'tmid_480692', // Luis Díaz (Bayern Munich)
  'tmid_406635', // Phil Foden (Man City)
  'tmid_401923', // Victor Osimhen (Galatasaray)
  'tmid_315853', // Alessandro Bastoni (Inter)
  'tmid_739443', // Igor Thiago (Brentford)
  'tmid_357565', // Rodri (Barcelona)
  'tmid_132098', // Harry Kane (Bayern Munich)
  'tmid_314353', // Trent Alexander-Arnold (Real Madrid)
  'tmid_293385', // Dani Olmo (Barcelona)
  'tmid_325443', // Viktor Gyökeres (Arsenal)
  'tmid_702869', // Ismael Saibari (Bayern Munich)
  'tmid_411975', // Jules Koundé (Barcelona)
  'tmid_398184', // Ferran Torres (PSG)
  'tmid_258004', // Rúben Dias (Man City)
  'tmid_198116', // Federico Dimarco (Inter)
  'tmid_441986', // Yann Bisseck (Inter)
  'tmid_743591', // Sávio (Tottenham)
  'tmid_318528', // Marcus Thuram (Inter)
  'tmid_659813', // Piero Hincapié (Arsenal)
  'tmid_473169', // Brian Brobbey (Sunderland)
  'tmid_550550', // Gonçalo Ramos (AC Milan)
  'tmid_632349', // Jarell Quansah (Leverkusen)
  'tmid_255942', // Nicolò Barella (Inter)
  'tmid_640428', // Eduardo Camavinga (Real Madrid)
  'tmid_894914', // Antonio Nusa (Leipzig)
  'tmid_553875', // Pedro Porro (Tottenham)
  'tmid_315858', // Gianluigi Donnarumma (Man City)
  'tmid_904802', // Jorrel Hato (Chelsea)
  'tmid_601883', // Matheus Nunes (Man City)
  'tmid_461496', // Morten Hjulmand (Atlético)
  'tmid_480762', // Lisandro Martínez (Man Utd)
  'tmid_412363', // Rodrygo (Real Madrid)
  'tmid_357119', // Ibrahima Konaté (Real Madrid)
  'tmid_466794', // Eric García (Barcelona)
  'tmid_424204', // Alphonso Davies (Bayern Munich)
  'tmid_543499', // Mohammed Kudus (Tottenham)
  'tmid_1138758', // Geovany Quenda (Chelsea)
  'tmid_974982', // Ousmane Diomande (Nott'm Forest)
  'tmid_357164', // Rafael Leão (Galatasaray)
  'tmid_659089', // Ilya Zabarnyi (PSG)
  'tmid_315969', // Scott McTominay (Napoli)
  'tmid_705395', // Gerard Martín (Barcelona)
  'tmid_1060087', // Charalampos Kostoulas (Brighton)
  'tmid_636688', // Alejandro Balde (Barcelona)
  'tmid_483046', // Josip Stanisic (Bayern Munich)
  'tmid_903693', // Senny Mayulu (PSG)
  'tmid_496094', // Karim Adeyemi (Barcelona)
  'tmid_574671', // Strahinja Pavlović (AC Milan)
  'tmid_602105', // Antony (Real Betis)
  'tmid_748804', // Mika Godts (PSG)
  'tmid_1018920', // Marc Bernal (Barcelona)
  'tmid_971570', // Endrick (Real Madrid)
  'tmid_249565', // Youri Tielemans (Man Utd)
  'tmid_557149', // Kang-in Lee (Atlético)
  'tmid_314678', // Brahim Díaz (Real Madrid)
  'tmid_564545', // Edmond Tapsoba (Leverkusen)
  'tmid_503883', // Senne Lammens (Man Utd)
  'tmid_711337', // Evanilson (Bournemouth)
  'tmid_161056', // Joshua Kimmich (Bayern Munich)
  'tmid_338670', // Mile Svilar (Roma)
  'tmid_653610', // Igor Paixão (Marseille)
  'tmid_435772', // Charles De Ketelaere (Atalanta)
  'tmid_361093', // Sven Botman (Newcastle)
  'tmid_433188', // Curtis Jones (Inter)
  'tmid_404418', // Dávid Hancko (Atlético)
  'tmid_364135', // Moise Kean (Como)
  'tmid_346890', // Noah Okafor (Leeds)
  'tmid_541231', // Sepp van den Berg (Brentford)
  'tmid_585949', // Pierre Kalulu (Juventus)
  'tmid_223967', // Konrad Laimer (Bayern Munich)
  'tmid_340918', // Caoimhín Kelleher (Brentford)
  'tmid_735568', // Natan (Real Betis)
  'tmid_350219', // Fabián Ruiz (PSG)
  'tmid_429915', // Maxim De Cuyper (Brighton)
  'tmid_533738', // Jonathan David (Atlético)
  'tmid_484547', // Jeremie Frimpong (Liverpool)
  'tmid_487969', // Randal Kolo Muani (Juventus)
  'tmid_467437', // Malik Tillman (Leverkusen)
  'tmid_487474', // Francisco Conceição (Juventus)
  'tmid_519184', // Amar Dedic (Newcastle)
  'tmid_618494', // Tyler Morton (Lyon)
  'tmid_650568', // António Silva (Bournemouth)
  'tmid_318470', // Matvey Safonov (PSG)
  'tmid_541537', // Barış Alper Yılmaz (Galatasaray)
  'tmid_578539', // Chris Richards (Crystal Palace)
  'tmid_196357', // Jonathan Tah (Bayern Munich)
  'tmid_181767', // Marquinhos (PSG)
  'tmid_454567', // Orkun Kökçü (Beşiktaş)
  'tmid_461883', // Calvin Bassey (Fulham)
  'tmid_661207', // Oscar Bobb (Fulham)
  'tmid_553469', // Gabriel Sara (Galatasaray)
  'tmid_701057', // Rico Lewis (Man City)
  'tmid_368887', // Loïs Openda (Lyon)
  'tmid_900195', // Kevin (Fulham)
  'tmid_743384', // Chemsdine Talbi (Sunderland)
  'tmid_344381', // Christopher Nkunku (Leipzig)
  'tmid_415381', // Mats Wieffer (Brighton)
  'tmid_321528', // Denzel Dumfries (Real Madrid)
  'tmid_655217', // Samson Baidoo (Lens)
  'tmid_404842', // Vitaliy Mykolenko (Everton)
  'tmid_470394', // Kenneth Taylor (Lazio)
  'tmid_480267', // Ronald Araújo (Liverpool)
  'tmid_646740', // Gavi (Barcelona)
  'tmid_326330', // Frenkie de Jong (Barcelona)
  'tmid_404950', // Nicolas Seiwald (Leipzig)
  'tmid_401578', // Exequiel Palacios (Ipswich)
  'tmid_432164', // Igor Jesus (Nott'm Forest)
  'tmid_328658', // Kristoffer Ajer (Brentford)
  'tmid_326031', // Matthijs de Ligt (Man Utd)
  'tmid_408574', // Joey Veerman (Dortmund)
  'tmid_420213', // Quinten Timber (Crystal Palace)
  'tmid_426620', // Pedro Gonçalves (Fiorentina)
  'tmid_395516', // Moussa Diaby (Leverkusen)
  'tmid_386446', // Alessandro Buongiorno (Napoli)
  'tmid_585982', // Carlos Augusto (Inter)
  'tmid_394300', // Davide Frattesi (Lazio)
  'tmid_872171', // Lucas Beraldo (PSG)
  'tmid_463600', // Lucas Chevalier (PSG)
  'tmid_241641', // Bernardo Silva (Real Madrid)
  'tmid_405885', // Giacomo Raspadori (Atalanta)
  'tmid_628331', // Giannis Konstantelias (Dortmund)
  'tmid_393323', // Brenden Aaronson (Leeds)
  'tmid_554389', // Konstantinos Tzolakis (Hull City)
  'tmid_801734', // Mathys Tel (Tottenham)
  'tmid_505653', // Fábio Silva (Dortmund)
  'tmid_423744', // Billy Gilmour (Napoli)
  'tmid_318508', // Olivier Boscagli (Brighton)
  'tmid_282411', // Marcos Llorente (Atlético)
  'tmid_565424', // Johan Bakayoko (Leipzig)
  'tmid_435648', // Joshua Zirkzee (Man Utd)
  'tmid_463665', // Oumar Solet (Udinese)
  'tmid_532776', // Amine Adli (Bournemouth)
  'tmid_651005', // Cher Ndour (Fiorentina)
  'tmid_669380', // Konstantinos Koulierakis (Roma)
  'tmid_203460', // Jack Grealish (Everton)
  'tmid_193082', // Alejandro Grimaldo (Atlético)
  'tmid_503482', // Min-jae Kim (Bayern Munich)
  'tmid_339332', // Noa Lang (Napoli)
  'tmid_624258', // Conor Bradley (Liverpool)
  'tmid_476701', // Manuel Ugarte (Man Utd)
  'tmid_370846', // Timothy Weah (Marseille)
  'tmid_964426', // Christos Mouzakitis (Hull City)
  'tmid_182906', // Mike Maignan (AC Milan)
  'tmid_159471', // Serge Gnabry (Bayern Munich)
  'tmid_787912', // El Chadaille Bitshiabu (Galatasaray)
  'tmid_381950', // Alexis Saelemaekers (AC Milan)
  'tmid_401530', // Éder Militão (Real Madrid)
  'tmid_569384', // Lucien Agoumé (Sevilla FC)
  'tmid_494237', // Wilson Isidor (Sunderland)
  'tmid_348026', // Nordi Mukiele (Sunderland)
  'tmid_182913', // Adrien Rabiot (AC Milan)
  'tmid_406634', // Matt O'Riley (Brighton)
  'tmid_950091', // Stefanos Tzimas (Brighton)
  'tmid_340456', // Noussair Mazraoui (Man Utd)
  'tmid_353892', // Hiroki Ito (Bayern Munich)
  'tmid_236490', // Ola Aina (Nott'm Forest)
  'tmid_469822', // David Neres (Napoli)
  'tmid_565822', // Harvey Elliott (Valencia)
  'tmid_263918', // Aleksandr Golovin (Monaco)
  'tmid_396908', // Yunus Akgün (Galatasaray)
  'tmid_382528', // Kerem Aktürkoğlu (Fenerbahçe)
  'tmid_281963', // Lucas Hernández (PSG)
  'tmid_575998', // Leonardo Balerdi (Roma)
  'tmid_242086', // Patrik Schick (Leverkusen)
  'tmid_354362', // Rodrigo Bentancur (Tottenham)
  'tmid_699783', // Raphael Onyedika (Frankfurt)
  'tmid_232454', // Nadiem Amiri (Mainz)
  'tmid_284730', // Manuel Akanji (Inter)
  'tmid_363205', // Gabriel Jesus (Barcelona)
  'tmid_323167', // Matteo Gabbia (AC Milan)
  'tmid_148455', // Mohamed Salah (Trabzonspor)
  'tmid_807386', // Conrad Harder (R. Strasbourg)
  'tmid_126414', // Hakan Çalhanoğlu (Inter)
  'tmid_662261', // Rafa Marín (Napoli)
  'tmid_357162', // Florentino (Ipswich)
  'tmid_341429', // Davinson Sánchez (Galatasaray)
  'tmid_401529', // Dodô (Fiorentina)
  'tmid_502722', // Luka Sucic (Real Sociedad)
  'tmid_108390', // Thibaut Courtois (Real Madrid)
  'tmid_121483', // Jan Oblak (Atlético)
  'tmid_636695', // Marc Casadó (Dep. A Coruña)
  'tmid_223979', // Xaver Schlager (Nott'm Forest)
  'tmid_937955', // Héctor Fort (Real Sociedad)
  'tmid_315865', // Andrea Pinamonti (Lazio)
  'tmid_340322', // Nathan Tella (Leverkusen)
  'tmid_192565', // Leroy Sané (Galatasaray)
  'tmid_354361', // Frank Anguissa (Napoli)
  'tmid_616344', // Tiago Tomás (Stuttgart)
  'tmid_537598', // Fábio Vieira (Hamburg)
  'tmid_346853', // Romano Schmid (Frosinone)
  'tmid_683620', // Antoni Milambo (Brentford)
  'tmid_139208', // Virgil van Dijk (Liverpool)
  'tmid_644771', // Odilon Kossounou (Atalanta)
  'tmid_167799', // Pierre-Emile Højbjerg (Marseille)
  'tmid_361260', // Ozan Kabak (Hoffenheim)
  'tmid_670717', // Dário Essugo (R. Strasbourg)
  'tmid_366930', // Sergio Gómez (Real Sociedad)
  'tmid_105470', // Alisson (Liverpool)
  'tmid_537860', // Mykhaylo Mudryk (Tottenham)
  'tmid_364245', // Jordan Teze (Monaco)
  'tmid_466810', // Ansu Fati (Monaco)
  'tmid_376514', // Mathías Olivera (Napoli)
  'tmid_639246', // Hyeon-gyu Oh (Beşiktaş)
  'tmid_320748', // Sebastian Szymański (Rennes)
  'tmid_251075', // Zeki Çelik (Juventus)
  'tmid_400489', // Eljif Elmas (Atalanta)
  'tmid_292199', // Uğurcan Çakır (Galatasaray)
  'tmid_367284', // Leo Østigård (Genoa)
  'tmid_361068', // Jurgen Ekkelenkamp (Udinese)
  'tmid_420931', // Daizen Maeda (Ipswich)
  'tmid_296622', // Marco Asensio (Fenerbahçe)
  'tmid_357156', // Diogo Leite (Lazio)
  'tmid_404839', // Andriy Lunin (Real Madrid)
  'tmid_305947', // Albert Gudmundsson (Lazio)
  'tmid_186590', // John Stones (Inter)
  'tmid_709957', // Álex Valle (Como)
  'tmid_421873', // Elia Caprile (Cagliari)
  'tmid_353366', // Benjamin Pavard (Inter)
  'tmid_514285', // Quilindschy Hartman (Espanyol)
  'tmid_638793', // Tajon Buchanan (Villarreal)
  'tmid_358008', // Gianluca Gaetano (Atalanta)
  'tmid_344152', // Odsonne Édouard (Lens)
  'tmid_332798', // Roland Sallai (Galatasaray)
  'tmid_371001', // Josip Sutalo (Lazio)
  'tmid_294808', // Franck Kessié (Atalanta)
  'tmid_463527', // Kjell Scherpen (Ipswich)
  'tmid_256178', // Joe Gomez (Liverpool)
  'tmid_322985', // Gustavo Hamer (Coventry)
  'tmid_744728', // Arijon Ibrahimovic (Augsburg)
  'tmid_181136', // Piotr Zieliński (Inter)
  'tmid_153084', // Leon Goretzka (Aston Villa)
  'tmid_156990', // Marco Friedl (Werder Bremen)
  'tmid_190393', // Corentin Tolisso (Lyon)
  'tmid_257732', // Amir Rrahmani (Napoli)
  'tmid_599231', // Ferran Jutglà (Celta)
  'tmid_552057', // Adam Hlozek (Hoffenheim)
  'tmid_336012', // Nicolas Kühn (Mönchengladbach)
  'tmid_539252', // Costinha (Brighton)
  'tmid_195778', // Alexander Nübel (Beşiktaş)
  'tmid_177476', // Nathan Aké (Fenerbahçe)
  'tmid_165793', // Takumi Minamino (Monaco)
  'tmid_341092', // Federico Chiesa (Liverpool)
  'tmid_51471', // Mateo Kovacic (Man City)
  'tmid_303657', // Ionuț Radu (Celta)
  'tmid_192735', // Stanislav Lobotka (Napoli)
  'tmid_303254', // Fikayo Tomori (AC Milan)
  'tmid_352041', // Lucas Perri (Torino)
  'tmid_318077', // Lucas Torreira (Galatasaray)
  'tmid_539134', // Daniel Maldini (Cagliari)
  'tmid_202886', // Ruben Loftus-Cheek (AC Milan)
  'tmid_557407', // Devyne Rensch (Roma)
  'tmid_552223', // Filip Stanković (Venezia)
  'tmid_649672', // Nicolás Capaldo (Hamburg)
  'tmid_620313', // Lucas Gourna-Douath (Hull City)
  'tmid_234509', // André Onana (Trabzonspor)
  'tmid_610405', // Maurits Kjærgaard (Lille)
  'tmid_238223', // Ederson (Fenerbahçe)
  'tmid_204069', // Milan Škriniar (Fenerbahçe)
  'tmid_240414', // Alex Meret (Napoli)
  'tmid_196948', // Andreas Christensen (Barcelona)
  'tmid_977464', // Arthur (Werder Bremen)
  'tmid_188077', // Ryan Christie (Bournemouth)
  'tmid_537602', // João Mário (Fiorentina)
  'tmid_375137', // Ismail Jakobs (Galatasaray)
  'tmid_111455', // Granit Xhaka (Sunderland)
  'tmid_176553', // Aymeric Laporte (Athletic Club)
  'tmid_420465', // Tiago Djaló (Beşiktaş)
  'tmid_88755', // Kevin De Bruyne (Napoli)
  'tmid_225693', // Fabinho (Trabzonspor)
  'tmid_308279', // Rolando Mandragora (Torino)
  'tmid_371021', // Arijanet Murić (Sassuolo)
  'tmid_302371', // Toni Martínez (Alavés)
  'tmid_169880', // Giovanni Di Lorenzo (Napoli)
  'tmid_341264', // Fran García (Real Betis)
  'tmid_569385', // Adil Aouchiche (FC Schalke 04)
  'tmid_372246', // Carlos Soler (Real Sociedad)
  'tmid_661132', // Exequiel Zeballos (Monza)
  'tmid_348795', // Giovani Lo Celso (Real Betis)
  'tmid_242063', // Vaclav Cerny (Beşiktaş)
  'tmid_461943', // Daniel Bragança (Torino)
  'tmid_199248', // Bryan Cristante (Roma)
  'tmid_281769', // Mario Hermoso (Roma)
  'tmid_467563', // Armel Bella-Kotchap (Venezia)
  'tmid_475413', // Sacha Boey (Bayern Munich)
  'tmid_182712', // João Cancelo (Barcelona)
  'tmid_282388', // Giovanni Simeone (Torino)
  'tmid_358032', // Cyril Ngonge (Monza)
  'tmid_234803', // Andrew Robertson (Tottenham)
  'tmid_477930', // Rıdvan Yılmaz (Beşiktaş)
  'tmid_282144', // Marin Pongracic (Fiorentina)
  'tmid_618809', // Manu Sánchez (Levante)
  'tmid_976561', // Janderson (Göztepe)
  'tmid_86202', // Antonio Rüdiger (Real Madrid)
  'tmid_250845', // José María Giménez (Dep. A Coruña)
  'tmid_524315', // Hidemasa Morita (Hull City)
  'tmid_96341', // Romelu Lukaku (Fenerbahçe)
  'tmid_106987', // Marcel Sabitzer (Dortmund)
  'tmid_319745', // Dani Ceballos (Real Betis)
  'tmid_393565', // Michal Skoras (Lens)
  'tmid_344600', // Michaël Cuisance (Lens)
  'tmid_225122', // Gonçalo Guedes (Real Sociedad)
  'tmid_126664', // Lucas Digne (PSG)
  'tmid_275218', // Augusto Batalla (Rayo Vallecano)
  'tmid_938146', // Adam Aznou (Málaga CF)
  'tmid_574660', // Strahinja Erakovic (Samsunspor)
  'tmid_199316', // Abdülkerim Bardakcı (Galatasaray)
  'tmid_424015', // Nathan Patterson (Torino)
  'tmid_165895', // Matteo Politano (Napoli)
  'tmid_490423', // Ignace Van der Brempt (Sassuolo)
  'tmid_192279', // Kepa Arrizabalaga (Arsenal)
  'tmid_184573', // Victor Lindelöf (Aston Villa)
  'tmid_402008', // Amadou Haidara (Lens)
  'tmid_377042', // Michael Folorunsho (Monza)
  'tmid_726701', // Rodrigo Ribeiro (Augsburg)
  'tmid_467250', // Yukhym Konoplya (Mönchengladbach)
  'tmid_206050', // Paulo Dybala (Roma)
  'tmid_74229', // Koke (Atlético)
  'tmid_159088', // Robert Andrich (Leverkusen)
  'tmid_334222', // Lucas Boyé (Alavés)
  'tmid_646478', // Elias Jelert (Le Havre AC)
  'tmid_656681', // Victor Boniface (Leverkusen)
  'tmid_833315', // Novatus Miroshi (Göztepe)
  'tmid_432982', // Andreas Skov Olsen (Basaksehir)
  'tmid_486604', // Vítězslav Jaroš (Liverpool)
  'tmid_338070', // Konstantinos Tsimikas (Liverpool)
  'tmid_258987', // Carl Starfelt (Celta)
  'tmid_397225', // Alessandro Zanoli (Udinese)
  'tmid_277179', // Angeliño (Dep. A Coruña)
  'tmid_231572', // Nélson Semedo (Fenerbahçe)
  'tmid_536482', // Junior Dina Ebimbe (FC Schalke 04)
  'tmid_336869', // Marc Roca (Real Betis)
  'tmid_175722', // Eric Dier (Monaco)
  'tmid_131225', // Nicolás Tagliafico (Lyon)
  'tmid_296802', // Walter Benítez (Crystal Palace)
  'tmid_240692', // Reinildo Mandava (Sunderland)
  'tmid_291417', // Ferland Mendy (Real Madrid)
  'tmid_225083', // N'Golo Kanté (Fenerbahçe)
  'tmid_324690', // Jonathan Ikoné (Paris FC)
  'tmid_315121', // Justin Bijlow (Genoa)
  'tmid_539795', // Bryan Okoh (AJ Auxerre)
  'tmid_17259', // Manuel Neuer (Bayern Munich)
  'tmid_517376', // Yusuf Sarı (Basaksehir)
  'tmid_364258', // Bernardo (Hoffenheim)
  'tmid_655902', // Emin Bayram (Basaksehir)
  'tmid_432914', // John Victor (Nott'm Forest)
  'tmid_118689', // Leonardo Spinazzola (Napoli)
  'tmid_197300', // Federico Bernardeschi (Bologna)
  'tmid_170934', // Mario Lemina (Galatasaray)
  'tmid_59377', // David de Gea (Fiorentina)
  'tmid_197642', // Chuba Akpom (Ipswich)
  'tmid_27992', // Luka Modrić (AC Milan)
  'tmid_559333', // Kian Fitz-Jim (Torino)
  'tmid_342385', // Guido Rodríguez (Valencia)
  'tmid_85288', // Isco (Real Betis)
  'tmid_330871', // Muhammed Şengezer (Basaksehir)
  'tmid_138927', // Daniel Carvajal (Getafe)
  'tmid_263361', // Maximilian Wöber (FC Schalke 04)
  'tmid_419067', // Giorgi Tsitaishvili (Rayo Vallecano)
  'tmid_365172', // Patson Daka (Hamburg)
  'tmid_441170', // Valentin Rosier (CA Osasuna)
  'tmid_119211', // Mitchell Weiser (Werder Bremen)
  'tmid_119296', // Emre Can (Dortmund)
  'tmid_59016', // David Alaba (Udinese)
  'tmid_124419', // Odysseas Vlachodimos (Sevilla FC)
  'tmid_135343', // Fabian Schär (Newcastle)
  'tmid_74842', // Mario Götze (Frankfurt)
  'tmid_146310', // Wataru Endo (Liverpool)
  'tmid_67063', // Danny Welbeck (Chelsea)
  'tmid_292246', // Hee-chan Hwang (FC Schalke 04)
  'tmid_84301', // Benjamin André (Lille)
  'tmid_55735', // Henrikh Mkhitaryan (Inter)
  'tmid_251322', // Philipp Köhn (Monaco)
  'tmid_238266', // Duje Caleta-Car (Sassuolo)
  'tmid_256339', // Emil Audero (Rayo Vallecano)
  'tmid_291739', // Milot Rashica (Beşiktaş)
  'tmid_127189', // Geoffrey Kondogbia (Marseille)
  'tmid_216603', // İrfan Can Kahveci (Fenerbahçe)
  'tmid_375877', // Vakoun Bayo (Udinese)
  'tmid_402010', // Sékou Koïta (Genclerbirligi)
  'tmid_289446', // Yerry Mina (Cagliari)
  'tmid_492319', // Franco Israel (Torino)
  'tmid_187718', // Clinton Mata (Lyon)
  'tmid_290552', // Qazim Laci (C. Rizespor)
  'tmid_203938', // Branco van den Boomen (Angers SCO)
  'tmid_407745', // Maik Nawrocki (Lens)
  'tmid_325924', // Ahmed Touba (Le Havre AC)
  'tmid_469787', // Berkan Kutlu (Kocaelispor)
  'tmid_697149', // Kazımcan Karataş (Galatasaray)
  'tmid_298583', // Eray Cömert (Torino)
  'tmid_284854', // Carles Aleñá (Alavés)
  'tmid_46580', // Andrej Kramaric (Hoffenheim)
  'tmid_191217', // Héctor Bellerín (Real Betis)
  'tmid_483063', // Berat Özdemir (Corum FK)
  'tmid_258015', // Diogo Gonçalves (Konyaspor)
  'tmid_644032', // Cheikh Niasse (Genclerbirligi)
  'tmid_461951', // Kartal Yılmaz (Beşiktaş)
  'tmid_433584', // Alessio Zerbin (Frosinone)
  'tmid_672597', // Ibrahim Olawoyin (C. Rizespor)
  'tmid_204189', // Okan Kocuk (Samsunspor)
  'tmid_452477', // Junior Adamu (FC Schalke 04)
  'tmid_422051', // Nikola Katic (FC Schalke 04)
  'tmid_162959', // Daniele Rugani (Juventus)
  'tmid_371141', // Stanley Nsoki (Union Berlin)
  'tmid_727077', // Jankat Yılmaz (Galatasaray)
  'tmid_362977', // Josip Juranovic (Union Berlin)
  'tmid_330635', // Felix Götze (SC Paderborn)
  'tmid_743395', // Noah Mbamba (FC Lorient)
  'tmid_538998', // Timothée Pembélé (Le Havre AC)
  'tmid_45672', // Kevin Trapp (Paris FC)
  'tmid_205562', // Thomas Lemar (Elche CF)
  'tmid_401604', // Michal Karbownik (Basaksehir)
  'tmid_243856', // Cedric Itten (Werder Bremen)
  'tmid_282076', // Ianis Hagi (Alanyaspor)
  'tmid_74683', // Nemanja Matić (Sassuolo)
  'tmid_181380', // Arthur Masuaku (Konyaspor)
  'tmid_53622', // İlkay Gündoğan (Galatasaray)
  'tmid_271495', // Abdülkadir Ömür (Hull City)
  'tmid_282028', // Rémy Descamps (Lyon)
  'tmid_48015', // Lukas Hradecky (Monaco)
  'tmid_100986', // Thomas Meunier (Sunderland)
  'tmid_174196', // Kenny Lala (Stade Brestois)
  'tmid_898352', // Sebastián Boselli (Getafe)
  'tmid_250153', // Pasquale Mazzocchi (Venezia)
  'tmid_655899', // Serdar Saatçı (Corum FK)
  'tmid_7161', // Jonas Hofmann (Leverkusen)
  'tmid_671593', // Mamady Diambou (Stade Brestois)
  'tmid_155025', // Fábio Cardoso (Sevilla FC)
  'tmid_539665', // Fredrik Oppegård (AJ Auxerre)
  'tmid_221316', // Lucas Vázquez (Leverkusen)
  'tmid_733410', // Lawrence Agyekum (Erzurumspor FK)
  'tmid_618869', // Metehan Baltacı (Genclerbirligi)
  'tmid_54906', // Matteo Darmian (Bologna)
  'tmid_197471', // Roberto Gagliardini (Cagliari)
  'tmid_112515', // Marcos Alonso (Celta)
  'tmid_35047', // Axel Witsel (Nice)
  'tmid_61651', // Jordan Henderson (Chelsea)
  'tmid_538996', // Tanguy Nianzou (Lille)
  'tmid_449151', // Junior Messias (Genoa)
  'tmid_119031', // Kaan Ayhan (Galatasaray)
  'tmid_57071', // Péter Gulácsi (Villarreal)
  'tmid_520815', // Ousseynou Ba (Basaksehir)
  'tmid_249952', // Berkay Özcan (Basaksehir)
  'tmid_121985', // Juan Jesus (Venezia)
  'tmid_341019', // Güven Yalçın (Kasimpasa)
  'tmid_161869', // Djibril Sidibé (Le Mans FC)
  'tmid_336074', // Celil Yüksel (Samsunspor)
  'tmid_165007', // Denis Suárez (Alavés)
  'tmid_284876', // Paolo Fernandes (Alanyaspor)
  'tmid_187624', // Fabian Bredlow (Stuttgart)
  'tmid_61812', // Yuri Berchiche (Athletic Club)
  'tmid_28396', // Edin Dzeko (FC Schalke 04)
  'tmid_82442', // Olivier Giroud (Lille)
  'tmid_99922', // Marc Bartra (Real Betis)
  'tmid_111819', // Neto (Juventus)
  'tmid_44058', // Wojciech Szczęsny (Barcelona)
  'tmid_280730', // Álvaro Odriozola (Real Sociedad)
  'tmid_125858', // Kerem Demirbay (Kasimpasa)
  'tmid_605110', // Eyüp Aydın (Galatasaray)
  'tmid_465606', // Halil Dervişoğlu (Gaziantep FK)
  'tmid_182201', // Mbwana Samatta (Le Havre AC)
  'tmid_271966', // Mbaye Diagne (Amed SK)
  'tmid_942940', // Ali Turap Bülbül (Amed SK)
  'tmid_40680', // Sven Ulreich (Bayern Munich)
  'tmid_170838', // Salih Uçan (Genclerbirligi)
  'tmid_191829', // Dimitrios Goutas (Genclerbirligi)
  'tmid_364133', // Pietro Pellegri (Torino)
  'tmid_706815', // Harvey Davies (Liverpool)
  'tmid_225020', // Mariano Díaz (Alavés)
  'tmid_52570', // Fraser Forster (Bournemouth)
  'tmid_250683', // Nikita Contini (Napoli)
  'tmid_727152', // Hamza Akman (Eyüpspor)
  'tmid_107010', // Stefan Savić (Trabzonspor)
  'tmid_727147', // Emre Bilgin (Eyüpspor)
  'tmid_70580', // Raffaele Di Gennaro (Inter)
  'tmid_51894', // Mert Günok (Fenerbahçe)
  'tmid_85543', // Niklas Lomb (Leverkusen)
  'tmid_75411', // Carlo Pinsoglio (Juventus)
  'tmid_114422', // Günay Güvenç (Galatasaray)
  'tmid_226802', // Andreas Gianniotis (Kasimpasa)
  'tmid_27807', // Daniele Padelli (Udinese)
  'tmid_34130', // Tom Heaton (Man Utd)
  'tmid_91945', // Ertuğrul Taşkıran (Erzurumspor FK)
  'tmid_109217', // Edin Visca (Basaksehir)
  'tmid_117586', // Ömer Bayram (Kasimpasa)
  'tmid_338055', // Veysel Sapan (Amed SK)
  'tmid_67886', // Paulo Victor (Alanyaspor)
  'tmid_52261', // Volkan Babacan (Basaksehir)
  'tmid_28003', // Lionel Messi (Legend)
  'tmid_340879', // Merih Demiral (Legend)
  'tmid_51152', // Aleksandar Mitrović (Legend)
  'tmid_8198', // Cristiano Ronaldo (Legend)
  'tmid_68290', // Neymar (Legend)
  'tmid_156617', // Marcelo Brozovic (Legend)
  'tmid_258626', // Talisca (Legend)
  'tmid_16306', // Casemiro (Legend)
  'tmid_200512', // Sadio Mané (Legend)
  'tmid_102558', // Marco Verratti (Legend)
  'tmid_167850', // Memphis Depay (Legend)
  'tmid_140776', // Yannick Carrasco (Legend)
  'tmid_131789', // Roberto Firmino (Legend)
  'tmid_18922', // Karim Benzema (Legend)
  'tmid_171424', // Riyad Mahrez (Legend)
  'tmid_68863', // Mauro Icardi (Legend)
  'tmid_207834', // Yassine Bounou (Legend)
  'tmid_85148', // Julian Draxler (Legend)
  'tmid_255755', // Alex Telles (Legend)
  'tmid_80444', // Philippe Coutinho (Legend)
  'tmid_139396', // Bruma (Legend)
  'tmid_145988', // Wilfried Zaha (Legend)
  'tmid_49499', // Georginio Wijnaldum (Legend)
  'tmid_217111', // Hakim Ziyech (Legend)
  'tmid_122153', // Paul Pogba (Legend)
  'tmid_77100', // Lucas Moura (Legend)
  'tmid_41384', // Marko Arnautovic (Legend)
  'tmid_228645', // Wout Weghorst (Legend)
  'tmid_81999', // Joselu (Legend)
  'tmid_179184', // Michy Batshuayi (Legend)
  'tmid_45320', // Ángel Di María (Legend)
  'tmid_134425', // Raheem Sterling (Legend)
  'tmid_36139', // Dusan Tadic (Legend)
  'tmid_88103', // James Rodríguez (Legend)
  'tmid_145707', // Danilo (Legend)
  'tmid_162571', // Anastasios Bakasetas (Legend)
  'tmid_58884', // Nacho Fernández (Legend)
  'tmid_44352', // Luis Suárez (Legend)
  'tmid_212832', // Dimitrios Pelkas (Legend)
  'tmid_42460', // Ivan Perisic (Legend)
  'tmid_86792', // Xherdan Shaqiri (Legend)
  'tmid_12282', // Daley Blind (Legend)
  'tmid_79960', // Alex Sandro (Legend)
  'tmid_197838', // Jamie Vardy (Legend)
  'tmid_80562', // Hulk (Legend)
  'tmid_40433', // Alexis Sánchez (Legend)
  'tmid_69633', // Christian Eriksen (Legend)
  'tmid_54781', // Nicolás Otamendi (Legend)
  'tmid_91970', // Juan Guillermo Cuadrado (Legend)
  'tmid_25557', // Sergio Ramos (Legend)
  'tmid_84535', // Eduardo Salvio (Legend)
  'tmid_79422', // Keylor Navas (Legend)
  'tmid_58088', // Fernando Muslera (Legend)
  'tmid_118022', // Younès Belhanda (Legend)
  'tmid_15452', // Raúl Albiol (Legend)
  'tmid_118287', // Rachid Ghezzal (Legend)
  'tmid_147487', // Vincent Aboubakar (Legend)
  'tmid_46083', // Domagoj Vida (Legend)
  'tmid_144303', // Lazar Markovic (Legend)
  'tmid_29241', // Thiago Silva (Legend)
  'tmid_48280', // Edinson Cavani (Legend)
  'tmid_99343', // Ander Herrera (Legend)
  'tmid_12249', // Éver Banega (Legend)
  'tmid_278654', // Emre Akbaba (Legend)
  'tmid_45671', // Cenk Tosun (Legend)
  'tmid_277114', // Jason Denayer (Legend)
  'tmid_44068', // Juan Mata (Legend)
  'tmid_75615', // Douglas Costa (Legend)
  'tmid_29364', // João Moutinho (Legend)
  'tmid_170895', // Garry Rodrigues (Legend)
  'tmid_52769', // Willian (Legend)
  'tmid_59866', // Victor Moses (Legend)
  'tmid_37838', // Dejan Lovren (Legend)
  'tmid_50935', // Chicharito (Legend)
  'tmid_203412', // Andreas Cornelius (Legend)
  'tmid_41982', // Radja Nainggolan (Legend)
  'tmid_10471', // Luiz Gustavo (Legend)
  'tmid_137582', // Martin Linnes (Legend)
  'tmid_37666', // Arturo Vidal (Legend)
  'tmid_46741', // David Luiz (Legend)
  'tmid_81785', // Shinji Kagawa (Legend)
  'tmid_25508', // Salvatore Sirigu (Legend)
  'tmid_66515', // Alex Teixeira (Legend)
  'tmid_57162', // Sofiane Feghouli (Legend)
  'tmid_88374', // Veysel Sarı (Legend)
  'tmid_33706', // Nani (Legend)
  'tmid_175988', // Anthony Nwakaeme (Legend)
  'tmid_55619', // Nordin Amrabat (Legend)
  'tmid_99186', // Alper Potuk (Legend)
  'tmid_40687', // Mathieu Valbuena (Legend)
  'tmid_46552', // Kamil Glik (Legend)
  'tmid_75442', // Nico Gaitán (Legend)
  'tmid_20137', // José Sosa (Legend)
  'tmid_60889', // Gary Medel (Legend)
  'tmid_39152', // Radamel Falcao (Legend)
  'tmid_3373', // Ronaldinho (Legend)
  'tmid_3140', // Ronaldo Nazário (Legend)
  'tmid_7349', // Raúl (Legend)
  'tmid_3979', // Iker Casillas (Legend)
  'tmid_7518', // Roberto Carlos (Legend)
  'tmid_3446', // Luís Figo (Legend)
  'tmid_7530', // Guti (Legend)
  'tmid_7513', // Fernando Hierro (Legend)
  'tmid_7515', // Míchel Salgado (Legend)
  'tmid_7514', // Iván Helguera (Legend)
  'tmid_3980', // Steve McManaman (Legend)
  'tmid_7531', // Fernando Morientes (Legend)
  'tmid_4182', // Claude Makélélé (Legend)
  'tmid_3139', // David Beckham (Legend)
  'tmid_1397', // Michael Owen (Legend)
  'tmid_15511', // Robinho (Legend)
  'tmid_3407', // Ruud van Nistelrooy (Legend)
  'tmid_5775', // Fabio Cannavaro (Legend)
  'tmid_4673', // Wesley Sneijder (Legend)
  'tmid_4360', // Arjen Robben (Legend)
  'tmid_3366', // Kaká (Legend)
  'tmid_39381', // Gareth Bale (Legend)
  'tmid_31909', // Toni Kroos (Legend)
  'tmid_44501', // Marcelo (Legend)
  'tmid_14132', // Pepe (Legend)
  'tmid_7476', // Xabi Alonso (Legend)
  'tmid_35664', // Mesut Özil (Legend)
  'tmid_39153', // Gonzalo Higuaín (Legend)
  'tmid_29401', // Sami Khedira (Legend)
  'tmid_28260', // Álvaro Arbeloa (Legend)
  'tmid_23914', // Lassana Diarra (Legend)
  'tmid_5352', // Mahamadou Diarra (Legend)
  'tmid_15952', // Júlio Baptista (Legend)
  'tmid_61253', // José Callejón (Legend)
  'tmid_44065', // Esteban Granero (Legend)
  'tmid_38954', // Fernando Gago (Legend)
  'tmid_5555', // Gabriel Heinze (Legend)
  'tmid_5938', // Walter Samuel (Legend)
  'tmid_7527', // Santiago Solari (Legend)
  'tmid_24481', // Predrag Mijatović (Legend)
  'tmid_1407', // Davor Suker (Legend)
  'tmid_4168', // Clarence Seedorf (Legend)
  'tmid_5811', // Fernando Redondo (Legend)
  'tmid_9209', // Christian Karembeu (Legend)
  'tmid_24474', // Bodo Illgner (Legend)
  'tmid_129083', // Iván Zamorano (Legend)
  'tmid_8023', // Michael Laudrup (Legend)
  'tmid_84528', // Hugo Sánchez (Legend)
  'tmid_117598', // Emilio Butragueño (Legend)
  'tmid_7607', // Xavi (Legend)
  'tmid_7600', // Andrés Iniesta (Legend)
  'tmid_7594', // Carles Puyol (Legend)
  'tmid_18944', // Gerard Piqué (Legend)
  'tmid_65230', // Sergio Busquets (Legend)
  'tmid_69751', // Jordi Alba (Legend)
  'tmid_15951', // Dani Alves (Legend)
  'tmid_7980', // David Villa (Legend)
  'tmid_4257', // Samuel Eto'o (Legend)
  'tmid_3207', // Thierry Henry (Legend)
  'tmid_3372', // Rivaldo (Legend)
  'tmid_7942', // Romário (Legend)
  'tmid_8564', // Deco (Legend)
  'tmid_7940', // Ronald Koeman (Legend)
  'tmid_7938', // Hristo Stoichkov (Legend)
  'tmid_5950', // Pep Guardiola (Legend)
  'tmid_4385', // Patrick Kluivert (Legend)
  'tmid_3513', // Marc Overmars (Legend)
  'tmid_3518', // Frank de Boer (Legend)
  'tmid_5198', // Phillip Cocu (Legend)
  'tmid_3191', // Giovanni van Bronckhorst (Legend)
  'tmid_3514', // Henrik Larsson (Legend)
  'tmid_5299', // Ludovic Giuly (Legend)
  'tmid_2904', // Rafa Márquez (Legend)
  'tmid_5283', // Éric Abidal (Legend)
  'tmid_13091', // Yaya Touré (Legend)
  'tmid_5486', // Seydou Keita (Legend)
  'tmid_19981', // Javier Mascherano (Legend)
  'tmid_8806', // Cesc Fàbregas (Legend)
  'tmid_32467', // Ivan Rakitic (Legend)
  'tmid_7589', // Víctor Valdés (Legend)
  'tmid_40423', // Claudio Bravo (Legend)
  'tmid_34495', // Adriano Correia (Legend)
  'tmid_4317', // Maxwell (Legend)
  'tmid_7829', // Juliano Belletti (Legend)
  'tmid_5343', // Edmílson (Legend)
  'tmid_3359', // Sylvinho (Legend)
  'tmid_5757', // Gianluca Zambrotta (Legend)
  'tmid_3455', // Zlatan Ibrahimović (Legend)
  'tmid_44675', // Bojan Krkic (Legend)
  'tmid_44162', // Miralem Pjanić (Legend)
  'tmid_26399', // Sergio Agüero (Legend)
  'tmid_3408', // Diego Forlán (Legend)
  'tmid_54928', // Diego Godín (Legend)
  'tmid_21725', // Filipe Luís (Legend)
  'tmid_8538', // Tiago Mendes (Legend)
  'tmid_34601', // Raúl García (Legend)
  'tmid_16635', // Juanfran Torres (Legend)
  'tmid_44779', // Diego Costa (Legend)
  'tmid_34572', // Mario Mandžukić (Legend)
  'tmid_3411', // Pablo Aimar (Legend)
  'tmid_7565', // Roberto Ayala (Legend)
  'tmid_7562', // Santiago Cañizares (Legend)
  'tmid_4191', // Rubén Baraja (Legend)
  'tmid_7575', // David Albelda (Legend)
  'tmid_7582', // Vicente (Legend)
  'tmid_27389', // Kévin Gameiro (Legend)
  'tmid_3854', // Juan Román Riquelme (Legend)
  'tmid_7840', // Marcos Senna (Legend)
  'tmid_3994', // Roy Makaay (Legend)
  'tmid_2960', // Djalminha (Legend)
  'tmid_5803', // Paolo Maldini (Legend)
  'tmid_4171', // Alessandro Nesta (Legend)
  'tmid_5937', // Cafu (Legend)
  'tmid_5813', // Gennaro Gattuso (Legend)
  'tmid_5817', // Andrea Pirlo (Legend)
  'tmid_5821', // Filippo Inzaghi (Legend)
  'tmid_3522', // Andriy Shevchenko (Legend)
  'tmid_5800', // Dida (Legend)
  'tmid_10055', // Alessandro Costacurta (Legend)
  'tmid_42049', // Franco Baresi (Legend)
  'tmid_74471', // Marco van Basten (Legend)
  'tmid_101045', // Ruud Gullit (Legend)
  'tmid_70667', // Frank Rijkaard (Legend)
  'tmid_8542', // George Weah (Legend)
  'tmid_89545', // Zvonimir Boban (Legend)
  'tmid_35894', // Dejan Savicevic (Legend)
  'tmid_3154', // Marcel Desailly (Legend)
  'tmid_5818', // Massimo Ambrosini (Legend)
  'tmid_5819', // Serginho (Legend)
  'tmid_3557', // Jaap Stam (Legend)
  'tmid_3410', // Hernán Crespo (Legend)
  'tmid_3624', // Rui Costa (Legend)
  'tmid_4169', // Jon Dahl Tomasson (Legend)
  'tmid_3532', // Marek Jankulovski (Legend)
  'tmid_5837', // Massimo Oddo (Legend)
  'tmid_37579', // Alexandre Pato (Legend)
  'tmid_3515', // Mark van Bommel (Legend)
  'tmid_16922', // Kevin-Prince Boateng (Legend)
  'tmid_4276', // Carlos Tévez (Legend)
  'tmid_5023', // Gianluigi Buffon (Legend)
  'tmid_4289', // Alessandro Del Piero (Legend)
  'tmid_3603', // Pavel Nedved (Legend)
  'tmid_29260', // Giorgio Chiellini (Legend)
  'tmid_39983', // Leonardo Bonucci (Legend)
  'tmid_7109', // Andrea Barzagli (Legend)
  'tmid_44716', // Claudio Marchisio (Legend)
  'tmid_4146', // David Trezeguet (Legend)
  'tmid_5762', // Mauro Camoranesi (Legend)
  'tmid_5758', // Edgar Davids (Legend)
  'tmid_5749', // Ciro Ferrara (Legend)
  'tmid_5747', // Paolo Montero (Legend)
  'tmid_5751', // Gianluca Pessotto (Legend)
  'tmid_5748', // Alessio Tacchinardi (Legend)
  'tmid_5759', // Antonio Conte (Legend)
  'tmid_75553', // Didier Deschamps (Legend)
  'tmid_4226', // Fabrizio Ravanelli (Legend)
  'tmid_16036', // Gianluca Vialli (Legend)
  'tmid_4153', // Roberto Baggio (Legend)
  'tmid_2865', // Stephan Lichtsteiner (Legend)
  'tmid_63531', // Kwadwo Asamoah (Legend)
  'tmid_33923', // Blaise Matuidi (Legend)
  'tmid_45124', // Medhi Benatia (Legend)
  'tmid_1161', // Javier Zanetti (Legend)
  'tmid_18301', // Maicon (Legend)
  'tmid_77', // Lúcio (Legend)
  'tmid_22412', // Júlio César (Legend)
  'tmid_5876', // Adriano (Legend)
  'tmid_5958', // Francesco Totti (Legend)
  'tmid_15185', // Lukas Podolski (Legend)
  'tmid_9828', // Ricardo Carvalho (Legend)
  'tmid_54170', // Ramires (Legend)
  'tmid_85314', // Oscar (Legend)
  'tmid_26267', // Fernandinho (Legend)
  'tmid_4188', // Ricardo Quaresma (Legend)
  'tmid_7939', // Gheorghe Hagi (Legend)
  'tmid_21369', // Arda Turan (Legend)
  'tmid_34987', // Burak Yılmaz (Legend)
  'tmid_44017', // Javi Martínez (Legend)
  'tmid_90681', // Eliaquim Mangala (Legend)
  'tmid_5797', // Christian Vieri (Legend)
  'tmid_5796', // Álvaro Recoba (Legend)
  'tmid_5769', // Francesco Toldo (Legend)
  'tmid_3216', // Milan Baros (Legend)
  'tmid_3966', // Djibril Cissé (Legend)
  'tmid_22068', // Franck Ribéry (Legend)
  'tmid_2219', // Philipp Lahm (Legend)
  'tmid_2514', // Bastian Schweinsteiger (Legend)
  'tmid_206', // Oliver Kahn (Legend)
  'tmid_50143', // Jonas (Legend)
  'tmid_13230', // Luisão (Legend)
  'tmid_3626', // Nuno Gomes (Legend)
  'tmid_8019', // Simão (Legend)
  'tmid_6913', // Antônio Carlos Zago (Legend)
  'tmid_6888', // Daniel Pancu (Legend)
  'tmid_6879', // Tümer Metin (Legend)
  'tmid_31867', // Yasin Öztekin (Legend)
  'tmid_45624', // Aurélien Chedjou (Legend)
  'tmid_3521', // Lilian Thuram (Legend)
  'tmid_33357', // Miranda (Legend)
  'tmid_22969', // Gabi (Legend)
  'tmid_35518', // David Silva (Legend)
  'tmid_3430', // Kakhaber Kaladze (Legend)
  'tmid_7520', // Esteban Cambiasso (Legend)
  'tmid_22202', // Diego Milito (Legend)
  'tmid_5778', // Marco Materazzi (Legend)
  'tmid_5772', // Iván Córdoba (Legend)
  'tmid_4314', // Cristian Chivu (Legend)
  'tmid_3428', // Dejan Stanković (Legend)
  'tmid_7602', // Thiago Motta (Legend)
  'tmid_12563', // Goran Pandev (Legend)
  'tmid_5794', // Obafemi Martins (Legend)
  'tmid_6006', // Julio Cruz (Legend)
  'tmid_3143', // Juan Sebastián Verón (Legend)
  'tmid_28021', // Samir Handanovič (Legend)
  'tmid_39099', // Rodrigo Palacio (Legend)
  'tmid_39090', // Fredy Guarín (Legend)
  'tmid_5947', // Daniele De Rossi (Legend)
  'tmid_5959', // Gabriel Batistuta (Legend)
  'tmid_5960', // Vincenzo Montella (Legend)
  'tmid_5961', // Marco Delvecchio (Legend)
  'tmid_4151', // Aldair (Legend)
  'tmid_5939', // Vincent Candela (Legend)
  'tmid_70', // Emerson (Legend)
  'tmid_6448', // Mirko Vučinić (Legend)
  'tmid_104752', // Konstantinos Manolas (Legend)
  'tmid_46156', // Aleksandar Kolarov (Legend)
  'tmid_38593', // Marek Hamsik (Legend)
  'tmid_50570', // Ezequiel Lavezzi (Legend)
  'tmid_10', // Miroslav Klose (Legend)
  'tmid_3415', // Marcelo Salas (Legend)
  'tmid_5834', // Sinisa Mihajlovic (Legend)
  'tmid_5849', // Simone Inzaghi (Legend)
  'tmid_5980', // Luca Toni (Legend)
  'tmid_22328', // Fabio Quagliarella (Legend)
  'tmid_5985', // Gianluca Pagliuca (Legend)
  'tmid_5826', // Angelo Peruzzi (Legend)
  'tmid_3332', // Wayne Rooney (Legend)
  'tmid_3397', // Paul Scholes (Legend)
  'tmid_3406', // Ryan Giggs (Legend)
  'tmid_3235', // Rio Ferdinand (Legend)
  'tmid_19726', // Nemanja Vidic (Legend)
  'tmid_5285', // Patrice Evra (Legend)
  'tmid_3516', // Edwin van der Sar (Legend)
  'tmid_3403', // Gary Neville (Legend)
  'tmid_3396', // Roy Keane (Legend)
  'tmid_12000', // Éric Cantona (Legend)
  'tmid_3465', // Peter Schmeichel (Legend)
  'tmid_3394', // Ole Gunnar Solskjaer (Legend)
  'tmid_3223', // Dwight Yorke (Legend)
  'tmid_3238', // Andy Cole (Legend)
  'tmid_3392', // Teddy Sheringham (Legend)
  'tmid_4280', // Denis Irwin (Legend)
  'tmid_3543', // Nicky Butt (Legend)
  'tmid_3404', // Phil Neville (Legend)
  'tmid_3405', // Wes Brown (Legend)
  'tmid_3540', // John O'Shea (Legend)
  'tmid_3547', // Darren Fletcher (Legend)
  'tmid_3878', // Michael Carrick (Legend)
  'tmid_4592', // Ji-sung Park (Legend)
  'tmid_65', // Dimitar Berbatov (Legend)
  'tmid_4380', // Robin van Persie (Legend)
  'tmid_33544', // Antonio Valencia (Legend)
  'tmid_65278', // Pedro (Legend)
  'tmid_4010', // Dirk Kuyt (Legend)
  'tmid_3220', // John Arne Riise (Legend)
  'tmid_24180', // Martin Skrtel (Legend)
  'tmid_3209', // Jerzy Dudek (Legend)
  'tmid_919', // Dietmar Hamann (Legend)
  'tmid_47082', // Daniel Sturridge (Legend)
  'tmid_82105', // Joël Matip (Legend)
  'tmid_148368', // Divock Origi (Legend)
  'tmid_60444', // Thiago Alcántara (Legend)
  'tmid_3187', // Dennis Bergkamp (Legend)
  'tmid_3183', // Patrick Vieira (Legend)
  'tmid_3185', // Robert Pirès (Legend)
  'tmid_3134', // Freddie Ljungberg (Legend)
  'tmid_3198', // Sol Campbell (Legend)
  'tmid_3182', // Ashley Cole (Legend)
  'tmid_3202', // Kolo Touré (Legend)
  'tmid_122', // Jens Lehmann (Legend)
  'tmid_3141', // David Seaman (Legend)
  'tmid_28238', // Tony Adams (Legend)
  'tmid_3184', // Martin Keown (Legend)
  'tmid_3208', // Ray Parlour (Legend)
  'tmid_3133', // Nwankwo Kanu (Legend)
  'tmid_3188', // Sylvain Wiltord (Legend)
  'tmid_3194', // Gilberto Silva (Legend)
  'tmid_7717', // José Antonio Reyes (Legend)
  'tmid_597', // Aleksandr Hleb (Legend)
  'tmid_132', // Tomas Rosicky (Legend)
  'tmid_7449', // Gaël Clichy (Legend)
  'tmid_18935', // Samir Nasri (Legend)
  'tmid_15378', // Andrey Arshavin (Legend)
  'tmid_50057', // Aaron Ramsey (Legend)
  'tmid_3924', // Didier Drogba (Legend)
  'tmid_3163', // Frank Lampard (Legend)
  'tmid_3160', // John Terry (Legend)
  'tmid_5658', // Petr Cech (Legend)
  'tmid_50202', // Eden Hazard (Legend)
  'tmid_5588', // Michael Essien (Legend)
  'tmid_63', // Michael Ballack (Legend)
  'tmid_9832', // Paulo Ferreira (Legend)
  'tmid_3156', // William Gallas (Legend)
  'tmid_3876', // Joe Cole (Legend)
  'tmid_3259', // Damien Duff (Legend)
  'tmid_3176', // Eidur Gudjohnsen (Legend)
  'tmid_3177', // Gianfranco Zola (Legend)
  'tmid_5461', // Florent Malouda (Legend)
  'tmid_7971', // Salomon Kalou (Legend)
  'tmid_3226', // Nicolas Anelka (Legend)
  'tmid_36827', // Branislav Ivanovic (Legend)
  'tmid_27511', // Gary Cahill (Legend)
  'tmid_30739', // John Obi Mikel (Legend)
  'tmid_9594', // Vincent Kompany (Legend)
  'tmid_20007', // Pablo Zabaleta (Legend)
  'tmid_40204', // Joe Hart (Legend)
  'tmid_3291', // Gareth Barry (Legend)
  'tmid_4192', // Rafael van der Vaart (Legend)
  'tmid_3875', // Jermain Defoe (Legend)
  'tmid_19368', // Mousa Dembélé (Legend)
  'tmid_43250', // Jan Vertonghen (Legend)
  'tmid_42710', // Toby Alderweireld (Legend)
  'tmid_16911', // Kasper Schmeichel (Legend)
  'tmid_3110', // Alan Shearer (Legend)
  'tmid_104637', // Ian Wright (Legend)
  'tmid_3830', // Paul Gascoigne (Legend)
  'tmid_7451', // Mikel Arteta (Legend)
  'tmid_3333', // James Milner (Legend)
  'tmid_6288', // Mario Gómez (Legend)
  'tmid_532', // Claudio Pizarro (Legend)
  'tmid_198', // Giovane Élber (Legend)
  'tmid_217', // Mehmet Scholl (Legend)
  'tmid_197', // Stefan Effenberg (Legend)
  'tmid_210', // Bixente Lizarazu (Legend)
  'tmid_213', // Willy Sagnol (Legend)
  'tmid_4740', // Daniel Van Buyten (Legend)
  'tmid_2963', // Martín Demichelis (Legend)
  'tmid_89', // Zé Roberto (Legend)
  'tmid_26485', // Jérôme Boateng (Legend)
  'tmid_129473', // Rafinha (Legend)
  'tmid_54659', // Holger Badstuber (Legend)
  'tmid_16136', // Dante (Legend)
  'tmid_7427', // Ivica Olic (Legend)
  'tmid_29835', // Jakub Blaszczykowski (Legend)
  'tmid_25727', // Lukasz Piszczek (Legend)
  'tmid_40995', // Neven Subotic (Legend)
  'tmid_35208', // Marcel Schmelzer (Legend)
  'tmid_26', // Roman Weidenfeller (Legend)
  'tmid_31095', // Nuri Şahin (Legend)
  'tmid_410', // Sebastian Kehl (Legend)
  'tmid_1157', // Jan Koller (Legend)
  'tmid_4357', // Klaas-Jan Huntelaar (Legend)
  'tmid_16649', // Jefferson Farfán (Legend)
  'tmid_39020', // Benedikt Höwedes (Legend)
  'tmid_4248', // Diego (Legend)
  'tmid_528', // Torsten Frings (Legend)
  'tmid_37772', // Grafite (Legend)
  'tmid_2309', // Zvjezdan Misimovic (Legend)
  'tmid_72347', // Franz Beckenbauer (Legend)
  'tmid_35604', // Gerd Müller (Legend)
  'tmid_1527', // Lothar Matthäus (Legend)
  'tmid_16980', // Jürgen Klinsmann (Legend)
  'tmid_72343', // Karl-Heinz Rummenigge (Legend)
  'tmid_7825', // Pepe Reina (Legend)
  'tmid_77010', // Matthias Sammer (Legend)
  'tmid_55215', // Javier Pastore (Legend)
  'tmid_15420', // Alex (Legend)
  'tmid_14086', // Ashley Young (Legend)
  'tmid_3623', // Pauleta (Legend)
  'tmid_3708', // Jay-Jay Okocha (Legend)
  'tmid_104897', // David Ginola (Legend)
  'tmid_5354', // Juninho Pernambucano (Legend)
  'tmid_5357', // Sidney Govou (Legend)
  'tmid_3165', // Cris (Legend)
  'tmid_3910', // Grégory Coupet (Legend)
  'tmid_27661', // Lisandro López (Legend)
  'tmid_12142', // Michel Bastos (Legend)
  'tmid_15956', // Jesús Navas (Legend)
  'tmid_26244', // Lucho González (Legend)
  'tmid_6118', // Mamadou Niang (Legend)
  'tmid_27941', // Danijel Subasic (Legend)
  'tmid_4178', // Dado Prso (Legend)
  'tmid_33481', // Gervinho (Legend)
  'tmid_29434', // Yohan Cabaye (Legend)
  'tmid_22382', // Moussa Sow (Legend)
  'tmid_74418', // Jackson Martínez (Legend)
  'tmid_51174', // Fernando (Legend)
  'tmid_8016', // Vítor Baía (Legend)
  'tmid_3091', // Benni McCarthy (Legend)
  'tmid_9822', // Maniche (Legend)
  'tmid_9826', // Costinha (Legend)
  'tmid_9831', // Nuno Valente (Legend)
  'tmid_45865', // Óscar Cardozo (Legend)
  'tmid_7611', // Javier Saviola (Legend)
  'tmid_23951', // Steve Mandanda (Legend)
  'tmid_39333', // Caner Erkin (Legend)
  'tmid_4672', // Nigel de Jong (Legend)
  'tmid_4311', // Maarten Stekelenburg (Legend)
  'tmid_4358', // Mateja Kežman (Legend)
  'tmid_3520', // Pierre van Hooijdonk (Legend)
  'tmid_19059', // Heurelho Gomes (Legend)
  'tmid_15760', // Ibrahim Afellay (Legend)
  'tmid_8021', // Johan Cruyff (Legend)
  'tmid_8024', // Diego Maradona (Legend)
  'tmid_17121', // Pelé (Legend)
  'tmid_88994', // Michel Platini (Legend)
  'tmid_3113', // Laurent Blanc (Legend)
  'tmid_3289', // Fabien Barthez (Legend)
  'tmid_3166', // Emmanuel Petit (Legend)
  'tmid_18900', // Hatem Ben Arfa (Legend)
  'tmid_18912', // Yoann Gourcuff (Legend)
  'tmid_18537', // Alex de Souza (Legend)
  'tmid_3129', // Gheorghe Popescu (Legend)
  'tmid_5855', // Claudio Taffarel (Legend)
  'tmid_3625', // Jardel (Legend)
  'tmid_5975', // Stephen Appiah (Legend)
  'tmid_13829', // Diego Lugano (Legend)
  'tmid_6800', // Deivid (Legend)
  'tmid_7421', // Mehmet Aurélio (Legend)
  'tmid_6934', // Tuncay Şanlı (Legend)
  'tmid_7079', // Volkan Demirel (Legend)
  'tmid_4077', // Rüştü Reçber (Legend)
  'tmid_5782', // Emre Belözoğlu (Legend)
  'tmid_33793', // Gökhan Gönül (Legend)
  'tmid_44402', // Mehmet Topal (Legend)
  'tmid_7043', // Semih Şentürk (Legend)
  'tmid_13168', // Raúl Meireles (Legend)
  'tmid_13121', // Bruno Alves (Legend)
  'tmid_48859', // Simon Kjaer (Legend)
  'tmid_73741', // Souza (Legend)
  'tmid_34870', // Roberto Soldado (Legend)
  'tmid_39728', // Mats Hummels (Legend)
  'tmid_3363', // Hakan Şükür (Legend)
  'tmid_3380', // Bülent Korkmaz (Legend)
  'tmid_6102', // Hasan Şaş (Legend)
  'tmid_3381', // Ümit Davala (Legend)
  'tmid_5791', // Okan Buruk (Legend)
  'tmid_92208', // Suat Kaya (Legend)
  'tmid_3703', // Tugay Kerimoğlu (Legend)
  'tmid_8052', // Ergün Penbe (Legend)
  'tmid_3377', // Arif Erdem (Legend)
  'tmid_3378', // Ümit Karan (Legend)
  'tmid_6949', // Necati Ateş (Legend)
  'tmid_7237', // Sabri Sarıoğlu (Legend)
  'tmid_35026', // Selçuk İnan (Legend)
  'tmid_6100', // Faryd Mondragón (Legend)
  'tmid_1419', // Rigobert Song (Legend)
  'tmid_13937', // Stjepan Tomas (Legend)
  'tmid_10298', // Sasa Ilic (Legend)
  'tmid_3499', // Shabani Nonda (Legend)
  'tmid_33366', // Abdul Kader Keita (Legend)
  'tmid_20053', // Elano (Legend)
  'tmid_35537', // Felipe Melo (Legend)
  'tmid_7373', // Albert Riera (Legend)
  'tmid_13058', // Emmanuel Eboué (Legend)
  'tmid_325', // Tomas Ujfalusi (Legend)
  'tmid_4383', // Johan Elmander (Legend)
  'tmid_43530', // Adam Lallana (Legend)
  'tmid_22388', // Bafétimbi Gomis (Legend)
  'tmid_16056', // Andreas Brehme (Legend)
  'tmid_45146', // Mario Balotelli (Legend)
  'tmid_54155', // Mariano (Legend)
  'tmid_6904', // Sergen Yalçın (Legend)
  'tmid_6875', // İlhan Mansız (Legend)
  'tmid_5333', // Pascal Nouma (Legend)
  'tmid_6862', // Óscar Córdoba (Legend)
  'tmid_6887', // Ronaldo Guiaro (Legend)
  'tmid_6914', // İbrahim Üzülmez (Legend)
  'tmid_7264', // İbrahim Toraman (Legend)
  'tmid_8886', // Matías Delgado (Legend)
  'tmid_299', // Fabian Ernst (Legend)
  'tmid_9824', // Hugo Almeida (Legend)
  'tmid_16791', // Manuel Fernandes (Legend)
  'tmid_40205', // Demba Ba (Legend)
  'tmid_55605', // Hasan Ali Kaldırım (Legend)
  'tmid_16101', // Atiba Hutchinson (Legend)
  'tmid_77966', // Oğuzhan Özyakup (Legend)
  'tmid_82130', // Gökhan Töre (Legend)
  'tmid_36200', // Olcay Şahan (Legend)
  'tmid_52920', // Marcelo Guedes (Legend)
  'tmid_16135', // Ryan Babel (Legend)
  'tmid_56416', // Dries Mertens (Legend)
  'tmid_9487', // Shota Arveladze (Legend)
  'tmid_6871', // Gökdeniz Karadeniz (Legend)
  'tmid_6924', // Fatih Tekke (Legend)
  'tmid_7319', // Egemen Korkmaz (Legend)
  'tmid_9813', // Bosingwa (Legend)
  'tmid_148751', // Bruno Peres (Legend)
  'tmid_26432', // Pablo Batalla (Legend)
  'tmid_18829', // Vágner Love (Legend)
  'tmid_8552', // Arouna Koné (Legend)
  'tmid_26101', // Cicinho (Legend)
  'tmid_3429', // Kennet Andersson (Legend)
  'tmid_5519', // Viorel Moldovan (Legend)
  'tmid_6867', // Elvir Bolic (Legend)
  'tmid_12567', // Milan Rapaic (Legend)
  'tmid_2917', // Haim Revivo (Legend)
  'tmid_7076', // Zoran Mirkovic (Legend)
  'tmid_102313', // Uche Okechukwu (Legend)
  'tmid_102755', // Jes Høgh (Legend)
  'tmid_91924', // Metin Oktay (Legend)
  'tmid_137057', // Lefter Küçükandonyadis (Legend)
  'tmid_251073', // Can Bartu (Legend)
  'tmid_92281', // Metin Tekin (Legend)
  'tmid_92276', // Ali Gültiken (Legend)
  'tmid_92239', // Feyyaz Uçar (Legend)
  'tmid_92274', // Rıza Çalımbay (Legend)
  'tmid_17126', // Mehmet Özdilek (Legend)
  'tmid_90976', // Tanju Çolak (Legend)
  'tmid_92222', // Rıdvan Dilmen (Legend)
  'tmid_92225', // Aykut Kocaman (Legend)
  'tmid_92221', // Oğuz Çetin (Legend)
  'tmid_3504', // Alpay Özalan (Legend)
  'tmid_6857', // Fatih Akyel (Legend)
  'tmid_6933', // Ümit Özat (Legend)
  'tmid_2903', // Serhat Akın (Legend)
  'tmid_15419', // Edu Dracena (Legend)
  'tmid_7277', // Fabio Luciano (Legend)
  'tmid_55382', // Cristian (Legend)
  'tmid_54275', // André Santos (Legend)
  'tmid_45559', // Miroslav Stoch (Legend)
  'tmid_120630', // Emmanuel Emenike (Legend)
  'tmid_16589', // Pierre Webó (Legend)
  'tmid_38497', // Jeremain Lens (Legend)
  'tmid_43722', // Mauricio Isla (Legend)
  'tmid_42267', // Nabil Dirar (Legend)
  'tmid_57500', // César Azpilicueta (Legend)
  'tmid_164770', // Raphaël Varane (Legend)
  'tmid_38414', // Ryan Donk (Legend)
  'tmid_60709', // Semih Kaya (Legend)
  'tmid_1792', // Hamit Altıntop (Legend)
  'tmid_10143', // Umut Bulut (Legend)
  'tmid_211325', // Badou Ndiaye (Legend)
  'tmid_3111', // Zinédine Zidane (Legend)
  'tmid_9967', // Blerim Dzemaili (Legend)
  'tmid_8491', // Olcan Adın (Legend)
  'tmid_8399', // Engin Baytar (Legend)
  'tmid_77707', // Emre Çolak (Legend)
  'tmid_7041', // Servet Çetin (Legend)
  'tmid_6911', // Gökhan Zan (Legend)
  'tmid_29494', // Hakan Balta (Legend)
  'tmid_6876', // Ayhan Akman (Legend)
  'tmid_1432', // Fernando Meira (Legend)
  'tmid_1260', // Lincoln (Legend)
  'tmid_3586', // Tobias Linderoth (Legend)
]);

// 🏟️ Kulüplerin Gerçek Lig Şampiyonluğu Yılları (Sezon Bazlı Doğrulama İçin)
export const LEAGUE_CHAMPION_CLUB_YEARS: Record<string, number[]> = {
  // 🇪🇸 La Liga
  'Real Madrid': [1955,1957,1958,1961,1962,1963,1964,1965,1967,1968,1969,1972,1975,1976,1978,1979,1980,1986,1987,1988,1989,1990,1995,1997,2001,2003,2007,2008,2012,2017,2020,2022,2024],
  'Barcelona': [1959,1960,1974,1985,1991,1992,1993,1994,1998,1999,2005,2006,2009,2010,2011,2013,2015,2016,2018,2019,2023,2025],
  'Atlético': [1966,1970,1973,1977,1996,2014,2021],
  'Atlético Madrid': [1966,1970,1973,1977,1996,2014,2021],
  'Valencia': [1971,2002,2004],
  'Dep. A Coruña': [2000],
  'Athletic Club': [1956,1983,1984],
  'Real Sociedad': [1981,1982],

  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League / First Division
  'Man Utd': [1956,1957,1965,1967,1993,1994,1996,1997,1999,2000,2001,2003,2007,2008,2009,2011,2013],
  'Manchester United': [1993,1994,1996,1997,1999,2000,2001,2003,2007,2008,2009,2011,2013],
  'Man City': [1968,2012,2014,2018,2019,2021,2022,2023,2024],
  'Manchester City': [1968,2012,2014,2018,2019,2021,2022,2023,2024],
  'Chelsea': [1955,2005,2006,2010,2015,2017],
  'Arsenal': [1971,1989,1991,1998,2002,2004],
  'Liverpool': [1964,1966,1973,1976,1977,1979,1980,1982,1983,1984,1986,1988,1990,2020,2025],
  'Leicester': [2016],
  'Blackburn': [1995],
  'Leeds': [1969,1974,1992],
  'Everton': [1963,1970,1985,1987],
  'Aston Villa': [1981],
  "Nott'm Forest": [1978],

  // 🇮🇹 Serie A
  'Juventus': [1958,1960,1961,1967,1972,1973,1975,1977,1978,1981,1982,1984,1986,1995,1997,1998,2002,2003,2012,2013,2014,2015,2016,2017,2018,2019,2020],
  'Inter': [1954,1963,1965,1966,1971,1980,1989,2006,2007,2008,2009,2010,2021,2024],
  'AC Milan': [1955,1957,1959,1962,1968,1979,1988,1992,1993,1994,1996,1999,2004,2011,2022],
  'Napoli': [1987,1990,2023,2025],
  'Roma': [1983,2001],
  'Lazio': [1974,2000],
  'Sampdoria': [1991],
  'Hellas Verona': [1985],
  'Torino': [1976],
  'Cagliari': [1970],
  'Fiorentina': [1956,1969],
  'Bologna': [1964],

  // 🇩🇪 Bundesliga
  'Bayern Munich': [1969,1972,1973,1974,1980,1981,1985,1986,1987,1989,1990,1994,1997,1999,2000,2001,2003,2005,2006,2008,2010,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2025],
  'Dortmund': [1956,1957,1963,1995,1996,2002,2011,2012],
  'Leverkusen': [2024],
  'Wolfsburg': [2009],
  'Stuttgart': [1984,1992,2007],
  'Werder Bremen': [1965,1988,1993,2004],
  "1.FC K'lautern": [1991,1998],
  'Hamburg': [1960,1979,1982,1983],
  'Mönchengladbach': [1970,1971,1975,1976,1977],
  '1.FC Köln': [1962,1964,1978],

  // 🇫🇷 Ligue 1
  'PSG': [1986,1994,2013,2014,2015,2016,2018,2019,2020,2022,2023,2024,2025],
  'Lille': [1954,2011,2021],
  'Monaco': [1961,1963,1978,1982,1988,1997,2000,2017],
  'Montpellier': [2012],
  'Marseille': [1971,1972,1989,1990,1991,1992,2010],
  'G. Bordeaux': [1984,1985,1987,1999,2009],
  'Lyon': [2002,2003,2004,2005,2006,2007,2008],
  'FC Nantes': [1965,1966,1973,1977,1980,1983,1995,2001],
  'Lens': [1998],
  'AJ Auxerre': [1996],
  'Saint-Étienne': [1957,1964,1967,1968,1969,1970,1974,1975,1976,1981],

  // 🇹🇷 Süper Lig
  'Galatasaray': [1962,1963,1969,1971,1972,1973,1987,1988,1993,1994,1997,1998,1999,2000,2002,2006,2008,2012,2013,2015,2018,2019,2023,2024,2025],
  'Fenerbahçe': [1959,1961,1964,1965,1968,1970,1974,1975,1978,1983,1985,1989,1996,2001,2004,2005,2007,2011,2014],
  'Beşiktaş': [1957,1958,1960,1966,1967,1982,1986,1990,1991,1992,1995,2003,2009,2016,2017,2021],
  'Trabzonspor': [1976,1977,1979,1980,1981,1984,2022],
  'Basaksehir': [2020],
  'Başakşehir': [2020],
  'Bursaspor': [2010],

  // 🇳🇱🇵🇹🌍 Diğer Büyük Ligler
  'Ajax': [1957,1960,1966,1967,1968,1970,1972,1973,1977,1979,1980,1982,1983,1985,1990,1994,1995,1996,1998,2002,2004,2011,2012,2013,2014,2019,2021,2022,2025],
  'PSV': [1963,1975,1976,1978,1986,1987,1988,1989,1991,1992,1997,2000,2001,2003,2005,2006,2007,2008,2015,2016,2018,2024],
  'Feyenoord': [1961,1962,1965,1969,1971,1974,1984,1993,1999,2017,2023],
  'AZ Alkmaar': [1981,2009],
  'Twente': [2010],
  'Porto': [1956,1959,1978,1979,1985,1986,1988,1990,1992,1993,1995,1996,1997,1998,1999,2003,2004,2006,2007,2008,2009,2011,2012,2013,2018,2020,2022],
  'Benfica': [1955,1957,1960,1961,1963,1964,1965,1967,1968,1969,1971,1972,1973,1975,1976,1977,1981,1983,1984,1987,1989,1991,1994,2005,2010,2014,2015,2016,2017,2019,2023],
  'Sporting': [1958,1962,1966,1970,1974,1980,1982,2000,2002,2021,2024,2025],
  'Boavista': [2001],
  'Celtic': [1998,2001,2002,2004,2006,2007,2008,2012,2013,2014,2015,2016,2017,2018,2019,2020,2022,2023,2024,2025],
  'Rangers': [1989,1990,1991,1992,1993,1994,1995,1996,1997,1999,2000,2003,2005,2009,2010,2011,2021],
  'Olympiacos': [1997,1998,1999,2000,2001,2002,2003,2005,2006,2007,2008,2009,2011,2012,2013,2014,2015,2016,2017,2020,2021,2022,2025],
  'Panathinaikos': [1995,1996,2004,2010],
  'AEK Athens': [1992,1993,1994,2018,2023],
  'PAOK': [2019,2024],
  'Shakhtar D.': [2002,2005,2006,2008,2010,2011,2012,2013,2014,2017,2018,2019,2020,2023,2024],
  'Shakhtar Donetsk': [2002,2005,2006,2008,2010,2011,2012,2013,2014,2017,2018,2019,2020,2023,2024],
  'Dynamo Kyiv': [1993,1994,1995,1996,1997,1998,1999,2000,2001,2003,2004,2007,2009,2015,2016,2021,2025],
  'Zenit S-Pb': [2007,2010,2012,2015,2019,2020,2021,2022,2023,2024],
  'CSKA Moscow': [2003,2005,2006,2013,2014,2016],
  'Spartak Moscow': [1992,1993,1994,1996,1997,1998,1999,2000,2001,2017],
  'Rubin Kazan': [2008,2009],
  'Loko Moscow': [2002,2004,2018],
  'Salzburg': [2007,2009,2010,2012,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023],
  'Basel': [2002,2004,2005,2008,2010,2011,2012,2013,2014,2015,2016,2017],
  'Anderlecht': [1993,1994,1995,2000,2001,2004,2006,2007,2010,2012,2013,2014,2017],
  'Club Brugge': [1996,1998,2003,2005,2016,2018,2020,2021,2022,2024],
  'Santos': [1961,1962,1963,1964,1965,1968,2002,2004],
  'Palmeiras': [1993,1994,2016,2018,2022,2023],
  'Corinthians': [1990,1998,1999,2005,2011,2015,2017],
  'Flamengo': [1980,1982,1983,1992,2009,2019,2020],
  'São Paulo': [1991,2006,2007,2008],
  'Cruzeiro': [2003,2013,2014],
  'Fluminense': [2010,2012],
  'Atlético-MG': [2021],
  'Botafogo': [1995,2024],
  'Vasco da Gama': [1989,1997,2000],
  'Boca Juniors': [1992,1998,1999,2000,2003,2005,2006,2008,2011,2015,2017,2018,2020,2022],
  'River Plate': [1990,1991,1993,1994,1996,1997,1999,2000,2002,2003,2004,2008,2014,2021,2023],
};

const CALENDAR_YEAR_CHAMPION_CLUBS = new Set([
  'Santos',
  'Palmeiras',
  'Corinthians',
  'Flamengo',
  'São Paulo',
  'Cruzeiro',
  'Fluminense',
  'Atlético-MG',
  'Botafogo',
  'Vasco da Gama',
  'Boca Juniors',
  'River Plate',
]);

function didWinLeagueByCareerPath(careerPath?: any[]): boolean {
  if (!Array.isArray(careerPath) || careerPath.length === 0) return false;
  for (const step of careerPath) {
    const clubName = (step.clubName || '').trim();
    const yrs = LEAGUE_CHAMPION_CLUB_YEARS[clubName];
    if (!yrs || typeof step.startYear !== 'number') continue;
    const end = step.endYear ?? 2026;
    const isCal = CALENDAR_YEAR_CHAMPION_CLUBS.has(clubName);
    const won = yrs.some(
      (y) =>
        (step.startYear <= y - 1 && end >= y) ||
        (isCal && step.startYear === y && end >= y)
    );
    if (won) return true;
  }
  return false;
}

function inferPlayerLeagues(player: any, allClubs: string[]): string[] {
  const leagueSet = new Set<string>();
  const isLegend = Boolean(player.isLegend);

  if (!isLegend && player.currentClub?.league && player.currentClub.league !== 'global') {
    leagueSet.add(player.currentClub.league);
  }
  for (const club of allClubs) {
    const mapped = CLUB_TO_LEAGUE_MAP[club.trim()];
    if (mapped) {
      leagueSet.add(mapped);
    }
  }

  return Array.from(leagueSet);
}

// 🏆 Oyuncu Kupalarını TMID Kümesi ve Sezon Doğrulamasıyla Belirler
export function inferPlayerTrophies(player: any, _allClubs: string[] = []): string[] {
  const trophies = new Set<string>();
  const rawId = String(player.playerId || player.id || '').trim();
  const pid = rawId ? (rawId.startsWith('tmid_') ? rawId : `tmid_${rawId}`) : '';

  if (pid) {
    if (UCL_WINNER_TMIDS.has(pid)) {
      trophies.add('ucl');
    }
    if (WORLD_CUP_WINNER_TMIDS.has(pid)) {
      trophies.add('world_cup');
    }
    if (BALLON_DOR_WINNER_TMIDS.has(pid)) {
      trophies.add('ballon_dor');
    }
    if (GOLDEN_BOOT_WINNER_TMIDS.has(pid)) {
      trophies.add('golden_boot');
    }
    if (LEAGUE_CHAMPION_WINNER_TMIDS.has(pid)) {
      trophies.add('league_champion');
    }
  }

  if (!trophies.has('league_champion') && didWinLeagueByCareerPath(player.careerPath)) {
    trophies.add('league_champion');
  }

  return Array.from(trophies);
}

export async function exportSearchIndex(): Promise<void> {
  await connectDatabase();

  console.log('📦 Generating lightweight search index with chronological careerPath, leagues & trophies...');

  const players = await PlayerModel.find({
    $or: [{ isActive: true }, { isLegend: true }],
  })
    .sort({ isLegend: 1, marketValueEur: -1 })
    .select(
      'playerId name nationality position currentClub leagues age shirtNumber careerPath marketValueEur originalImageUrl isLegend'
    )
    .lean();

  const lightList = players.map((p) => {
    const isLegend = Boolean((p as any).isLegend);
    const currentClubName = isLegend ? '' : p.currentClub?.name?.trim() || '';

    const orderedCareer = isLegend
      ? (p.careerPath || []).filter((s) => s.clubName && !BAD_CLUB_NAMES.has(s.clubName.trim()))
      : fixAndOrderCareerPath(p.careerPath, currentClubName, p.age);

    const clubSet = new Set<string>();
    for (const step of orderedCareer) {
      const cName = step.clubName?.trim();
      if (cName && !BAD_CLUB_NAMES.has(cName)) {
        clubSet.add(cName);
      }
    }
    if (currentClubName && !BAD_CLUB_NAMES.has(currentClubName)) {
      clubSet.add(currentClubName);
    }

    let displayName = (p.name || '').replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '').trim();
    if (p.playerId === 'tmid_18537') displayName = 'Alex de Souza';
    if (p.playerId === 'tmid_3140') displayName = 'Ronaldo Nazário';
    if (p.playerId === 'tmid_34495') displayName = 'Adriano Correia';
    if (p.playerId === 'tmid_52920') displayName = 'Marcelo Guedes';

    const NATIONALITY_FIXES: Record<string, string> = {
      'miralem pjanic': 'Bosnia-Herzegovina',
      'senad lulic': 'Bosnia-Herzegovina',
      'zvjezdan misimovic': 'Bosnia-Herzegovina',
      'elvir bolic': 'Bosnia-Herzegovina',
      'hristo stoichkov': 'Bulgaria',
      'dimitar berbatov': 'Bulgaria',
      'ivan cordoba': 'Colombia',
      'fredy guarin': 'Colombia',
      'jackson martinez': 'Colombia',
      'faryd mondragon': 'Colombia',
      'oscar cordoba': 'Colombia',
      'shabani nonda': 'DR Congo',
    };
    const fixedNationality =
      NATIONALITY_FIXES[normalizeTrophyName(displayName)] || p.nationality;

    const clubs = Array.from(clubSet);
    const leagues = inferPlayerLeagues(p, clubs);
    const trophies = inferPlayerTrophies(
      { ...p, name: displayName, nationality: fixedNationality, careerPath: orderedCareer },
      clubs
    );

    const cleanClubId =
      !isLegend && p.currentClub?.id
        ? String(p.currentClub.id).replace(/^club_/, '')
        : undefined;
    const clubLogo = isLegend
      ? undefined
      : p.currentClub?.logoUrl ||
        (cleanClubId
          ? `https://tmssl.akamaized.net/images/wappen/head/${cleanClubId}.png`
          : undefined);

    const compactCareerPath = orderedCareer.map((s) => ({
      clubName: s.clubName,
      startYear: s.startYear,
      ...(s.endYear !== undefined ? { endYear: s.endYear } : {}),
      ...(s.apps ? { apps: s.apps } : {}),
      ...(s.goals ? { goals: s.goals } : {}),
    }));

    return {
      id: p.playerId,
      name: displayName,
      nationality: fixedNationality,
      position: p.position,
      club: currentClubName,
      clubId: cleanClubId,
      league: p.currentClub?.league,
      leagues,
      age: p.age,
      shirtNumber: p.shirtNumber,
      imageUrl: p.originalImageUrl || undefined,
      logoUrl: clubLogo,
      clubs,
      careerPath: compactCareerPath,
      ...(trophies.length > 0 ? { trophies } : {}),
      ...(isLegend ? { isLegend: true } : {}),
    };
  });

  const jsonContent = JSON.stringify(lightList);
  const sizeKb = (Buffer.byteLength(jsonContent, 'utf8') / 1024).toFixed(2);

  const backendOutputDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(backendOutputDir)) {
    fs.mkdirSync(backendOutputDir, { recursive: true });
  }
  const backendFilePath = path.join(backendOutputDir, 'search-index.json');
  fs.writeFileSync(backendFilePath, jsonContent, 'utf8');
  console.log(
    `✅ Saved backend search index: ${backendFilePath} (${sizeKb} KB, ${lightList.length} players)`
  );

  const mobileOutputDir = path.resolve(__dirname, '../../../mobile/src/assets/data');
  if (!fs.existsSync(mobileOutputDir)) {
    fs.mkdirSync(mobileOutputDir, { recursive: true });
  }
  const mobileFilePath = path.join(mobileOutputDir, 'search-index.json');
  fs.writeFileSync(mobileFilePath, jsonContent, 'utf8');
  console.log(`✅ Saved mobile bundled search index: ${mobileFilePath}`);

  await mongoose.disconnect();
}

if (require.main === module) {
  exportSearchIndex().catch(console.error);
}
