export default class Time {
  constructor(private value: string) { }

  public dimension(): string|null {
    switch (this.value.length) {
      case  4: return 'YEAR'
      case  7: return 'MONTH'
      case 10: return 'DATE'
      case 13: return 'HOUR'
      case 16: return 'MINUTE'
      default: return null
    }
  }
}
