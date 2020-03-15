import {BaseCreepApi} from "./BaseCreepApi";
import {EarlyUpgrader} from "./EarlyUpgrader";

export class EarlyBuilder {

  public static run(creep: Creep) {

    if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.working = false;
      creep.say('🔄 harvest');
    }
    if ((!creep.memory.working && creep.store.getFreeCapacity() === 0) || creep.room.find(FIND_SOURCES_ACTIVE).length === 0) {
      creep.memory.working = true;
      creep.say('🚧 build or repair');
    }

    // FIXME Start only if hit points are below half. But once we started the repair we should repair to full energy!)
    function somethingToRepair(structureType: (FIND_MY_STRUCTURES | FIND_STRUCTURES), filter: (s: Structure) => boolean) {
      const structure = creep.pos.findClosestByPath(structureType, {
        filter
      });
      if (structure !== null) {
        if (creep.repair(structure) === ERR_NOT_IN_RANGE) {
          creep.moveTo(structure, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        return true;
      }
      return false;
    }

    function somethingToBuild() {
      const site = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
      if (site != null) {
        if (creep.build(site) === ERR_NOT_IN_RANGE) {
          creep.moveTo(site, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        return true;
      }
      return false;
    }

    function someTowerToFill() {
      const tower = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: structure => {
          return structure.structureType === STRUCTURE_TOWER &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        }
      }) as StructureTower;
      if (tower !== null && tower.store.getFreeCapacity(RESOURCE_ENERGY) > 500 || tower.pos.inRangeTo(creep, 1)) {
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
      } else if (somethingToBuild()) {
        creep.say('Build');
      } else if (+creep.memory.creationTime % 4 === 1 && somethingToRepair(FIND_MY_STRUCTURES, (it) => it.hits <= 25000 && it.hits < it.hitsMax)) {
        creep.say('Rep. Primary');
      } else if (+creep.memory.creationTime % 4 === 3 && somethingToRepair(FIND_STRUCTURES, (it) => it.hits <= 25000 && it.hits < it.hitsMax && it.structureType === STRUCTURE_ROAD)) {
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
