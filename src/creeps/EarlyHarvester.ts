import {BaseCreepApi} from "./BaseCreepApi";
import {EarlyBuilder} from "./EarlyBuilder";

export class EarlyHarvester {
  public static run(creep: Creep) {
    BaseCreepApi.setWorkingInMemory(creep);

    if (creep.memory.working) {
      const target = creep.pos
        .findClosestByPath(FIND_MY_STRUCTURES, {
          filter: structure => {
            return (
              (structure.structureType === STRUCTURE_EXTENSION ||
                structure.structureType === STRUCTURE_SPAWN) &&
              structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            );
          }
        });
      /*
            if (targets.length === 0) {
              targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: structure =>
                  structure.structureType === STRUCTURE_STORAGE && structure.store.energy < 10000 && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
              });
            }
      */
      if (target !== null) {
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: "#FFFF00"}});
        }
      } else {
        EarlyBuilder.run(creep)
      }
    } else {
      BaseCreepApi.harvestOrGotoSource(creep);
    }
  }
}
