import {BaseCreepApi} from "./BaseCreepApi";

export class EarlyUpgrader {
  public static run(creep: Creep) {

    if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.working = false;
      creep.say('🔄 Harvest');
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
      creep.memory.working = true;
      creep.say('⚡ Upgrade RC');
    }

    if (creep.memory.working) {
      BaseCreepApi.upgradeRoomController(creep);
    } else {
      BaseCreepApi.harvestOrGotoSource(creep);
    }
  }
}
