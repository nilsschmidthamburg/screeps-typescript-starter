import {BaseCreepApi} from "./BaseCreepApi";
import {EarlyUpgrader} from "./EarlyUpgrader";

export class EarlyBuilder {

  public static run(creep: Creep) {
    BaseCreepApi.setWorkingInMemory(creep);
    if (creep.memory.destinationRoom !== null && creep.room.name !== creep.memory.destinationRoom) {
      BaseCreepApi.goToRoom(creep, creep.memory.destinationRoom)
      return;
    }

    function someTowerToFill() {
      const tower = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: structure => {
          return structure.structureType === STRUCTURE_TOWER &&
            (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 500 || (structure.pos.inRangeTo(creep, 1) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
        }
      }) as StructureTower;
      if (tower !== null) {
        if (creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(tower, {visualizePathStyle: {stroke: "#ffffff"}});
        }
        return true;
      }
      return false;
    }

    if (creep.memory.working) {
      if (+creep.memory.creationTime % 2 === 0 && someTowerToFill()) {
        creep.say('Fill Tower');
      } else if (BaseCreepApi.somethingToBuild(creep)) {
        creep.say('Build');
      } else if (+creep.memory.creationTime % 4 === 1 && BaseCreepApi.somethingToRepair(creep, FIND_MY_STRUCTURES, (it) => it.hits <= 25000 && it.hits < it.hitsMax)) {
        creep.say('Rep. Primary');
      } else if (+creep.memory.creationTime % 4 === 3 && BaseCreepApi.someRoadToRepair(creep)) {
        creep.say('Rep. Road');
      } else {
        EarlyUpgrader.run(creep);
      }
    } else {
      BaseCreepApi
        .harvestOrGotoSource(creep);
    }
  }
}
