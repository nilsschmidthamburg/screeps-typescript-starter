import {BaseCreepApi} from "./BaseCreepApi";

export class EarlyUpgrader {
  public static run(creep: Creep) {
    BaseCreepApi.setWorkingInMemory(creep);

    if (creep.memory.working) {
      BaseCreepApi.upgradeRoomController(creep);
    } else {
      BaseCreepApi.harvestOrGotoSource(creep);
    }
  }
}
