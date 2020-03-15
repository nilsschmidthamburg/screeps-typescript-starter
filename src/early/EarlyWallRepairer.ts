import {BaseCreepApi} from "./BaseCreepApi";
import {EarlyBuilder} from "./EarlyBuilder";

export class EarlyWallRepairer {

  public static run(creep: Creep) {

    if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.working = false;
      creep.say('🔄 harvest');
    }
    if ((!creep.memory.working && creep.store.getFreeCapacity() === 0) || creep.room.find(FIND_SOURCES_ACTIVE).length === 0) {
      creep.memory.working = true;
      creep.say('🚧 repair');
    }

    function someWallToBeRepaired() {
      const walls = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_WALL
      });
      const ramparts = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_RAMPART
      });

      for (let percentage = 0.00003; percentage <= 1; percentage += 0.00003) {
        const wall = creep.pos.findClosestByRange(walls, {
          filter: (w: StructureWall) => w.hits / w.hitsMax < percentage
        });
        if (wall != null) {
          if (creep.repair(wall) === ERR_NOT_IN_RANGE) {
            creep.moveTo(wall, {visualizePathStyle: {stroke: '#ffffff'}});
          }
          return true;
        } else {
          const rampart = creep.pos.findClosestByRange(ramparts, {
            filter: (w: StructureWall) => w.hits / w.hitsMax < percentage
          });
          if (rampart != null) {
            if (creep.repair(rampart) === ERR_NOT_IN_RANGE) {
              creep.moveTo(rampart, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return true;
          }
        }
      }
      return false;
    }

    // FIXME Start only if hit points are below half. But once we started the repair we should repair to full energy!)
    if (creep.memory.working) {
      if (someWallToBeRepaired()) {
        creep.say('Repair Wall');
      } else {
        EarlyBuilder.run(creep);
      }
    } else {
      BaseCreepApi.harvestOrGotoSource(creep);
    }
  }
}
