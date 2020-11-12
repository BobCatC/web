module.exports = {
  inputs: {
    deg: {
      type: 'number',
      required: true
    }
  },

  fn: async function ({deg}) {
    if (deg < 22.5 || deg >= 337.5) {
      return 'N';
    }
    if (deg < 67.5) {
      return 'NE';
    }
    if (deg < 112.5) {
      return 'E';
    }
    if (deg < 157.5) {
      return 'SE';
    }
    if (deg < 202.5) {
      return 'S';
    }
    if (deg < 247.5) {
      return 'SW';
    }
    if (deg < 292.5) {
      return 'W';
    }
    return 'NW'
  }
};

