export class BaseCreepApi {

  public static setWorkingInMemory(creep: Creep) {
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.working = false;
      creep.say('🔄 harvest');
    }
    if ((!creep.memory.working && creep.store.getFreeCapacity() === 0) || (creep.store.energy > 1 && creep.room.find(FIND_SOURCES_ACTIVE).length === 0)) {
      creep.memory.working = true;
      creep.say('No harvest, start work');
    }
  }

  public static goToRoom(creep: Creep, roomName: string) {
    const findExit = creep.room.findExitTo(roomName);
    if (findExit !== ERR_NO_PATH && findExit !== ERR_INVALID_ARGS) {
      const exit = creep.pos.findClosestByPath(findExit);
      if (exit !== null) {
        creep.moveTo(exit, {visualizePathStyle: {stroke: '#FFFFFF'}})
        return;
      }
    }
    console.log(`${creep.name}: ERROR -> No Exit found to room '${roomName}'`);
  }

  public static somethingToBuild(creep: Creep) {
    const site = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
    if (site != null) {
      if (creep.build(site) === ERR_NOT_IN_RANGE) {
        creep.moveTo(site, {visualizePathStyle: {stroke: '#ffffff'}});
      }
      return true;
    }
    return false;
  }

  // FIXME Start only if hit points are below half. But once we started the repair we should repair to full energy!)
  public static somethingToRepair(creep: Creep, structureType: (FIND_MY_STRUCTURES | FIND_STRUCTURES), filter: (s: Structure) => boolean) {
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

  public static someRoadToRepair(creep: Creep) {
    return this.somethingToRepair(creep, FIND_STRUCTURES, (it) => it.structureType === STRUCTURE_ROAD && it.hits <= 30000 && (it.hits < it.hitsMax - 100))
  }

  public static harvestOrGotoSource(creep: Creep) {
    // About to die?
    if (creep.ticksToLive !== undefined && creep.ticksToLive < 50) {
      const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure =>
          structure.structureType === STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 100
      });
      if (container !== null) {
        creep.moveTo(container, {visualizePathStyle: {stroke: '#ff0000'}});
        return;
      }
    }

    // Not everyone should go for the Tombstones / Energies laying around
    if (creep.memory.creationTime % 3 === 0) {
      const tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: (t) => t.store.energy > 50 || (t.store.energy > 0 && t.pos.getRangeTo(creep) <= 2)
      });
      if (tombstone !== null) {
        if (creep.withdraw(tombstone, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(), tombstone.store.energy)) === ERR_NOT_IN_RANGE) {
          creep.moveTo(tombstone, {visualizePathStyle: {stroke: '#ffff00'}});
        }
        return;
      }
      const freeEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: (r) => r.resourceType == RESOURCE_ENERGY && r.amount > 50 || (r.amount > 0 && r.pos.getRangeTo(creep) <= 2)
      });
      if (freeEnergy !== null) {
        if (creep.pickup(freeEnergy) === ERR_NOT_IN_RANGE) {
          creep.moveTo(freeEnergy, {visualizePathStyle: {stroke: '#ffff00'}});
        }
        return;
      }
    }

    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source != null) {
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        // console.log(creep.name + ": Source not in range. Walking towards source: " + source.id);
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffff00'}});
      }
      return;
    }

    const nonEmptyContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure =>
        structure.structureType === STRUCTURE_CONTAINER && structure.store.energy > creep.store.getFreeCapacity()
    }) as StructureContainer;
    if (nonEmptyContainer !== null) {
      if (creep.withdraw(nonEmptyContainer, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(), nonEmptyContainer.store.energy)) === ERR_NOT_IN_RANGE) {
        creep.moveTo(nonEmptyContainer, {visualizePathStyle: {stroke: '#ffff00'}});
      }
      return;
    }

    console.log(creep.name + ": No active source left. And container is also empty. Dont know what to do.")
  }


  public static upgradeRoomController(creep: Creep) {
    if (creep.upgradeController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller!, {visualizePathStyle: {stroke: '#ffffff'}});
    }
  }
}
