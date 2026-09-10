const ATOMIC_UNITS_PER_XMR = 1_000_000_000_000n;

export function atomicUnitsToXmr(amount: bigint):string {
  const whole = amount / ATOMIC_UNITS_PER_XMR;
  const fraction = amount % ATOMIC_UNITS_PER_XMR;
  const decimal = fraction.toString().padStart(12, "0").replace(/0+$/, "");
  if (decimal === "") {
    return whole.toString();
  }
  const number = `${whole.toString()}.${decimal}`;
  return number;
}

export function isValidHash(value: string): boolean {
  const hashPattern = /^[0-9a-fA-F]{64}$/;
  return hashPattern.test(value);
}

export function parseBlockHeight(value: string):number | undefined {
  if (value.trim() === "") {
    return undefined;
  }
  const height = Number(value);
  if (!Number.isInteger(height) || height < 0) {
    return undefined;
  }
  return height;
}


