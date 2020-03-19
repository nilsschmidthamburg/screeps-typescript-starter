import {BaseCreepApi} from "./BaseCreepApi";

export class Invader {
  public static run(creep: Creep) {
    if (creep.room.name !== creep.memory.destinationRoom && creep.memory.working) {
      // Go to room to invade
      BaseCreepApi.goToRoom(creep, creep.memory.destinationRoom!!);
    } else if (creep.room.name !== creep.memory.homeRoom && !creep.memory.working) {
      // Go home
      BaseCreepApi.goToRoom(creep, creep.memory.homeRoom);
    } else {
      // Base Attacker
      if (creep.hitsMax / creep.hits > 0.9) {
        creep.memory.working = true;
      } else if (creep.hitsMax / creep.hits < 0.2) {
        creep.memory.working = false;
      }

      if (creep.memory.working) {
        const hostileCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)

        if (hostileCreep !== null) {
          if (creep.attack(hostileCreep) === ERR_NOT_IN_RANGE) {
            creep.moveTo(hostileCreep, {visualizePathStyle: {stroke: '#ff8800'}});
          }
        }
      } else {
        const ownTower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
          filter: (s) => s.structureType === STRUCTURE_TOWER
        });
        if (ownTower !== null) {
          creep.moveTo(ownTower, {visualizePathStyle: {stroke: '#ff8800'}});
        }
      }
    }
  }

  public static spawnInvader(spawn: StructureSpawn, destinationRoom: string) {
    // ATTACK = 80
    // TOUGH = 10
    // MOVE = 100
    const blocks = Math.floor((spawn.room.energyAvailable - 50) / 140);
    const modules: BodyPartConstant[] = [];
    for (let i = 0; i < blocks; i++) {
      modules.push(TOUGH)
    }
    for (let i = 0; i < blocks; i++) {
      modules.push(MOVE)
    }
    for (let i = 0; i < blocks; i++) {
      modules.push(ATTACK)
    }
    modules.push(MOVE)

    spawn.spawnCreep(modules, "Darth Invader " + Game.time % 10, {
      memory: {
        role: CreepRole.Invader,
        homeRoom: spawn.room.name,
        destinationRoom: destinationRoom,
        working: false,
        creationTime: Game.time
      }
    });
  }
}
