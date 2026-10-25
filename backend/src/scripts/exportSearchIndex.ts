import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { PlayerModel } from '../models/Player';
import { connectDatabase } from '../config/db';
import { fixAndOrderCareerPath } from '../utils/careerPathUtils';

const BAD_CLUB_NAMES = new Set(['Without Club', 'Unknown', 'Career break', 'Retired', 'Kulüp']);

export const CLUB_TO_LEAGUE_MAP: Record<string, string> = {
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

function buildNormalizedSet(items: string[]): Set<string> {
  return new Set(items.map(normalizeTrophyName));
}

const EXACT_WORLD_CUP_WINNERS = buildNormalizedSet([
  'lionel messi',
  'angel di maria',
  'diego maradona',
  'nicolas otamendi',
  'emiliano martinez',
  'julian alvarez',
  'enzo fernandez',
  'alexis mac allister',
  'rodrigo de paul',
  'cristian romero',
  'lisandro martinez',
  'nahuel molina',
  'nicolas tagliafico',
  'marcos acuna',
  'gonzalo montiel',
  'german pezzella',
  'juan foyth',
  'leandro paredes',
  'exequiel palacios',
  'guido rodriguez',
  'thiago almada',
  'alejandro gomez',
  'papu gomez',
  'paulo dybala',
  'lautaro martinez',
  'angel correa',
  'franco armani',
  'geronimo rulli',
  
  'pele',
  'ronaldo nazario',
  'ronaldo',
  'ronaldinho',
  'rivaldo',
  'romario',
  'bebeto',
  'dunga',
  'claudio taffarel',
  'taffarel',
  'aldair',
  'branco',
  'jorginho',
  'marcio santos',
  'mauro silva',
  'mazinho',
  'zinho',
  'leonardo',
  'raí',
  'cafu',
  'roberto carlos',
  'kaka',
  'lucio',
  'dida',
  'edmilson',
  'juliano belletti',
  'gilberto silva',
  'kleberson',
  'roque junior',
  'denilson',
  'luizao',
  'vampeta',
  'juninho paulista',
  'ricardinho',
  'marcos',
  
  'zinedine zidane',
  'thierry henry',
  'david trezeguet',
  'patrick vieira',
  'didier deschamps',
  'marcel desailly',
  'lilian thuram',
  'laurent blanc',
  'fabien barthez',
  'bixente lizarazu',
  'emmanuel petit',
  'robert pires',
  'youri djorkaeff',
  'christophe dugarry',
  'christian karembeu',
  'vincent candela',
  'frank leboeuf',
  'bernard diomede',
  'alain boghossian',
  'stephane guivarch',
  'kylian mbappe',
  'antoine griezmann',
  'paul pogba',
  "n'golo kante",
  'ngolo kante',
  'olivier giroud',
  'hugo lloris',
  'raphael varane',
  'blaise matuidi',
  'samuel umtiti',
  'lucas hernandez',
  'benjamin pavard',
  'presnel kimpembe',
  'corentin tolisso',
  'ousmane dembele',
  'thomas lemar',
  'nabil fekir',
  'steven nzonzi',
  'steve mandanda',
  'alphonse areola',
  'adil rami',
  'benjamin mendy',
  'djibril sidibe',
  'florian thauvin',
  
  'franz beckenbauer',
  'gerd muller',
  'sepp maier',
  'paul breitner',
  'wolfgang overath',
  'berti vogts',
  'jupp heynckes',
  'uli hoeness',
  'lothar matthaus',
  'jurgen klinsmann',
  'rudi voller',
  'andreas brehme',
  'bodo illgner',
  'jurgen kohler',
  'thomas hassler',
  'pierre littbarski',
  'guido buchwald',
  'stefan reuter',
  'karl-heinz riedle',
  'olaf thon',
  'thomas berthold',
  'philipp lahm',
  'bastian schweinsteiger',
  'miroslav klose',
  'toni kroos',
  'mesut ozil',
  'sami khedira',
  'thomas muller',
  'manuel neuer',
  'mats hummels',
  'jerome boateng',
  'mario gotze',
  'per mertesacker',
  'lukas podolski',
  'roman weidenfeller',
  'benedikt howedes',
  'julian draxler',
  'andre schurrle',
  'christoph kramer',
  'matthias ginter',
  'shkodran mustafi',
  'kevin grosskreutz',
  'erik durm',
  'ron-robert zieler',
 
  'dino zoff',
  'paolo rossi',
  'franco baresi',
  'marco tardelli',
  'gaetano scirea',
  'claudio gentile',
  'antonio cabrini',
  'bruno conti',
  'giuseppe bergomi',
  'alessandro altobelli',
  'gianluigi buffon',
  'andrea pirlo',
  'alessandro del piero',
  'francesco totti',
  'fabio cannavaro',
  'alessandro nesta',
  'gennaro gattuso',
  'filippo inzaghi',
  'marco materazzi',
  'gianluca zambrotta',
  'daniele de rossi',
  'luca toni',
  'alberto gilardino',
  'andrea barzagli',
  'massimo oddo',
  'angelo peruzzi',
  'mauro camoranesi',
  'simone perrotta',
  'fabio grosso',
  'vincenzo iaquinta',
  'cristian zaccardo',
  'simone barone',
  'marco amelia',
  
  'iker casillas',
  'xavi',
  'xavi hernandez',
  'andres iniesta',
  'carles puyol',
  'gerard pique',
  'sergio busquets',
  'sergio ramos',
  'xabi alonso',
  'david villa',
  'fernando torres',
  'cesc fabregas',
  'david silva',
  'juan mata',
  'pedro',
  'jesus navas',
  'joan capdevila',
  'alvaro arbeloa',
  'raul albiol',
  'carlos marchena',
  'pepe reina',
  'victor valdes',
  'javi martinez',
  'fernando llorente',
]);

const EXACT_UCL_WINNERS = buildNormalizedSet([
  'cristiano ronaldo',
  'lionel messi',
  'zinedine zidane',
  'ronaldinho',
  'raul',
  'iker casillas',
  'roberto carlos',
  'luis figo',
  'guti',
  'fernando hierro',
  'michel salgado',
  'ivan helguera',
  'steve mcmanaman',
  'fernando morientes',
  'claude makelele',
  'david beckham',
  'wesley sneijder',
  'arjen robben',
  'kaka',
  'karim benzema',
  'gareth bale',
  'toni kroos',
  'luka modric',
  'sergio ramos',
  'marcelo',
  'pepe',
  'xabi alonso',
  'angel di maria',
  'sami khedira',
  'keylor navas',
  'raphael varane',
  'casemiro',
  'nacho fernandez',
  'joselu',
  'isco',
  'marco asensio',
  'alvaro arbeloa',
  'santiago solari',
  'predrag mijatovic',
  'davor suker',
  'clarence seedorf',
  'fernando redondo',
  'christian karembeu',
  'bodo illgner',
  'santiago canizares',
  'ze roberto',
  'james rodriguez',
  'danilo',
  'michael laudrup',
  'xavi',
  'andres iniesta',
  'carles puyol',
  'gerard pique',
  'sergio busquets',
  'jordi alba',
  'dani alves',
  'neymar',
  'luis suarez',
  'david villa',
  "samuel eto'o",
  'thierry henry',
  'rivaldo',
  'deco',
  'ronald koeman',
  'hristo stoichkov',
  'pep guardiola',
  'patrick kluivert',
  'frank de boer',
  'giovanni van bronckhorst',
  'henrik larsson',
  'ludovic giuly',
  'rafael marquez',
  'rafa marquez',
  'eric abidal',
  'yaya toure',
  'seydou keita',
  'javier mascherano',
  'pedro',
  'ivan rakitic',
  'victor valdes',
  'claudio bravo',
  'marc bartra',
  'adriano correia',
  'maxwell',
  'ibrahim afellay',
  'eidur gudjohnsen',
  'juliano belletti',
  'edmilson',
  'sylvinho',
  'bojan krkic',
  'philippe coutinho',
  'fernando torres',
  'paolo maldini',
  'alessandro nesta',
  'cafu',
  'gennaro gattuso',
  'andrea pirlo',
  'filippo inzaghi',
  'andriy shevchenko',
  'dida',
  'alessandro costacurta',
  'franco baresi',
  'marco van basten',
  'ruud gullit',
  'frank rijkaard',
  'zvonimir boban',
  'dejan savicevic',
  'marcel desailly',
  'massimo ambrosini',
  'serginho',
  'kakha kaladze',
  'kakhaber kaladze',
  'alberto gilardino',
  'yoann gourcuff',
  'jaap stam',
  'rui costa',
  'jon dahl tomasson',
  'marek jankulovski',
  'massimo oddo',
  'thiago silva',
  'mark van bommel',
  'mario balotelli',
  'carlos tevez',
  'alessandro del piero',
  'ciro ferrara',
  'gianluca pessotto',
  'alessio tacchinardi',
  'antonio conte',
  'didier deschamps',
  'fabrizio ravanelli',
  'gianluca vialli',
  'angelo peruzzi',
  'javier zanetti',
  'esteban cambiasso',
  'diego milito',
  'maicon',
  'lucio',
  'walter samuel',
  'julio cesar',
  'marco materazzi',
  'ivan cordoba',
  'cristian chivu',
  'dejan stankovic',
  'thiago motta',
  'goran pandev',
  'marko arnautovic',
  'ivan perisic',
  'wayne rooney',
  'paul scholes',
  'ryan giggs',
  'rio ferdinand',
  'nemanja vidic',
  'patrice evra',
  'edwin van der sar',
  'gary neville',
  'roy keane',
  'peter schmeichel',
  'ole gunnar solskjaer',
  'dwight yorke',
  'andy cole',
  'teddy sheringham',
  'denis irwin',
  'nicky butt',
  'phil neville',
  'wes brown',
  "john o'shea",
  'darren fletcher',
  'michael carrick',
  'ji-sung park',
  'nani',
  'steven gerrard',
  'jamie carragher',
  'sami hyypia',
  'john arne riise',
  'jerzy dudek',
  'dietmar hamann',
  'luis garcia',
  'harry kewell',
  'milan baros',
  'djibril cisse',
  'jordan henderson',
  'georginio wijnaldum',
  'fabinho',
  'roberto firmino',
  'sadio mane',
  'daniel sturridge',
  'adam lallana',
  'james milner',
  'joel matip',
  'dejan lovren',
  'divock origi',
  'xherdan shaqiri',
  'thiago alcantara',
  'didier drogba',
  'frank lampard',
  'john terry',
  'petr cech',
  'ashley cole',
  'juan mata',
  'raul meireles',
  'bosingwa',
  'jose bosingwa',
  'eden hazard',
  'michael essien',
  'ricardo carvalho',
  'paulo ferreira',
  'florent malouda',
  'salomon kalou',
  'nicolas anelka',
  'branislav ivanovic',
  'gary cahill',
  'david luiz',
  'cesar azpilicueta',
  "n'golo kante",
  'ngolo kante',
  'ramires',
  'oscar',
  'john obi mikel',
  'thibaut courtois',
  'antonio rudiger',
  'marcos alonso',
  'hakim ziyech',
  'timo werner',
  'olivier giroud',
  'riyad mahrez',
  'ilkay gundogan',
  'aymeric laporte',
  'joao cancelo',
  'franck ribery',
  'philipp lahm',
  'bastian schweinsteiger',
  'oliver kahn',
  'mario gomez',
  'mario mandzukic',
  'claudio pizarro',
  'giovane elber',
  'mehmet scholl',
  'stefan effenberg',
  'bixente lizarazu',
  'willy sagnol',
  'daniel van buyten',
  'jerome boateng',
  'dante',
  'javi martinez',
  'kingsley coman',
  'david alaba',
  'rafinha',
  'holger badstuber',
  'luiz gustavo',
  'robert lewandowski',
  'matthias sammer',
  'franz beckenbauer',
  'gerd muller',
  'karl-heinz rummenigge',
  'rudi voller',
  'fabien barthez',
  'vitor baia',
  'benni mccarthy',
  'maniche',
  'costinha',
  'nuno valente',
  'ricardo quaresma',
  'johan cruyff',
  'michel platini',
  'marc overmars',
  'edgar davids',
  'nwankwo kanu',
]);

const EXACT_BALLON_DOR_WINNERS = buildNormalizedSet([
  'lionel messi',
  'cristiano ronaldo',
  'luka modric',
  'karim benzema',
  'rodri',
  'kaka',
  'fabio cannavaro',
  'ronaldinho',
  'andriy shevchenko',
  'pavel nedved',
  'ronaldo nazario',
  'ronaldo',
  'michael owen',
  'luis figo',
  'rivaldo',
  'zinedine zidane',
  'george weah',
  'hristo stoichkov',
  'roberto baggio',
  'marco van basten',
  'lothar matthaus',
  'ruud gullit',
  'michel platini',
  'karl-heinz rummenigge',
  'franz beckenbauer',
  'johan cruyff',
  'gerd muller',
]);

const EXACT_GOLDEN_BOOT_WINNERS = buildNormalizedSet([
  'lionel messi',
  'cristiano ronaldo',
  'erling haaland',
  'kylian mbappe',
  'harry kane',
  'robert lewandowski',
  'mauro icardi',
  'victor osimhen',
  'edin dzeko',
  'mohamed salah',
  'luis suarez',
  'thierry henry',
  'diego forlan',
  'francesco totti',
  'luca toni',
  'ciro immobile',
  'andriy shevchenko',
  'alessandro del piero',
  'filippo inzaghi',
  'gabriel batistuta',
  'hernan crespo',
  'christian vieri',
  'gonzalo higuain',
  'edinson cavani',
  'zlatan ibrahimovic',
  'antonio di natale',
  'fabio quagliarella',
  'david trezeguet',
  'roberto baggio',
  'gianluca vialli',
  'michel platini',
  'didier drogba',
  'wayne rooney',
  'robin van persie',
  'ruud van nistelrooy',
  'sergio aguero',
  'alan shearer',
  'ian wright',
  'gary lineker',
  'michael owen',
  'dimitar berbatov',
  'carlos tevez',
  'nicolas anelka',
  'jimmy floyd hasselbaink',
  'dwight yorke',
  'jamie vardy',
  'pierre-emerick aubameyang',
  'sadio mane',
  'ronaldo nazario',
  'ronaldo',
  'raul',
  "samuel eto'o",
  'david villa',
  'daniel guiza',
  'hugo sanchez',
  'emilio butragueno',
  'romario',
  'rivaldo',
  'pele',
  'roy makaay',
  'diego tristan',
  'karim benzema',
  'radamel falcao',
  'miroslav klose',
  'mario gomez',
  'giovane elber',
  'claudio pizarro',
  'grafite',
  'stefan kiessling',
  'klaas-jan huntelaar',
  'gerd muller',
  'karl-heinz rummenigge',
  'jurgen klinsmann',
  'rudi voller',
  'marco van basten',
  'ruud gullit',
  'johan cruyff',
  'dennis bergkamp',
  'patrick kluivert',
  'mateja kezman',
  'pierre van hooijdonk',
  'dirk kuyt',
  'pauleta',
  'alexandre lacazette',
  'moussa sow',
  'mamadou niang',
  'djibril cisse',
  'bafetimbi gomis',
  'mario jardel',
  'jardel',
  'benni mccarthy',
  'davor suker',
  'james rodriguez',
  'hristo stoichkov',
  'jackson martinez',
  'hulk',
  'oscar cardozo',
  'jonas',
  'alex de souza',
  'gheorghe hagi',
  'hakan sukur',
  'tanju colak',
  'metin oktay',
  'lefter kucukandonyadis',
  'aykut kocaman',
  'feyyaz ucar',
  'burak yilmaz',
  'semih senturk',
  'arif erdem',
  'ilhan mansiz',
  'zafer biryol',
  'fatih tekke',
  'shota arveladze',
  'milan baros',
  'theofanis gekas',
  'aatif chahechouhe',
  'fernandao',
  'vagner love',
  'mbaye diagne',
  'alexander sorloth',
  'enner valencia',
  'cenk tosun',
  'talisca',
]);

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

export function inferPlayerTrophies(player: any, allClubs: string[]): string[] {
  const trophies = new Set<string>();
  const normName = normalizeTrophyName(player.name || '');
  const pid = String(player.playerId || player.id || '');
  const mv = player.marketValueEur || 0;
  const isLegend = Boolean(player.isLegend);

  const totalGoals = (player.careerPath || []).reduce(
    (acc: number, s: any) => acc + (s.goals || 0),
    0
  );

  if (isLegend) {
    
    if (
      EXACT_UCL_WINNERS.has(normName) &&
      pid !== 'tmid_5876' &&
      pid !== 'tmid_52920'
    ) {
      trophies.add('ucl');
    }
    if (EXACT_WORLD_CUP_WINNERS.has(normName)) {
      trophies.add('world_cup');
    }
    if (EXACT_BALLON_DOR_WINNERS.has(normName)) {
      trophies.add('ballon_dor');
    }
    if (EXACT_GOLDEN_BOOT_WINNERS.has(normName)) {
      trophies.add('golden_boot');
    }

    const championClubs = new Set([
      'Real Madrid', 'Barcelona', 'Atlético', 'Valencia', 'Dep. A Coruña',
      'AC Milan', 'Inter', 'Juventus', 'Roma', 'Napoli', 'Lazio', 'Sampdoria',
      'Man Utd', 'Man City', 'Liverpool', 'Arsenal', 'Chelsea', 'Leicester', 'Blackburn',
      'Bayern Munich', 'Dortmund', 'Werder Bremen', 'Stuttgart', 'Wolfsburg',
      'PSG', 'Monaco', 'Marseille', 'Lyon', 'Lille', 'G. Bordeaux', 'FC Nantes',
      'Ajax', 'PSV', 'Feyenoord', 'Porto', 'Benfica', 'Sporting',
      'Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'Basaksehir', 'Bursaspor',
      'Santos', 'Flamengo', 'Palmeiras', 'Corinthians', 'São Paulo', 'Cruzeiro', 'Boca Juniors', 'River Plate',
      'Celtic', 'Rangers', 'Olympiacos', 'Shakhtar Donetsk', 'Dynamo Kyiv', 'Zenit', 'CSKA Moscow', 'Spartak Moscow',
    ]);
    if (allClubs.some((c) => championClubs.has(c))) {
      trophies.add('league_champion');
    }

    return Array.from(trophies);
  }

  const uclClubs = new Set([
    'Real Madrid',
    'Barcelona',
    'Bayern Munich',
    'Man City',
    'Manchester City',
    'Liverpool',
    'Chelsea',
    'Inter',
    'AC Milan',
    'PSG',
  ]);

  if (
    EXACT_UCL_WINNERS.has(normName) ||
    (allClubs.some((c) => uclClubs.has(c)) && (mv >= 25000000 || player.age >= 27))
  ) {
    trophies.add('ucl');
  }

  if (EXACT_WORLD_CUP_WINNERS.has(normName)) {
    trophies.add('world_cup');
  }

  if (allClubs.length >= 2 && (mv >= 10000000 || totalGoals >= 30 || player.age >= 28)) {
    trophies.add('league_champion');
  }

  if (totalGoals >= 120 || EXACT_GOLDEN_BOOT_WINNERS.has(normName)) {
    trophies.add('golden_boot');
  }

  if (EXACT_BALLON_DOR_WINNERS.has(normName)) {
    trophies.add('ballon_dor');
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
      { ...p, name: displayName, nationality: fixedNationality },
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

    const compactCareerPath = orderedCareer.map((s, idx) => {
      let endYear = s.endYear;
      if (
        isLegend &&
        idx === orderedCareer.length - 1 &&
        endYear === undefined &&
        s.startYear <= 2024
      ) {
        endYear = Math.min(2025, s.startYear + 2);
      }
      return {
        clubName: s.clubName,
        startYear: s.startYear,
        ...(endYear !== undefined ? { endYear } : {}),
        ...(s.apps ? { apps: s.apps } : {}),
        ...(s.goals ? { goals: s.goals } : {}),
      };
    });

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
