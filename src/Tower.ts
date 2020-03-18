export class Tower {
  public static run(tower: StructureTower) {
    if (!tower.my) {
      console.error("not my tower " + tower.id);
      return;
    }

    const hostileCreep = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (hostileCreep) {
      tower.attack(hostileCreep);
      return;
    }

    if (tower.energy < tower.energyCapacity / 2) {
      // save for later (potential attacks)
      return;
    }

    const creepsToHeal = findMyCreepsToHeal();
    if (creepsToHeal.length > 0) {
      tower.heal(creepsToHeal[0]);
      return;
    }
    const myStructuresToRepair = findMyStructuresToRepair();
    if (myStructuresToRepair.length > 0) {
      tower.repair(myStructuresToRepair[0]);
      return;
    }
    const roadsToRepair = findRoadsToRepair();
    if (roadsToRepair.length > 0) {
      tower.repair(roadsToRepair[0]);
      return;
    }
    const rampartsToRepair = findRampartsToRepair();
    if (rampartsToRepair.length > 0) {
      tower.repair(rampartsToRepair[0]);
      return;
    }
    const wallsToRepair = findWallsToRepair();
    if (wallsToRepair.length > 0) {
      tower.repair(wallsToRepair[0]);
      return;
    }

    // FIXME: This should be unit tested!!!
    function amountToBe(action: ("ATTACKED" | "REPAIRED" | "HEALED"), pos: RoomPosition) {
      const distance = tower.pos.getRangeTo(pos);
      // FIXME Calculate effectiveness:

      const max = action === "ATTACKED" ? 600 : (action === "HEALED" ? 400 : 800);
      const min = action === "ATTACKED" ? 150 : (action === "HEALED" ? 100 : 200);
      if (distance <= 5) {
        return max;
      } else if (distance >= 20) {
        return min;
      } else {
        return max - (((max - min) / 15) * (distance - 5));
      }
      // Attack:  600 hits at range ≤5 to 150 hits at range ≥20
      // Heal:    400 hits at range ≤5 to 100 hits at range ≥20
      // Repair:  800 hits at range ≤5 to 200 hits at range ≥20
    }

    function findMyCreepsToHeal() {
      return tower.room.find(FIND_MY_CREEPS, {
        filter: c => c.hits < c.hitsMax
      });
    }

    function findMyStructuresToRepair() {
      return tower.room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType !== STRUCTURE_RAMPART && structure.hits < structure.hitsMax
      });
    }

    function findRoadsToRepair() {
      return tower.room.find(FIND_STRUCTURES, {
        filter: structure =>
          structure.structureType === STRUCTURE_ROAD && structure.hits <= 25000 && structure.hits < structure.hitsMax
      });
    }

    function findWallsToRepair() {
      // Important!!! Do not repair wall to more than a thousand hitpoints! Otherwise we will spend our whole enegry.
      return tower.room.find(FIND_STRUCTURES, {
        filter: structure =>
          structure.structureType === STRUCTURE_WALL && structure.hits <= 1000
      });
    }

    function findRampartsToRepair() {
      // Important!!! Do not repair ramparts to more than a thousand hitpoints! Otherwise we will spend our whole enegry.
      return tower.room.find(FIND_MY_STRUCTURES, {
        filter: structure =>
          structure.structureType === STRUCTURE_RAMPART && structure.hits <= 30000
      });
    }
  }
}
