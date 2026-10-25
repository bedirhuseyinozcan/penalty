import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PlayerModel } from '../models/Player';
import { connectDatabase } from '../config/db';
import { exportSearchIndex } from './exportSearchIndex';
import {
  TM_API_BASE,
  CACHE_DIR,
  COUNTRY_ID_FALLBACK,
  IClubMeta,
  fetchJsonWithRetry,
  loadLocalBioAndPerfMaps,
  buildChronologicalCareerPath,
} from './syncLiveTransfermarktApi';

export const DEFAULT_LEGEND_NAMES: string[] = [
  'Cristiano Ronaldo',
  'Lionel Messi',
  'Zinédine Zidane',
  'Ronaldinho',
  'Ronaldo Nazário',
  'Raúl González',
  'Iker Casillas',
  'Roberto Carlos',
  'Luís Figo',
  'Guti Hernández',
  'Fernando Hierro',
  'Míchel Salgado',
  'Iván Helguera',
  'Steve McManaman',
  'Fernando Morientes',
  'Claude Makélélé',
  'David Beckham',
  'Michael Owen',
  'Robinho',
  'Ruud van Nistelrooy',
  'Fabio Cannavaro',
  'Wesley Sneijder',
  'Arjen Robben',
  'Kaká',
  'Karim Benzema',
  'Gareth Bale',
  'Toni Kroos',
  'Sergio Ramos',
  'Marcelo Vieira',
  'Pepe',
  'Xabi Alonso',
  'Ángel Di María',
  'Mesut Özil',
  'Gonzalo Higuaín',
  'Sami Khedira',
  'Keylor Navas',
  'Raphaël Varane',
  'Casemiro',
  'Nacho Fernández',
  'Joselu',
  'Isco',
  'Marco Asensio',
  'Álvaro Arbeloa',
  'Lassana Diarra',
  'Mahamadou Diarra',
  'Júlio Baptista',
  'José Callejón',
  'Esteban Granero',
  'Fernando Gago',
  'Gabriel Heinze',
  'Walter Samuel',
  'Jonathan Woodgate',
  'Santiago Solari',
  'Predrag Mijatović',
  'Davor Šuker',
  'Clarence Seedorf',
  'Fernando Redondo',
  'Christian Karembeu',
  'Bodo Illgner',
  'Iván Zamorano',
  'Michael Laudrup',
  'Hugo Sánchez',
  'Emilio Butragueño',
  'Xavi Hernández',
  'Andrés Iniesta',
  'Carles Puyol',
  'Gerard Piqué',
  'Sergio Busquets',
  'Jordi Alba',
  'Dani Alves',
  'Neymar',
  'Luis Suárez',
  'David Villa',
  'Samuel Eto\'o',
  'Thierry Henry',
  'Rivaldo',
  'Romário',
  'Deco',
  'Ronald Koeman',
  'Hristo Stoichkov',
  'Pep Guardiola',
  'Patrick Kluivert',
  'Marc Overmars',
  'Frank de Boer',
  'Phillip Cocu',
  'Giovanni van Bronckhorst',
  'Henrik Larsson',
  'Ludovic Giuly',
  'Rafael Márquez',
  'Éric Abidal',
  'Yaya Touré',
  'Seydou Keita',
  'Javier Mascherano',
  'Pedro Rodríguez',
  'Cesc Fàbregas',
  'Alexis Sánchez',
  'Ivan Rakitić',
  'Arturo Vidal',
  'Víctor Valdés',
  'Claudio Bravo',
  'Marc Bartra',
  'Adriano Correia',
  'Maxwell',
  'Juliano Belletti',
  'Edmílson',
  'Sylvinho',
  'Gianluca Zambrotta',
  'Lilian Thuram',
  'Zlatan Ibrahimović',
  'Bojan Krkić',
  'Paulinho Bezerra',
  'Philippe Coutinho',
  'Miralem Pjanić',
  'Memphis Depay',
  'Sergio Agüero',
  'Pierre-Emerick Aubameyang',
  'Fernando Torres',
  'Diego Forlán',
  'Radamel Falcao',
  'Diego Godín',
  'Filipe Luís',
  'João Miranda',
  'Gabi Fernández',
  'Tiago Mendes',
  'Raúl García',
  'Juanfran Torres',
  'Diego Costa',
  'Mario Mandžukić',
  'David Josué Jiménez Silva',
  'Juan Mata',
  'Santi Cazorla',
  'Pablo Aimar',
  'Roberto Ayala',
  'Gaizka Mendieta',
  'Santiago Cañizares',
  'Rubén Baraja',
  'David Albelda',
  'Vicente Rodríguez',
  'Joaquín Sánchez',
  'Jesús Navas',
  'Frédéric Kanouté',
  'Luís Fabiano',
  'Éver Banega',
  'Carlos Bacca',
  'Kevin Gameiro',
  'Juan Román Riquelme',
  'Marcos Senna',
  'Joan Capdevila',
  'Giuseppe Rossi',
  'Roy Makaay',
  'Diego Tristán',
  'Juan Carlos Valerón',
  'Djalminha',

  // 🇮🇹 2. AC Milan, Inter, Juventus & Serie A Efsaneleri
  'Paolo Maldini',
  'Alessandro Nesta',
  'Cafu',
  'Gennaro Gattuso',
  'Andrea Pirlo',
  'Filippo Inzaghi',
  'Andriy Shevchenko',
  'Nélson Dida',
  'Alessandro Costacurta',
  'Franco Baresi',
  'Marco van Basten',
  'Ruud Gullit',
  'Frank Rijkaard',
  'George Weah',
  'Zvonimir Boban',
  'Dejan Savićević',
  'Marcel Desailly',
  'Massimo Ambrosini',
  'Serginho',
  'Kakha Kaladze',
  'Jaap Stam',
  'Hernán Crespo',
  'Rui Costa',
  'Jon Dahl Tomasson',
  'Marek Jankulovski',
  'Massimo Oddo',
  'Alexandre Pato',
  'Thiago Silva',
  'Mark van Bommel',
  'Kevin-Prince Boateng',
  'Mario Balotelli',
  'Stephan El Shaarawy',
  'Carlos Tevez',
  'Gianluigi Buffon',
  'Alessandro Del Piero',
  'Pavel Nedvěd',
  'Giorgio Chiellini',
  'Leonardo Bonucci',
  'Andrea Barzagli',
  'Claudio Marchisio',
  'David Trezeguet',
  'Mauro Camoranesi',
  'Edgar Davids',
  'Ciro Ferrara',
  'Paolo Montero',
  'Gianluca Pessotto',
  'Alessio Tacchinardi',
  'Antonio Conte',
  'Didier Deschamps',
  'Fabrizio Ravanelli',
  'Gianluca Vialli',
  'Roberto Baggio',
  'Stephan Lichtsteiner',
  'Kwadwo Asamoah',
  'Blaise Matuidi',
  'Medhi Benatia',
  'Wojciech Szczęsny',
  'Alex Sandro',
  'Danilo Luiz da Silva',
  'Juan Cuadrado',
  'Douglas Costa',
  'Javier Zanetti',
  'Esteban Cambiasso',
  'Diego Milito',
  'Maicon Douglas',
  'Lúcio',
  'Júlio César',
  'Marco Materazzi',
  'Iván Córdoba',
  'Cristian Chivu',
  'Dejan Stanković',
  'Thiago Motta',
  'Goran Pandev',
  'Adriano Leite Ribeiro',
  'Christian Vieri',
  'Álvaro Recoba',
  'Francesco Toldo',
  'Obafemi Martins',
  'Julio Ricardo Cruz',
  'Juan Sebastián Verón',
  'Samir Handanovič',
  'Marcelo Brozović',
  'Ivan Perišić',
  'Radja Nainggolan',
  'Mauro Icardi',
  'Rodrigo Palacio',
  'Fredy Guarín',
  'Francesco Totti',
  'Daniele De Rossi',
  'Gabriel Batistuta',
  'Vincenzo Montella',
  'Marco Delvecchio',
  'Aldair',
  'Vincent Candela',
  'Emerson Ferreira',
  'Mirko Vučinić',
  'Kostas Manolas',
  'Aleksandar Kolarov',
  'Edin Džeko',
  'Marek Hamšík',
  'Ezequiel Lavezzi',
  'Edinson Cavani',
  'Dries Mertens',
  'Lorenzo Insigne',
  'Kalidou Koulibaly',
  'Raúl Albiol',
  'Pepe Reina',
  'Faouzi Ghoulam',
  'Ciro Immobile',
  'Sergej Milinković-Savić',
  'Luis Alberto',
  'Senad Lulić',
  'Miroslav Klose',
  'Marcelo Salas',
  'Siniša Mihajlović',
  'Simone Inzaghi',
  'Luca Toni',
  'Adrian Mutu',
  'Sébastien Frey',
  'Antonio Di Natale',
  'Fabio Quagliarella',
  'Alberto Gilardino',
  'Gianluca Pagliuca',
  'Angelo Peruzzi',


  'Wayne Rooney',
  'Paul Scholes',
  'Ryan Giggs',
  'Rio Ferdinand',
  'Nemanja Vidić',
  'Patrice Evra',
  'Edwin van der Sar',
  'Gary Neville',
  'Roy Keane',
  'Eric Cantona',
  'Peter Schmeichel',
  'Ole Gunnar Solskjær',
  'Dwight Yorke',
  'Andy Cole',
  'Teddy Sheringham',
  'Denis Irwin',
  'Nicky Butt',
  'Phil Neville',
  'Wes Brown',
  'John O\'Shea',
  'Darren Fletcher',
  'Michael Carrick',
  'Ji-sung Park',
  'Dimitar Berbatov',
  'Robin van Persie',
  'Nani',
  'Antonio Valencia',
  'Ashley Young',
  'Chicharito',
  'Shinji Kagawa',
  'Ander Herrera',
  'Marouane Fellaini',
  'Nemanja Matić',
  'David de Gea',
  'Anthony Martial',
  'Paul Pogba',
  'Jesse Lingard',
  'Steven Gerrard',
  'Jamie Carragher',
  'Dirk Kuyt',
  'Sami Hyypiä',
  'John Arne Riise',
  'Daniel Agger',
  'Martin Škrtel',
  'Jerzy Dudek',
  'Robbie Fowler',
  'Jamie Redknapp',
  'Dietmar Hamann',
  'Luis García',
  'Harry Kewell',
  'Milan Baroš',
  'Djibril Cissé',
  'Peter Crouch',
  'Craig Bellamy',
  'Yossi Benayoun',
  'Lucas Leiva',
  'Jordan Henderson',
  'Georginio Wijnaldum',
  'Fabinho Tavares',
  'Roberto Firmino',
  'Sadio Mané',
  'Daniel Sturridge',
  'Adam Lallana',
  'James Milner',
  'Joel Matip',
  'Dejan Lovren',
  'Divock Origi',
  'Xherdan Shaqiri',
  'Thiago Alcântara',
  'Dennis Bergkamp',
  'Patrick Vieira',
  'Robert Pirès',
  'Freddie Ljungberg',
  'Sol Campbell',
  'Ashley Cole',
  'Kolo Touré',
  'Jens Lehmann',
  'David Seaman',
  'Tony Adams',
  'Martin Keown',
  'Ray Parlour',
  'Nwankwo Kanu',
  'Sylvain Wiltord',
  'Gilberto Silva',
  'José Antonio Reyes',
  'Alexander Hleb',
  'Tomáš Rosický',
  'Emmanuel Adebayor',
  'Bacary Sagna',
  'Gaël Clichy',
  'Samir Nasri',
  'Andrey Arshavin',
  'Theo Walcott',
  'Aaron Ramsey',
  'Jack Wilshere',
  'Per Mertesacker',
  'Laurent Koscielny',
  'Olivier Giroud',
  'Lukas Podolski',
  'Alexandre Lacazette',
  'Didier Drogba',
  'Frank Lampard',
  'John Terry',
  'Petr Čech',
  'Eden Hazard',
  'Michael Essien',
  'Michael Ballack',
  'Ricardo Carvalho',
  'Paulo Ferreira',
  'William Gallas',
  'Joe Cole',
  'Damien Duff',
  'Eidur Gudjohnsen',
  'Jimmy Floyd Hasselbaink',
  'Gianfranco Zola',
  'Florent Malouda',
  'Salomon Kalou',
  'Nicolas Anelka',
  'Branislav Ivanović',
  'Gary Cahill',
  'David Luiz',
  'César Azpilicueta',
  'N\'Golo Kanté',
  'Ramires',
  'Oscar dos Santos',
  'Willian Borges',
  'John Obi Mikel',
  'Marcos Alonso',
  'Hakim Ziyech',
  'Timo Werner',
  'Vincent Kompany',
  'Pablo Zabaleta',
  'Joe Hart',
  'Gareth Barry',
  'Fernandinho',
  'Raheem Sterling',
  'Riyad Mahrez',
  'Aymeric Laporte',
  'Nicolás Otamendi',
  'João Cancelo',
  'Rafael van der Vaart',
  'Jermain Defoe',
  'Robbie Keane',
  'Ledley King',
  'Mousa Dembélé',
  'Christian Eriksen',
  'Dele Alli',
  'Jan Vertonghen',
  'Toby Alderweireld',
  'Hugo Lloris',
  'Jamie Vardy',
  'Kasper Schmeichel',
  'Alan Shearer',
  'Ian Wright',
  'Paul Gascoigne',
  'Gary Lineker',
  'Tim Cahill',
  'Mikel Arteta',
  'Leighton Baines',
  'Aleksandar Mitrović',
  'Rúben Neves',
  'Ivan Toney',
  'Moussa Diaby',
  'Yassine Bounou',
  'Franck Kessié',

  'Franck Ribéry',
  'Philipp Lahm',
  'Bastian Schweinsteiger',
  'Oliver Kahn',
  'Mario Gomez',
  'Claudio Pizarro',
  'Giovane Élber',
  'Mehmet Scholl',
  'Stefan Effenberg',
  'Bixente Lizarazu',
  'Willy Sagnol',
  'Daniel Van Buyten',
  'Martín Demichelis',
  'Zé Roberto',
  'Jérôme Boateng',
  'Mats Hummels',
  'Dante Bonfim',
  'Javi Martínez',
  'Rafinha',
  'Holger Badstuber',
  'Luiz Gustavo',
  'Ivica Olić',
  'Marco Reus',
  'Mario Götze',
  'Jakub Błaszczykowski',
  'Łukasz Piszczek',
  'Neven Subotić',
  'Marcel Schmelzer',
  'Roman Weidenfeller',
  'Nuri Şahin',
  'Sebastian Kehl',
  'Jan Koller',
  'Klaas-Jan Huntelaar',
  'Jefferson Farfán',
  'Benedikt Höwedes',
  'Julian Draxler',
  'Diego Ribas',
  'Torsten Frings',
  'Naldo',
  'Bernd Schneider',
  'Stefan Kießling',
  'Grafite',
  'Zvjezdan Misimović',
  'Franz Beckenbauer',
  'Gerd Müller',
  'Lothar Matthäus',
  'Jürgen Klinsmann',
  'Rudi Völler',
  'Karl-Heinz Rummenigge',
  'Andreas Brehme',
  'Matthias Sammer',

  'Marco Verratti',
  'Javier Pastore',
  'Alex Rodrigo Dias da Costa',
  'Salvatore Sirigu',
  'Lucas Moura',
  'Pauleta',
  'Jay-Jay Okocha',
  'David Ginola',
  'Juninho Pernambucano',
  'Sidney Govou',
  'Cris',
  'Grégory Coupet',
  'Lisandro López',
  'Michel Bastos',
  'Nabil Fekir',
  'Mathieu Valbuena',
  'André Ayew',
  'Steve Mandanda',
  'Dimitri Payet',
  'Lucho González',
  'Mamadou Niang',
  'James Rodríguez',
  'João Moutinho',
  'Thomas Lemar',
  'Danijel Subašić',
  'Kamil Glik',
  'Dado Pršo',
  'Gervinho',
  'Yohan Cabaye',
  'Moussa Sow',
  'Hulk',
  'Jackson Martínez',
  'Fernando Reges',
  'Eliaquim Mangala',
  'Vítor Baía',
  'Benni McCarthy',
  'Maniche',
  'Costinha',
  'Nuno Valente',
  'Óscar Cardozo',
  'Javier Saviola',
  'Nicolás Gaitán',
  'Eduardo Salvio',
  'Jonas Gonçalves',
  'Luisão',
  'Nuno Gomes',
  'Simão Sabrosa',
  'Nigel de Jong',
  'Maarten Stekelenburg',
  'Daley Blind',
  'Dušan Tadić',
  'Mateja Kežman',
  'Pierre van Hooijdonk',
  'Heurelho Gomes',
  'Ibrahim Afellay',
  'Johan Cruyff',
  'Diego Maradona',
  'Pelé',
  'Michel Platini',
  'Laurent Blanc',
  'Fabien Barthez',
  'Emmanuel Petit',
  'Youri Djorkaeff',
  'Hatem Ben Arfa',
  'Yoann Gourcuff',
  'Moussa Sissoko',
  'Seko Fofana',
  'Yannick Carrasco',
  'Axel Witsel',

  'Alex de Souza',
  'Gheorghe Hagi',
  'Gheorghe Popescu',
  'Cláudio Taffarel',
  'Mário Jardel',
  'Stephen Appiah',
  'Diego Lugano',
  'Deivid de Souza',
  'Mehmet Aurélio',
  'Tuncay Şanlı',
  'Volkan Demirel',
  'Rüştü Reçber',
  'Emre Belözoğlu',
  'Gökhan Gönül',
  'Caner Erkin',
  'Mehmet Topal',
  'Semih Şentürk',
  'Raul Meireles',
  'Bruno Alves',
  'Simon Kjær',
  'Josef de Souza',
  'Giuliano Victor de Paula',
  'Roberto Soldado',
  'Enner Valencia',
  'Hakan Şükür',
  'Bülent Korkmaz',
  'Hasan Şaş',
  'Ümit Davala',
  'Okan Buruk',
  'Suat Kaya',
  'Tugay Kerimoğlu',
  'Ergün Penbe',
  'Arif Erdem',
  'Ümit Karan',
  'Necati Ateş',
  'Sabri Sarıoğlu',
  'Arda Turan',
  'Selçuk İnan',
  'Burak Yılmaz',
  'Faryd Mondragón',
  'Rigobert Song',
  'Stjepan Tomas',
  'Saša Ilić',
  'Shabani Nonda',
  'Abdul Kader Keïta',
  'Elano Blumer',
  'Felipe Melo',
  'Albert Riera',
  'Emmanuel Eboué',
  'Tomáš Ujfaluši',
  'Johan Elmander',
  'Fernando Muslera',
  'Bafétimbi Gomis',
  'Sofiane Feghouli',
  'Younès Belhanda',
  'Mariano Ferreira',
  'Marcao Teixeira',
  'Wilfried Zaha',
  'Sergen Yalçın',
  'İlhan Mansız',
  'Nihat Kahveci',
  'Pascal Nouma',
  'Óscar Córdoba',
  'Ronaldo Guiaro',
  'Antônio Carlos Zago',
  'Federico Giunti',
  'Daniel Pancu',
  'Tümer Metin',
  'İbrahim Üzülmez',
  'İbrahim Toraman',
  'Deivson Bobô',
  'Matías Delgado',
  'Fabian Ernst',
  'Ricardo Quaresma',
  'Hugo Almeida',
  'Manuel Fernandes',
  'Demba Ba',
  'José Sosa',
  'Atiba Hutchinson',
  'Oğuzhan Özyakup',
  'Gökhan Töre',
  'Olcay Şahan',
  'Cenk Tosun',
  'Marcelo Guedes',
  'Ryan Babel',
  'Anderson Talisca',
  'Vincent Aboubakar',
  'Domagoj Vida',
  'Gary Medel',
  'Rachid Ghezzal',
  'Valentin Rosier',
  'Wout Weghorst',
  'Shota Arveladze',
  'Hami Mandıralı',
  'Gökdeniz Karadeniz',
  'Fatih Tekke',
  'Ibrahima Yattara',
  'Szymon Żurawski',
  'Gustavo Colman',
  'Egemen Korkmaz',
  'Onur Kıvrak',
  'Didier Zokora',
  'José Bosingwa',
  'Dame N\'Doye',
  'Juraj Kucka',
  'Anthony Nwakaeme',
  'Alexander Sørloth',
  'Anastasios Bakasetas',
  'Andreas Cornelius',
  'Bruno Peres',
  'Edin Višća',
  'Pablo Batalla',
  'Vágner Love',
  'Papiss Cissé',
  'Theofanis Gekas',
  'Alexandru Maxim',
  'Arouna Koné',
  'Cicinho',
  'Kennet Andersson',
  'Viorel Moldovan',
  'Elvir Bolić',
  'Milan Rapaić',
  'Haim Revivo',
  'Zoran Mirković',
  'Uche Okechukwu',
  'Jes Høgh',
  'Metin Oktay',
  'Lefter Küçükandonyadis',
  'Can Bartu',
  'Metin Tekin',
  'Ali Gültiken',
  'Feyyaz Uçar',
  'Rıza Çalımbay',
  'Mehmet Özdilek',
  'Tanju Çolak',
  'Rıdvan Dilmen',
  'Aykut Kocaman',
  'Oğuz Çetin',
  'Alpay Özalan',
  'Fatih Akyel',
  'Ümit Özat',
  'Serhat Akın',
  'Edu Dracena',
  'Fábio Luciano',
  'Cristian Baroni',
  'André Santos',
  'Miroslav Stoch',
  'Emmanuel Emenike',
  'Pierre Webó',
  'Hasan Ali Kaldırım',
  'Alper Potuk',
  'Ozan Tufan',
  'Jeremain Lens',
  'Fernandão',
  'Lazar Marković',
  'Roman Neustädter',
  'Mauricio Isla',
  'Nabil Dirar',
  'Aatif Chahechouhe',
  'Vincent Janssen',
  'Islam Slimani',
  'Victor Moses',
  'Max Kruse',
  'Vedat Muriqi',
  'Filip Novák',
  'Dimitris Pelkas',
  'Attila Szalai',
  'Michy Batshuayi',
  'Joshua King',
  'İrfan Can Kahveci',
  'Cengiz Ünder',
  'Çağlar Söyüncü',
  'Zeki Çelik',
  'Merih Demiral',
  'Abdülkadir Ömür',
  'Okay Yokuşlu',
  'Taylan Antalyalı',
  'Emre Kılınç',
  'Emre Akbaba',
  'Ömer Bayram',
  'Martin Linnes',
  'Ryan Donk',
  'Jason Denayer',
  'Garry Rodrigues',
  'Badou Ndiaye',
  'Yasin Öztekin',
  'Aurélien Chedjou',
  'Semih Kaya',
  'Hamit Altıntop',
  'Umut Bulut',
  'Nordin Amrabat',
  'Bruma',
  'Alex Telles',
  'Blerim Džemaili',
  'Olcan Adın',
  'Veysel Sarı',
  'Engin Baytar',
  'Emre Çolak',
  'Servet Çetin',
  'Gökhan Zan',
  'Hakan Balta',
  'Ayhan Akman',
  'Giovani dos Santos',
  'Lucas Neill',
  'Harry Kewell',
  'Fernando Meira',
  'Cassio Lincoln',
  'Tobias Linderoth',
  'Allan Saint-Maximin',
  'Alex Teixeira',
  'Marko Arnautović',
];

const TM_SEARCH_DOMAINS = ['https://www.transfermarkt.com'];

let domainCursor = 0;

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function doesProfileMatchRequestedNames(
  profile: any,
  requestedNames: string[]
): boolean {
  if (!requestedNames || requestedNames.length === 0) return true;
  const candidates = [profile.name, profile.displayName, profile.shortName]
    .filter(Boolean)
    .map((s) => normalizeName(String(s)));

  for (const req of requestedNames) {
    const reqNorm = normalizeName(req);
    const reqTokens = reqNorm.split(' ').filter((t) => t.length >= 2);
    for (const cNorm of candidates) {
      if (cNorm === reqNorm || cNorm.includes(reqNorm) || reqNorm.includes(cNorm)) {
        return true;
      }
      if (reqTokens.some((t) => t.length >= 3 && cNorm.includes(t))) {
        return true;
      }
    }
  }
  return false;
}

const WIKI_USER_AGENT =
  'PenaltyLegendSync/1.0 (https://github.com/penalty-hub; contact@penaltyhub.org)';

async function resolveTmidsBatchViaWikidata(
  names: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (names.length === 0) return result;

  const wikis = [
    { api: 'https://en.wikipedia.org/w/api.php', suffix: ' (footballer)' },
    { api: 'https://tr.wikipedia.org/w/api.php', suffix: ' (futbolcu)' },
  ];

  for (const wiki of wikis) {
    const remaining = names.filter((n) => !result.has(n));
    if (remaining.length === 0) break;

    for (const useSuffix of [false, true]) {
      const stillRemaining = names.filter((n) => !result.has(n));
      if (stillRemaining.length === 0) break;

      const nameToQid = new Map<string, string>();

      for (let i = 0; i < stillRemaining.length; i += 45) {
        const chunk = stillRemaining.slice(i, i + 45);
        const titleToOrig = new Map<string, string>();
        const queryTitles = chunk.map((n) => {
          const t = useSuffix ? `${n}${wiki.suffix}` : n;
          titleToOrig.set(t.toLowerCase(), n);
          return t;
        });

        try {
          const url = `${wiki.api}?action=query&redirects=1&prop=pageprops&ppprop=wikibase_item&titles=${encodeURIComponent(
            queryTitles.join('|')
          )}&format=json`;
          const res = await fetch(url, {
            headers: { 'User-Agent': WIKI_USER_AGENT },
          });
          if (!res.ok) continue;
          const data: any = await res.json();

          const normMap = new Map<string, string>();
          for (const item of data?.query?.normalized || []) {
            normMap.set(String(item.to).toLowerCase(), String(item.from).toLowerCase());
          }
          const redirectMap = new Map<string, string>();
          for (const item of data?.query?.redirects || []) {
            redirectMap.set(String(item.to).toLowerCase(), String(item.from).toLowerCase());
          }

          const pages = Object.values(data?.query?.pages || {}) as any[];
          for (const p of pages) {
            const qid = p?.pageprops?.wikibase_item;
            if (!qid || !p?.title) continue;
            let cur = String(p.title).toLowerCase();
            if (redirectMap.has(cur)) cur = redirectMap.get(cur)!;
            if (normMap.has(cur)) cur = normMap.get(cur)!;
            const origName = titleToOrig.get(cur);
            if (origName) {
              nameToQid.set(origName, String(qid));
            }
          }
        } catch {
          
        }
      }

      const entries = Array.from(nameToQid.entries());
      for (let i = 0; i < entries.length; i += 45) {
        const chunk = entries.slice(i, i + 45);
        const qids = Array.from(new Set(chunk.map(([, qid]) => qid)));
        try {
          const wdUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qids.join(
            '|'
          )}&props=claims&format=json`;
          const wdRes = await fetch(wdUrl, {
            headers: { 'User-Agent': WIKI_USER_AGENT },
          });
          if (!wdRes.ok) continue;
          const wdData: any = await wdRes.json();

          for (const [origName, qid] of chunk) {
            const claims = wdData?.entities?.[qid]?.claims;
            const tmid = claims?.P2446?.[0]?.mainsnak?.datavalue?.value;
            if (tmid && /^\d+$/.test(String(tmid))) {
              result.set(origName, String(tmid));
            }
          }
        } catch {
         
        }
      }
    }
  }

  return result;
}


async function resolveTmidFromWebSearch(
  playerName: string,
  localNameMap: Map<string, string>
): Promise<string | null> {
  const cleanName = playerName.trim();
  const norm = normalizeName(cleanName);

  if (norm.includes(' ') && localNameMap.has(norm)) {
    return localNameMap.get(norm)!;
  }

  const query = encodeURIComponent(cleanName);

  for (const lang of ['en', 'tr', 'es', 'it', 'de', 'pt']) {
    try {
      const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${query}&language=${lang}&format=json&limit=5`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': WIKI_USER_AGENT },
      });
      if (searchRes.ok) {
        const searchData: any = await searchRes.json();
        const qids: string[] = (searchData?.search || []).map((s: any) => s.id).filter(Boolean);
        if (qids.length > 0) {
          const entitiesUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qids.join('|')}&props=claims&format=json`;
          const entRes = await fetch(entitiesUrl, {
            headers: { 'User-Agent': WIKI_USER_AGENT },
          });
          if (entRes.ok) {
            const entData: any = await entRes.json();
            for (const qid of qids) {
              const claims = entData?.entities?.[qid]?.claims;
              const tmidClaim = claims?.P2446?.[0]?.mainsnak?.datavalue?.value;
              if (tmidClaim && /^\d+$/.test(String(tmidClaim))) {
                return String(tmidClaim);
              }
            }
          }
        }
      }
    } catch {
      
    }
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const baseDomain = TM_SEARCH_DOMAINS[domainCursor % TM_SEARCH_DOMAINS.length];
    domainCursor++;
    const url = `${baseDomain}/schnellsuche/ergebnis/schnellsuche?query=${query}`;

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
        },
      });
      if (res.ok) {
        const html = await res.text();
        const match = html.match(
          /\/(?:profil|perfil|profilo|profiel)\/(?:spieler|jugador|giocatore|joueur|oyuncu|jogador|speler)\/(\d+)/
        );
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch {
      
    }

    await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
  }

  return null;
}

export async function syncLegends(): Promise<void> {
  await connectDatabase();

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  
  const INVALID_CACHED_TMIDS = new Set([
    '743591', '318528', '424784', '85771', '33241', '244275', '86759',
    '111961', '169049', '277111', '135554', '292749', '3915', '236886',
    '9829', '6864', '7941', '3602', '7070', '4086', '3405', '35149', '6885',
    '868887', '739477',
  ]);

  
  const resolvedIdsCacheFile = path.join(CACHE_DIR, 'resolved_legend_ids.json');
  let resolvedMap: Record<string, string> = {};
  if (fs.existsSync(resolvedIdsCacheFile)) {
    try {
      const raw = JSON.parse(fs.readFileSync(resolvedIdsCacheFile, 'utf8'));
      for (const [k, v] of Object.entries(raw)) {
        if (
          typeof v === 'string' &&
          Number(v) > 0 &&
          Number(v) < 400000 &&
          !INVALID_CACHED_TMIDS.has(v) &&
          k !== 'Ruud van Nistelrooy' &&
          k !== 'Hakan Şükür' &&
          k !== 'Ronald Koeman' &&
          k !== 'Gheorghe Popescu'
        ) {
          resolvedMap[k] = v;
        }
      }
    } catch {}
  }

  
  await PlayerModel.deleteMany({
    playerId: { $in: Array.from(INVALID_CACHED_TMIDS).map((id) => `tmid_${id}`) },
    isLegend: true,
  });

  console.log('📂 Loading local biography and performance maps...');
  const { playerNationalityByTmid, perfByTmid } = await loadLocalBioAndPerfMaps();

  const countryIdToName = new Map<number, string>(
    Object.entries(COUNTRY_ID_FALLBACK).map(([k, v]) => [Number(k), v])
  );

  const localNameMap = new Map<string, string>();
  const localNameBestMv = new Map<string, number>();
  const bioPath = path.resolve(__dirname, '../../data/kaggle/player_bio.csv');
  if (fs.existsSync(bioPath)) {
    await new Promise<void>((resolve) => {
      fs.createReadStream(bioPath)
        .pipe(csv())
        .on('data', (row: any) => {
          const natId = parseInt(String(row.nationality_id || ''), 10);
          if (natId > 0 && row.nationality && !countryIdToName.has(natId)) {
            countryIdToName.set(natId, String(row.nationality).trim());
          }

          if (row.tmid && row.player_name) {
            const norm = normalizeName(row.player_name);
            if (!norm.includes(' ')) return;
            const tmid = String(row.tmid).trim();
            const numId = Number(tmid);
            if (!numId || numId >= 380000) return;
            const highestMv = parseFloat(String(row.market_value_highest || '0')) || 0;
            const prevMv = localNameBestMv.get(norm) ?? -1;
            if (highestMv >= 25000000 && highestMv > prevMv) {
              localNameMap.set(norm, tmid);
              localNameBestMv.set(norm, highestMv);
            }
          }
        })
        .on('end', () => resolve())
        .on('error', () => resolve());
    });
  }

  const customNamesFile = path.resolve(__dirname, '../../data/legend_names.txt');
  const allTargetNames = new Set<string>(
    DEFAULT_LEGEND_NAMES.map((n) => n.trim()).filter(Boolean)
  );
  if (fs.existsSync(customNamesFile)) {
    const lines = fs.readFileSync(customNamesFile, 'utf8').split(/\r?\n/);
    for (const l of lines) {
      const clean = l.split('#')[0].trim();
      if (clean) allTargetNames.add(clean);
    }
  } else {
    fs.writeFileSync(
      customNamesFile,
      Array.from(allTargetNames).join('\n') + '\n',
      'utf8'
    );
  }

  const namesArray = Array.from(allTargetNames);
  let unresolvedNames = namesArray.filter((n) => !resolvedMap[n]);
  console.log(
    `🔍 Resolving Transfermarkt IDs for ${allTargetNames.size} unique legends (${unresolvedNames.length} new)...`
  );

  if (unresolvedNames.length > 0) {
    console.log('⚡ Step A: Batch-resolving Transfermarkt IDs via Wikipedia & Wikidata P2446...');
    const batchResolved = await resolveTmidsBatchViaWikidata(unresolvedNames);
    for (const [name, tmid] of batchResolved.entries()) {
      resolvedMap[name] = tmid;
      console.log(`  🎯 Otomatik Bulundu (Batch): "${name}" ➔ TM ID: ${tmid}`);
    }
    fs.writeFileSync(resolvedIdsCacheFile, JSON.stringify(resolvedMap, null, 2), 'utf8');
    unresolvedNames = namesArray.filter((n) => !resolvedMap[n]);
  }

  const searchConcurrency = 6;
  for (let i = 0; i < unresolvedNames.length; i += searchConcurrency) {
    const chunk = unresolvedNames.slice(i, i + searchConcurrency);
    await Promise.all(
      chunk.map(async (name) => {
        const tmid = await resolveTmidFromWebSearch(name, localNameMap);
        if (tmid) {
          resolvedMap[name] = tmid;
          console.log(`  🎯 Otomatik Bulundu: "${name}" ➔ TM ID: ${tmid}`);
        } else {
          console.warn(`  ⚠️ Bulunamadı: "${name}"`);
        }
      })
    );
    if (i > 0 && i % 40 === 0) {
      fs.writeFileSync(resolvedIdsCacheFile, JSON.stringify(resolvedMap, null, 2), 'utf8');
    }
    await new Promise((r) => setTimeout(r, 180));
  }

  fs.writeFileSync(resolvedIdsCacheFile, JSON.stringify(resolvedMap, null, 2), 'utf8');

  const targetTmids = new Set<string>();
  const tmidToRequestedNames = new Map<string, string[]>();
  for (const name of namesArray) {
    const tmid = resolvedMap[name];
    if (tmid) {
      targetTmids.add(tmid);
      if (!tmidToRequestedNames.has(tmid)) tmidToRequestedNames.set(tmid, []);
      tmidToRequestedNames.get(tmid)!.push(name);
    }
  }

  const activeDocs = await PlayerModel.find({ isActive: true, isLegend: { $ne: true } })
    .select('playerId')
    .lean();
  const activeIds = new Set(activeDocs.map((d) => d.playerId.replace(/^tmid_/, '')));

  const legendIds = Array.from(targetTmids).filter((id) => !activeIds.has(id));
  console.log(`👑 Fetching live profiles & career histories for ${legendIds.length} legends...`);


  const playerProfiles = new Map<string, any>();
  for (let i = 0; i < legendIds.length; i += 35) {
    const chunk = legendIds.slice(i, i + 35);
    const qs = chunk.map((id) => `ids[]=${id}`).join('&');
    const res = await fetchJsonWithRetry(`${TM_API_BASE}/players?${qs}`);
    for (const p of res?.data || []) {
      playerProfiles.set(String(p.id), p);
    }
  }

  const historyCacheFile = path.join(CACHE_DIR, 'transfer_histories_26_27.json');
  let cachedHistories: Record<string, any> = {};
  if (fs.existsSync(historyCacheFile)) {
    try {
      cachedHistories = JSON.parse(fs.readFileSync(historyCacheFile, 'utf8'));
    } catch {}
  }

  const missingHistoryIds = legendIds.filter((id) => !cachedHistories[id]);
  const concurrency = 25;
  for (let i = 0; i < missingHistoryIds.length; i += concurrency) {
    const chunk = missingHistoryIds.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (pid) => {
        const res = await fetchJsonWithRetry(`${TM_API_BASE}/transfer/history/player/${pid}`);
        if (res?.data) {
          cachedHistories[pid] = {
            terminated: res.data.history?.terminated || [],
            clubIds: res.data.clubIds || [],
          };
        } else {
          cachedHistories[pid] = { terminated: [], clubIds: [] };
        }
      })
    );
  }
  fs.writeFileSync(historyCacheFile, JSON.stringify(cachedHistories), 'utf8');

  const clubCacheFile = path.join(CACHE_DIR, 'clubs_meta_26_27.json');
  let cachedClubs: Record<string, IClubMeta> = {};
  if (fs.existsSync(clubCacheFile)) {
    try {
      cachedClubs = JSON.parse(fs.readFileSync(clubCacheFile, 'utf8'));
    } catch {}
  }

  const allClubIds = new Set<string>();
  for (const pid of legendIds) {
    for (const cid of cachedHistories[pid]?.clubIds || []) {
      if (cid) allClubIds.add(String(cid));
    }
  }

  const missingClubIds = Array.from(allClubIds).filter((cid) => !cachedClubs[cid]);
  for (let i = 0; i < missingClubIds.length; i += 40) {
    const chunk = missingClubIds.slice(i, i + 40);
    const qs = chunk.map((id) => `ids[]=${id}`).join('&');
    const res = await fetchJsonWithRetry(`${TM_API_BASE}/clubs?${qs}`);
    for (const c of res?.data || []) {
      const cid = String(c.id);
      cachedClubs[cid] = {
        id: cid,
        name: c.baseDetails?.shortName || c.name || 'Kulüp',
        fullName: c.name || c.baseDetails?.shortName || 'Kulüp',
        typeId: c.baseDetails?.clubTypeId ?? 1,
        isSpecial: Boolean(c.isSpecialClub),
        crestUrl: c.crestUrl || `https://tmssl.akamaized.net/images/wappen/head/${cid}.png`,
        primaryCompetitionId: c.baseDetails?.primaryCompetitionId,
      };
    }
  }
  fs.writeFileSync(clubCacheFile, JSON.stringify(cachedClubs), 'utf8');
  const clubMap = new Map<string, IClubMeta>(Object.entries(cachedClubs));

  const TURKISH_CLUBS = new Set([
    'Galatasaray',
    'Fenerbahçe',
    'Beşiktaş',
    'Trabzonspor',
    'Başakşehir',
    'Basaksehir',
    'Bursaspor',
    'Sivasspor',
    'Antalyaspor',
    'Konyaspor',
    'Alanyaspor',
    'Kasımpaşa',
    'Kasimpasa',
    'Kayserispor',
    'Gaziantepspor',
    'Gaziantep FK',
    'Gençlerbirliği',
    'Ankaragücü',
    'Çaykur Rizespor',
    'C. Rizespor',
    'Göztepe',
    'Adana Demirspor',
    'Karagümrük',
    'Eskisehirspor',
    'Manisaspor',
  ]);

  let savedCount = 0;
  const bulkOps: any[] = [];

  for (const pid of legendIds) {
    const p = playerProfiles.get(pid);
    if (!p) continue;

    const requestedNames = tmidToRequestedNames.get(pid) || [];
    if (!doesProfileMatchRequestedNames(p, requestedNames)) {
      console.warn(
        `⚠️ İsim doğrulaması eşleşmedi, atlanıyor: İstenen="${requestedNames.join(', ')}" vs TM="${p.name || p.displayName}" (ID: ${pid})`
      );
      continue;
    }

    let name = p.name || p.displayName || 'Unknown';
    if (pid === '18537') name = 'Alex de Souza';
    if (pid === '3140') name = 'Ronaldo Nazário';
    const natId = Number(p.nationalityDetails?.nationalities?.nationalityId || 0);
    const nationality =
      playerNationalityByTmid.get(pid) || countryIdToName.get(natId) || 'Brazil';
    const position =
      p.attributes?.position?.shortName || p.attributes?.positionGroup || 'FWD';
    const age = p.lifeDates?.age || 42;
    const originalImageUrl = p.portraitUrl || '';

    const historyData = cachedHistories[pid] || { terminated: [] };
    const perfStats = perfByTmid.get(pid) || [];
    const careerPath = buildChronologicalCareerPath(
      historyData.terminated,
      '',
      undefined,
      clubMap,
      perfStats,
      true
    );

    if (careerPath.length === 0) continue;

    const clubNames = careerPath.map((s) => s.clubName);
    const playedInSuperLig = clubNames.some((c) => TURKISH_CLUBS.has(c));
    const leagues = playedInSuperLig
      ? ['super_lig', 'premier_league']
      : ['premier_league'];

    console.log(
      `✅ [${pid}] ${name} (${nationality}) ➔ ${clubNames.join(' -> ')}`
    );

    bulkOps.push({
      updateOne: {
        filter: { playerId: `tmid_${pid}` },
        update: {
          $set: {
            playerId: `tmid_${pid}`,
            name,
            knownName: p.shortName || name,
            leagues,
            currentClub: {
              id: 'legend',
              name: '',
              logoUrl: '',
              league: playedInSuperLig ? 'super_lig' : 'global',
            },
            nationality,
            position,
            age,
            marketValueEur: p.marketValueDetails?.current?.value || 0,
            careerPath,
            originalImageUrl,
            isActive: false,
            isLegend: true,
          },
        },
        upsert: true,
      },
    });
    savedCount++;
  }

  if (bulkOps.length > 0) {
    await PlayerModel.bulkWrite(bulkOps);
  }

  console.log(`\n🎉 Toplam ${savedCount} Efsane Futbolcu kariyerleriyle birlikte eklendi!`);
  await exportSearchIndex();
}

if (require.main === module) {
  syncLegends().catch((err) => {
    console.error('❌ Error in syncLegends:', err);
    process.exit(1);
  });
}
