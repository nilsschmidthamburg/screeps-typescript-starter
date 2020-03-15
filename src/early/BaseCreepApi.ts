export class BaseCreepApi {

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

    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source != null) {
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        // console.log(creep.name + ": Source not in range. Walking towards source: " + source.id);
        creep.moveTo(source, {visualizePathStyle: {stroke: '#0000ff'}});
      }
    } else {
      // FIXME First look for Tombstones!!
      // const tombstones = creep.pos.findClosestByPath(FIND_TOMBSTONES);

      const nonEmptyContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure =>
          structure.structureType === STRUCTURE_CONTAINER && structure.store.energy > creep.store.getFreeCapacity()
      }) as StructureContainer;
      if (nonEmptyContainer !== null) {
        if (creep.withdraw(nonEmptyContainer, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(), nonEmptyContainer.store.energy)) === ERR_NOT_IN_RANGE) {
          creep.moveTo(nonEmptyContainer, {visualizePathStyle: {stroke: '#0000ff'}});
        }
      } else {
        console.log(creep.name + ": No active source left. And container is also empty. Dont know what to do.")
      }
    }
  }

  public static upgradeRoomController(creep: Creep) {
    if (creep.upgradeController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller!, {visualizePathStyle: {stroke: '#ffffff'}});
    }
  }
}
