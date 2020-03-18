import {EarlyBuilder} from "creeps/EarlyBuilder";
import {EarlyHarvester} from "creeps/EarlyHarvester";
import {EarlyUpgrader} from "creeps/EarlyUpgrader";
import {EarlyWallRepairer} from "creeps/EarlyWallRepairer";
import {Tower} from "Tower";
import {ErrorMapper} from "utils/ErrorMapper";
import {LongDistanceHarvester} from "./creeps/LongDistanceHarvester";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

// FIXME Als object umbauen, also von key=role auf value=werte!!!
  const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === CreepRole.Harvester);
  const builders = _.filter(Game.creeps, (creep) => creep.memory.role === CreepRole.Builder);
  const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === CreepRole.Upgrader);
  const wallrepairers = _.filter(Game.creeps, (creep) => creep.memory.role === CreepRole.WallRepairer);
  const longDistanceW34S35 = _.filter(Game.creeps, (creep) => creep.memory.role === CreepRole.LongDistanceHarvester && creep.memory.destinationRoom === "W34S35");
  const longDistanceW33S36 = _.filter(Game.creeps, (creep) => creep.memory.role === CreepRole.LongDistanceHarvester && creep.memory.destinationRoom === "W33S36");


  function spawn(role: CreepRole, availableBlocksOfHundred: number, homeRoom: string, destinationRoom: string = "NONE") {
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
    Game.spawns.Spawn1.spawnCreep(modules, newName, {
      memory: {
        role,
        homeRoom,
        destinationRoom,
        working: false,
        creationTime: Game.time
      }
    });
  }

  const room = Game.spawns.Spawn1.room;
  const roomName = room.name;
  const startupPhase = Game.spawns.Spawn1.room.energyCapacityAvailable <= 1000;

  const minHarvesters = startupPhase ? 5 : 2;
  const minBuilders = startupPhase ? 5 : 2;
  const minUpgraders = room.controller !== null && room.controller!!.ticksToDowngrade < 15000 ? 1 : 0;
  const minWallRepairers = 1;
  // FIXME: First we need to kill the source keeprs in room W34S35, otherwise we cant send harvesters in
  const minLongDistanceW34S35 = 0;
  const minLongDistanceW33S36 = 2;

  const maxNumberOfBlocksOfHundred = Math.floor(Game.spawns.Spawn1.room.energyCapacityAvailable / 100);
  const currentNumberOfBlocksOfHundred = Math.floor(Game.spawns.Spawn1.room.energyAvailable / 100);
  if (currentNumberOfBlocksOfHundred > 10 || maxNumberOfBlocksOfHundred === currentNumberOfBlocksOfHundred || (Object.keys(Game.creeps).length <= 6 && currentNumberOfBlocksOfHundred >= 2)) {
    if (harvesters.length < minHarvesters) {
      spawn(CreepRole.Harvester, currentNumberOfBlocksOfHundred, roomName)
    } else if (upgraders.length < minUpgraders) {
      spawn(CreepRole.Upgrader, currentNumberOfBlocksOfHundred, roomName);
    } else if (builders.length < minBuilders) {
      spawn(CreepRole.Builder, currentNumberOfBlocksOfHundred, roomName);
    } else if (wallrepairers.length < minWallRepairers) {
      spawn(CreepRole.WallRepairer, currentNumberOfBlocksOfHundred, roomName);
    } else if (longDistanceW34S35.length < minLongDistanceW34S35) {
      spawn(CreepRole.LongDistanceHarvester, currentNumberOfBlocksOfHundred, roomName, "W34S35");
    } else if (longDistanceW33S36.length < minLongDistanceW33S36) {
      spawn(CreepRole.LongDistanceHarvester, currentNumberOfBlocksOfHundred, roomName, "W33S36");
    }
  }

  if (Game.spawns.Spawn1.spawning) {
    const spawningCreep = Game.creeps[Game.spawns.Spawn1.spawning.name];
    Game.spawns.Spawn1.room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      Game.spawns.Spawn1.pos.x + 1,
      Game.spawns.Spawn1.pos.y,
      {align: 'left', opacity: 0.8});
  }

  const towers = room.find(FIND_MY_STRUCTURES, {
    filter: structure => structure.structureType === STRUCTURE_TOWER && structure.store.energy > 9
  });
  towers.forEach(tower => Tower.run(tower as StructureTower));

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
  }
});
