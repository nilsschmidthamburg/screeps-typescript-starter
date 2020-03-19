import {BaseCreepApi} from "./BaseCreepApi";
import {EarlyHarvester} from "./EarlyHarvester";

export class LongDistanceHarvester {
  public static run(creep: Creep) {
    BaseCreepApi.setWorkingInMemory(creep);

    if (creep.ticksToLive != null && creep.ticksToLive > 250 && creep.room.name !== creep.memory.destinationRoom && !creep.memory.working) {
      // Go to your harvest room
      BaseCreepApi.goToRoom(creep, creep.memory.destinationRoom!!);
    } else if (creep.room.name !== creep.memory.homeRoom && creep.memory.working) {
      // If there are are roads to build or repair, do it!
      if (!BaseCreepApi.somethingToBuild(creep) && !BaseCreepApi.someRoadToRepair(creep)) {
        // Go home
        BaseCreepApi.goToRoom(creep, creep.memory.homeRoom);
      }
    } else {
      EarlyHarvester.run(creep);
    }
  }
}
