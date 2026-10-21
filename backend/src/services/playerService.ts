import fs from 'fs';
import path from 'path';
import { PlayerModel, IPlayer } from '../models/Player';
import { TOP_5_LEAGUES, SUPPORTED_LEAGUES, LeagueMode } from '../config/constants';
import { AppError } from '../middlewares/errorHandler';

export interface ISearchIndexItem {
  id: string;
  name: string;
  nationality: string;
  position: string;
  club: string;
  clubId?: string;
  clubLogoUrl?: string;
  league: string;
  age?: number;
  shirtNumber?: number;
  clubs?: string[];
  trophies?: string[];
}

export interface IGuessComparison {
  isCorrect: boolean;
  player: {
    id: string;
    name: string;
    nationality: string;
    position: string;
    club: string;
    age: number;
    shirtNumber?: number;
  };
  comparison: {
    club: 'correct' | 'wrong';
    league: 'correct' | 'wrong';
    nationality: 'correct' | 'wrong';
    position: 'correct' | 'wrong';
    age: 'correct' | 'higher' | 'lower';
    shirtNumber?: 'correct' | 'higher' | 'lower';
  };
}

export class PlayerService {
  public async getSearchIndex(leagueMode?: LeagueMode): Promise<ISearchIndexItem[]> {
    const jsonPath = path.resolve(__dirname, '../../data/search-index.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        const items = JSON.parse(fileContent) as ISearchIndexItem[];
        if (leagueMode === 'super_lig') {
          return items.filter((p) => p.league === SUPPORTED_LEAGUES.SUPER_LIG);
        } else if (leagueMode === 'global') {
          return items.filter((p) => p.league !== SUPPORTED_LEAGUES.SUPER_LIG);
        }
        return items;
      } catch (err) {
        console.warn('⚠️ Could not load search-index.json from disk, falling back to database query:', err);
      }
    }

    const query: Record<string, unknown> = { isActive: true };

    if (leagueMode === 'super_lig') {
      query.leagues = SUPPORTED_LEAGUES.SUPER_LIG;
    } else if (leagueMode === 'global') {
      query.leagues = { $in: TOP_5_LEAGUES };
    }

    const players = await PlayerModel.find(query)
      .select('playerId name nationality position currentClub leagues age shirtNumber careerPath marketValueEur')
      .lean();

    const BAD_CLUB_NAMES = new Set(['Without Club', 'Unknown', 'Career break', 'Retired', 'Kulüp']);

    return players.map((p) => {
      const clubSet = new Set<string>();
      if (p.currentClub?.name && !BAD_CLUB_NAMES.has(p.currentClub.name)) {
        clubSet.add(p.currentClub.name.trim());
      }
      if (Array.isArray(p.careerPath)) {
        for (const step of p.careerPath) {
          const cName = step.clubName?.trim();
          if (cName && !BAD_CLUB_NAMES.has(cName)) {
            clubSet.add(cName);
          }
        }
      }

      return {
        id: p.playerId,
        name: p.name,
        nationality: p.nationality,
        position: p.position,
        club: p.currentClub?.name || '',
        clubId: p.currentClub?.id,
        clubLogoUrl: p.currentClub?.logoUrl,
        league: p.currentClub?.league || '',
        age: p.age,
        shirtNumber: p.shirtNumber,
        clubs: Array.from(clubSet),
      };
    });
  }

  public async getPlayerById(playerId: string): Promise<IPlayer> {
    const player = await PlayerModel.findOne({ playerId, isActive: true }).lean();
    if (!player) {
      throw new AppError(`Player with id "${playerId}" not found`, 404);
    }
    return player as unknown as IPlayer;
  }

  public async compareGuess(targetPlayerId: string, guessedPlayerId: string): Promise<IGuessComparison> {
    const [target, guess] = await Promise.all([
      PlayerModel.findOne({ playerId: targetPlayerId }).lean(),
      PlayerModel.findOne({ playerId: guessedPlayerId }).lean(),
    ]);

    if (!target) throw new AppError('Target player not found', 404);
    if (!guess) throw new AppError('Guessed player not found', 404);

    const isCorrect = target.playerId === guess.playerId;

    const ageDiff = target.age - guess.age;
    let ageComp: 'correct' | 'higher' | 'lower' = 'correct';
    if (ageDiff > 0) ageComp = 'higher'; // Target is older
    else if (ageDiff < 0) ageComp = 'lower'; // Target is younger

    let shirtComp: 'correct' | 'higher' | 'lower' | undefined;
    if (target.shirtNumber != null && guess.shirtNumber != null) {
      if (target.shirtNumber === guess.shirtNumber) shirtComp = 'correct';
      else if (target.shirtNumber > guess.shirtNumber) shirtComp = 'higher';
      else shirtComp = 'lower';
    }

    const sharesLeague = target.leagues.some((l) => guess.leagues.includes(l));

    return {
      isCorrect,
      player: {
        id: guess.playerId,
        name: guess.name,
        nationality: guess.nationality,
        position: guess.position,
        club: guess.currentClub.name,
        age: guess.age,
        shirtNumber: guess.shirtNumber,
      },
      comparison: {
        club: target.currentClub.id === guess.currentClub.id ? 'correct' : 'wrong',
        league: sharesLeague ? 'correct' : 'wrong',
        nationality: target.nationality.toLowerCase() === guess.nationality.toLowerCase() ? 'correct' : 'wrong',
        position: target.position === guess.position ? 'correct' : 'wrong',
        age: ageComp,
        shirtNumber: shirtComp,
      },
    };
  }
}

export const playerService = new PlayerService();
