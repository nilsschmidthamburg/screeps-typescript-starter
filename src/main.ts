import {EarlyBuilder} from "early/EarlyBuilder";
import {EarlyHarvester} from "early/EarlyHarvester";
import {EarlyUpgrader} from "early/EarlyUpgrader";
import {EarlyWallRepairer} from "early/EarlyWallRepairer";
import {Tower} from "Tower";
import {ErrorMapper} from "utils/ErrorMapper";


// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    // console.log(`Current game tick is ${Game.time}`);

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


    function spawn(role: CreepRole, availableBlocksOfHundred: number) {
      // MOVE,	50
      // CARRY,	50
      // WORK,	100
      let usedBlocksOfHundred = 0;
      const modules: BodyPartConstant[] = [];
      while (usedBlocksOfHundred < availableBlocksOfHundred) {
        if (usedBlocksOfHundred % 2 === 0) {
          modules.push(MOVE, CARRY)
        } else {
          modules.push(WORK)
        }
        usedBlocksOfHundred++;
      }

      const newName = `${role.toString()[0]}_${Game.time % 100}`;
      console.log(`Spawning new ${role}: ${newName}`);
      Game.spawns.Spawn1.spawnCreep(modules, newName,
        {memory: {role, room: '0', working: false, creationTime: Game.time}});
    }


    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      const startupPhase = Game.spawns.Spawn1.room.energyCapacityAvailable <= 1000;

      const minHarvesters = startupPhase ? 5 : 3;
      const minBuilders = startupPhase ? 7 : 3;
      const minUpgraders = room.controller !== null && room.controller!!.ticksToDowngrade < 15000 ? 1 : 0;
      const minWallRepairers = 1;

      const maxNumberOfBlocksOfHundred = Math.floor(Game.spawns.Spawn1.room.energyCapacityAvailable / 100);
      const currentNumberOfBlocksOfHundred = Math.floor(Game.spawns.Spawn1.room.energyAvailable / 100);
      if (currentNumberOfBlocksOfHundred > 10 || maxNumberOfBlocksOfHundred === currentNumberOfBlocksOfHundred || (Object.keys(Game.creeps).length <= 6 && currentNumberOfBlocksOfHundred >= 2)) {
        if (harvesters.length < minHarvesters) {
          spawn(CreepRole.Harvester, currentNumberOfBlocksOfHundred)
        } else if (upgraders.length < minUpgraders) {
          spawn(CreepRole.Upgrader, currentNumberOfBlocksOfHundred);
        } else if (builders.length < minBuilders) {
          spawn(CreepRole.Builder, currentNumberOfBlocksOfHundred);
        } else if (wallrepairers.length < minWallRepairers) {
          spawn(CreepRole.WallRepairer, currentNumberOfBlocksOfHundred);
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
        filter: structure => structure.structureType === STRUCTURE_TOWER && structure.energy > 9
      });
      towers.forEach(tower => Tower.run(tower as StructureTower));
    }

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
    }
  })
;
