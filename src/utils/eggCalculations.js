const EGGS_PER_TRAY = 30;

export function eggsToTrays(eggs) {
  return Math.floor(eggs / EGGS_PER_TRAY);
}

export function traysToEggs(trays) {
  return trays * EGGS_PER_TRAY;
}

export function remainingEggs(eggs) {
  return eggs % EGGS_PER_TRAY;
}