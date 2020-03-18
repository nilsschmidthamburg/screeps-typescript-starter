// example declaration file - remove these and add your own custom typings

// memory extension samples

interface CreepMemory {
  role: CreepRole;
  homeRoom: string;
  destinationRoom: string;
  working: boolean;
  creationTime: number;
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}

declare const enum CreepRole {
  Harvester = "Harvester",
  Builder = "Builder",
  Upgrader = "Upgrader",
  WallRepairer = "WallRepairer",
  LongDistanceHarvester = "LongDistanceHarvester",
  Invader = "Invader",
}


