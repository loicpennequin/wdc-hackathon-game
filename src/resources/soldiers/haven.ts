import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';
import {} from '../factions';

export const swordsman: SoldierData = {
  id: 'swordsman',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Swordsman',
  cost: 2,
  initiative: 5,
  skills: [
    {
      id: 'swordsman_default_attack',
      name: 'Normal attack',
      cost: 1
    }
  ]
};

export const havenSoldiers = { swordsman };