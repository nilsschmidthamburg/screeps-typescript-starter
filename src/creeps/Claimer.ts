import {BaseCreepApi} from "./BaseCreepApi";

export class Claimer {
  public static run(creep: Creep) {
    if (creep.room.name !== creep.memory.destinationRoom) {
      BaseCreepApi.goToRoom(creep, creep.memory.destinationRoom!!);
    } else if (creep.room.controller != null) {
      if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    } else {
      console.log(creep.name + ": My destination room does not have a room controller...")
      creep.say("Help! (console)")
    }
  }

  public static spawnClaimer(spawn: StructureSpawn, destinationRoom: string) {
    return spawn.spawnCreep([MOVE, CLAIM], "Claimer" + Game.time % 10, {
      memory: {
        role: CreepRole.Claimer,
        homeRoom: spawn.room.name,
        destinationRoom: destinationRoom,
        working: false,
        creationTime: Game.time
      }
    });
  }
}
