/* globals
canvas,
game
*/
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */
"use strict";

import { Settings as ModuleSettings } from "./settings.js";
import { Patcher } from "./Patcher.js";

import { PATCHES as PATCHES_MeasuredTemplate } from "./MeasuredTemplate.js";
import { PATCHES as PATCHES_MeasuredTemplateConfig } from "./MeasuredTemplateConfig.js";
import { PATCHES as PATCHES_Token } from "./Token.js";
import { PATCHES as PATCHES_Wall } from "./Wall.js";
import { PATCHES_dnd5e } from "./dnd5e.js";
import { PATCHES as PATCHES_ActiveEffect } from "./ActiveEffect.js";
import { PATCHES as PATCHES_ClientSettings } from "./ModuleSettingsAbstract.js";


// Settings
import { PATCHES as PATCHES_Settings } from "./ModuleSettingsAbstract.js";

export const PATCHES = {
  ActiveEffect: PATCHES_ActiveEffect,
  ClientSettings: PATCHES_ClientSettings,
  MeasuredTemplate: PATCHES_MeasuredTemplate,
  MeasuredTemplateConfig: PATCHES_MeasuredTemplateConfig,
  Token: PATCHES_Token,
  Wall: PATCHES_Wall,
  dnd5e: PATCHES_dnd5e // Only works b/c these are all hooks. Otherwise, would need class breakdown.
};

export const PATCHER = new Patcher();
PATCHER.addPatchesFromRegistrationObject(PATCHES);

export function initializePatching() {
  PATCHER.registerGroup("BASIC");
  PATCHER.registerGroup(game.system.id);
}

/**
 * Register the autotargeting patches. Must be done after settings are enabled.
 */
export function registerAutotargeting() {
  const autotarget = ModuleSettings.get(ModuleSettings.KEYS.AUTOTARGET.MENU) !== ModuleSettings.KEYS.AUTOTARGET.CHOICES.NO;

  // Disable existing targeting before completely removing autotarget patches
  if ( PATCHER.groupIsRegistered("AUTOTARGET") && !autotarget ) {
    canvas.templates.placeables.forEach(t => t.autotargetTokens());
  }

  PATCHER.deregisterGroup("AUTOTARGET");
  if ( autotarget ) { PATCHER.registerGroup("AUTOTARGET"); }

  // Redraw the toggle button.
  if ( canvas.templates.active
    && ui.controls ) ui.controls.initialize({layer: canvas.templates.constructor.layerOptions.name});
}
