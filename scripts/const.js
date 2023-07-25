/* globals
duplicate
*/

"use strict";

export const MODULE_ID = "walledtemplates";

export const FLAGS = {
  WALLS_BLOCK: "wallsBlock",
  WALL_RESTRICTION: "wallRestriction",
  RECURSE_DATA: "recurseData"
};

export const LABELS = {
  WALLS_BLOCK: {
    unwalled: "walledtemplates.MeasuredTemplateConfiguration.unwalled",
    walled: "walledtemplates.MeasuredTemplateConfiguration.walled",
    recurse: "walledtemplates.MeasuredTemplateConfiguration.recurse"
  },

  WALL_RESTRICTION: {
    light: "WALLS.Light",
    move: "WALLS.Movement",
    sight: "WALLS.Sight",
    sound: "WALLS.Sound"
  },

  SPELL_TEMPLATE: {},

  GLOBAL_DEFAULT: "globalDefault"
};

LABELS.SPELL_TEMPLATE.WALLS_BLOCK = duplicate(LABELS.WALLS_BLOCK);
LABELS.SPELL_TEMPLATE.WALL_RESTRICTION = duplicate(LABELS.WALL_RESTRICTION);
LABELS.SPELL_TEMPLATE.WALLS_BLOCK.globalDefault = "walledtemplates.MeasuredTemplateConfiguration.globalDefault";
LABELS.SPELL_TEMPLATE.WALL_RESTRICTION.globalDefault = "walledtemplates.MeasuredTemplateConfiguration.globalDefault";
