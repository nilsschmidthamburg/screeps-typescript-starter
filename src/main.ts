import {EarlyBuilder} from "creeps/EarlyBuilder";
import {EarlyHarvester} from "creeps/EarlyHarvester";
import {EarlyUpgrader} from "creeps/EarlyUpgrader";
import {EarlyWallRepairer} from "creeps/EarlyWallRepairer";
import {Tower} from "Tower";
import {ErrorMapper} from "utils/ErrorMapper";
import {LongDistanceHarvester} from "./creeps/LongDistanceHarvester";
import {Claimer} from "./creeps/Claimer";
import {Invader} from "./creeps/Invader";

export const loop = ErrorMapper.wrapLoop(() => {
  clearMemory();

  // FIXME Als object umbauen, also von key=role auf value=werte!!!
  for (const spawnName in Game.spawns) {
    const spawn = Game.spawns[spawnName];
    const room = spawn.room;
    const roomName = room.name;

    const startupPhase = spawn.room.energyCapacityAvailable <= 1000;

    const minHarvesters = startupPhase ? 5 : 2;
    const minBuilders = startupPhase ? 5 : 2;
    const minUpgraders = room.controller !== null && room.controller!!.ticksToDowngrade < 15000 ? 1 : 0;
    const minWallRepairers = 1;
    // FIXME: First we need to kill the source keeprs in room W34S35, otherwise we cant send harvesters in
    const minLongDistanceW34S35 = 0;
    const minLongDistanceW33S36 = 0;
    const minLongDistanceW33S37 = 0;
    const minInvaders = 0;


    const myCreepsInCurrentRoom = room.find(FIND_MY_CREEPS);
    const harvesters = _.filter(myCreepsInCurrentRoom, (creep) => creep.memory.role === CreepRole.Harvester);
    const builders = _.filter(myCreepsInCurrentRoom, (creep) => creep.memory.role === CreepRole.Builder);
    const upgraders = _.filter(myCreepsInCurrentRoom, (creep) => creep.memory.role === CreepRole.Upgrader);
    const wallrepairers = _.filter(myCreepsInCurrentRoom, (creep) => creep.memory.role === CreepRole.WallRepairer);
    const longDistanceW34S35 = _.filter(Game.creeps, (creep) => creep.memory.role === CreepRole.LongDistanceHarvester && creep.memory.destinationRoom === "W34S35");
    const longDistanceW33S36 = _.filter(Game.creeps, (creep) => creep.memory.role === CreepRole.LongDistanceHarvester && creep.memory.destinationRoom === "W33S36");
    const longDistanceW33S37 = _.filter(Game.creeps, (creep) => creep.memory.role === CreepRole.LongDistanceHarvester && creep.memory.destinationRoom === "W33S37");
    const invaders = _.filter(Game.creeps, (creep) => creep.memory.role === CreepRole.Invader && creep.memory.destinationRoom === "W33S37");


    const maxNumberOfBlocksOfHundred = Math.floor(room.energyCapacityAvailable / 100);
    const currentNumberOfBlocksOfHundred = Math.floor(room.energyAvailable / 100);
    if (currentNumberOfBlocksOfHundred > 10 || maxNumberOfBlocksOfHundred === currentNumberOfBlocksOfHundred || (myCreepsInCurrentRoom.length <= 6 && currentNumberOfBlocksOfHundred >= 2)) {
      if (harvesters.length < minHarvesters) {
        spawnCreep(spawn, CreepRole.Harvester, currentNumberOfBlocksOfHundred, roomName)
      } else if (spawn.memory.claimRoom !== null) {
        if (Claimer.spawnClaimer(spawn, spawn.memory.claimRoom) === OK) {
          spawn.memory.claimRoom = null;
        }
      } else if (upgraders.length < minUpgraders) {
        spawnCreep(spawn, CreepRole.Upgrader, currentNumberOfBlocksOfHundred, roomName);
      } else if (builders.length < minBuilders) {
        spawnCreep(spawn, CreepRole.Builder, currentNumberOfBlocksOfHundred, roomName);
      } else if (wallrepairers.length < minWallRepairers) {
        spawnCreep(spawn, CreepRole.WallRepairer, currentNumberOfBlocksOfHundred, roomName);
      } else if (longDistanceW34S35.length < minLongDistanceW34S35) {
        spawnCreep(spawn, CreepRole.LongDistanceHarvester, currentNumberOfBlocksOfHundred, roomName, "W34S35");
      } else if (longDistanceW33S36.length < minLongDistanceW33S36) {
        spawnCreep(spawn, CreepRole.LongDistanceHarvester, currentNumberOfBlocksOfHundred, roomName, "W33S36");
      } else if (longDistanceW33S37.length < minLongDistanceW33S37) {
        spawnCreep(spawn, CreepRole.LongDistanceHarvester, currentNumberOfBlocksOfHundred, roomName, "W33S37");
      } else if (invaders.length < minInvaders) {
        Invader.spawnInvader(spawn, "W33S37");
      }
    }

    if (spawn.spawning) {
      const spawningCreep = Game.creeps[spawn.spawning.name];
      room.visual.text(
        '🛠️' + spawningCreep.memory.role,
        spawn.pos.x + 1,
        spawn.pos.y,
        {align: 'left', opacity: 0.8});
    }

    const towers = room.find(FIND_MY_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_TOWER && structure.store.energy > 9
    });
    towers.forEach(tower => Tower.run(tower as StructureTower));

  }
  // FIXME Use Visitor Pattern!!!
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (creep.memory.role.startsWith(CreepRole.Harvester)) {
      EarlyHarvester.run(creep);
    }
    if (creep.memory.role.startsWith(CreepRole.Upgrader)) {
      EarlyUpgrader.run(creep);
    }
    if (creep.memory.role.startsWith(CreepRole.Builder)) {
      EarlyBuilder.run(creep);
    }
    if (creep.memory.role.startsWith(CreepRole.WallRepairer)) {
      EarlyWallRepairer.run(creep);
    }
    if (creep.memory.role.startsWith(CreepRole.LongDistanceHarvester)) {
      LongDistanceHarvester.run(creep);
    }
    if (creep.memory.role.startsWith(CreepRole.Claimer)) {
      Claimer.run(creep);
    }
    if (creep.memory.role.startsWith(CreepRole.Invader)) {
      Invader.run(creep);
    }
  }

  function spawnCreep(spawn: StructureSpawn, role: CreepRole, availableBlocksOfHundred: number, homeRoom: string, destinationRoom: (string | null) = null) {
    // MOVE,	50
    // CARRY,	50
    // WORK,	100
    let usedBlocksOfHundred = 0;
    const modules: BodyPartConstant[] = [];
    while (usedBlocksOfHundred < availableBlocksOfHundred) {
      if (usedBlocksOfHundred % 2 === 0 || (role === CreepRole.LongDistanceHarvester && usedBlocksOfHundred % 3 == 0)) {
        modules.push(MOVE, CARRY)
      } else {
        modules.push(WORK)
      }
      usedBlocksOfHundred++;
    }

    const newName = `${role.toString()[0]}_${Game.time % 100}`;
    console.log(`Spawning new ${role}: ${newName}`);
    spawn.spawnCreep(modules, newName, {
      memory: {
        role,
        homeRoom,
        destinationRoom,
        working: false,
        creationTime: Game.time
      }
    });
  }

  function clearMemory() {
    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }
  }
});
