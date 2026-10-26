/**
 * FILE GUIDE: Helpers for looking up patient information from app state.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

// patientOf: reusable function/value declared for use in this module.
export const patientOf = (s, id) => ((s.users || {})[id] || {}).me || {};

// nameOf: reusable function/value declared for use in this module.
export const nameOf = (s, id) => patientOf(s, id).name || id;

// lmpOf: reusable function/value declared for use in this module.
export const lmpOf = (s, id) => patientOf(s, id).lmp;
