import { Unit } from '../types';

const OZ_TO_LITERS = 0.0295735;
const LITERS_TO_OZ = 33.814;

export function ozToLiters(oz: number): number {
  return oz * OZ_TO_LITERS;
}

export function litersToOz(liters: number): number {
  return liters * LITERS_TO_OZ;
}

export function convertVolume(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  if (from === 'oz' && to === 'l') return ozToLiters(value);
  return litersToOz(value);
}

export function formatVolume(volumeOz: number, unit: Unit, decimals: number = 1): string {
  const value = unit === 'l' ? ozToLiters(volumeOz) : volumeOz;
  return value.toFixed(decimals);
}

export function getUnitLabel(unit: Unit): string {
  return unit === 'oz' ? 'oz' : 'L';
}
