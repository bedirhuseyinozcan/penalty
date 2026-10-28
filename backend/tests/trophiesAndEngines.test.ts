import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  inferPlayerTrophies,
  CLUB_TO_LEAGUE_MAP,
  UCL_WINNER_TMIDS,
  WORLD_CUP_WINNER_TMIDS,
  BALLON_DOR_WINNER_TMIDS,
  GOLDEN_BOOT_WINNER_TMIDS,
} from '../src/scripts/exportSearchIndex';

describe('🏆 Trophies & Data Engine Tests', () => {
  it('Ronaldo Nazário (tmid_3140) tüm efsane kupalarına sahip olmalı', () => {
    const r9 = {
      playerId: 'tmid_3140',
      name: 'Ronaldo Nazário',
      careerPath: [{ clubName: 'Real Madrid', startYear: 2002, endYear: 2007 }],
    };
    const trophies = inferPlayerTrophies(r9);
    assert.ok(trophies.includes('world_cup'), 'Dünya Kupası olmalı');
    assert.ok(trophies.includes('ballon_dor'), 'Ballon dOr olmalı');
    assert.ok(trophies.includes('golden_boot'), 'Altın Ayakkabı olmalı');
    assert.ok(trophies.includes('league_champion'), 'Lig Şampiyonu olmalı');
  });

  it('Brezilyalı 1994 efsanesi Jorginho (tmid_16973) Dünya Kupası listesinde olmalı', () => {
    assert.strictEqual(WORLD_CUP_WINNER_TMIDS.has('tmid_16973'), true);
  });

  it('Lionel Messi (tmid_28003) kupa koleksiyonu eksiksiz olmalı', () => {
    const messi = {
      playerId: 'tmid_28003',
      name: 'Lionel Messi',
      careerPath: [{ clubName: 'Barcelona', startYear: 2004, endYear: 2021 }],
    };
    const trophies = inferPlayerTrophies(messi);
    assert.ok(trophies.includes('ucl'), 'UCL olmalı');
    assert.ok(trophies.includes('world_cup'), 'Dünya Kupası olmalı');
    assert.ok(trophies.includes('ballon_dor'), 'Ballon dOr olmalı');
    assert.ok(trophies.includes('golden_boot'), 'Golden Boot olmalı');
    assert.ok(trophies.includes('league_champion'), 'Lig Şampiyonu olmalı');
  });

  it('Kulüp -> Lig haritasında 5 büyük lig ve Süper Lig takımları doğru eşleşmeli', () => {
    assert.strictEqual(CLUB_TO_LEAGUE_MAP['Real Madrid'], 'la_liga');
    assert.strictEqual(CLUB_TO_LEAGUE_MAP['Man City'], 'premier_league');
    assert.strictEqual(CLUB_TO_LEAGUE_MAP['Inter'], 'serie_a');
    assert.strictEqual(CLUB_TO_LEAGUE_MAP['Bayern Munich'], 'bundesliga');
    assert.strictEqual(CLUB_TO_LEAGUE_MAP['PSG'], 'ligue_1');
    assert.strictEqual(CLUB_TO_LEAGUE_MAP['Galatasaray'], 'super_lig');
    assert.strictEqual(CLUB_TO_LEAGUE_MAP['Fenerbahçe'], 'super_lig');
  });
});
