/* globals
canvas,
CONFIG,
PIXI,
renderTemplate
*/
"use strict";

import { log, constructTabElement, constructTabDivision } from "./util.js";
import { MODULE_ID, FLAGS, LABELS, TEMPLATES } from "./const.js";
import { Settings } from "./settings.js";

export const PATCHES_dnd5e = {};
PATCHES_dnd5e.dnd5e = {};

// ----- NOTE: Hooks ----- //

/**
 * Hook renderItemSheet5e to add template configuration options for spells.
 * @param {ItemSheet5e} sheet
 * @param {Object} html
 * @param {Object} data
 */
function renderItemSheet5eHook(app, html, data) {
  const type = data.item?.type;
  if ( !(type === "spell" || type === "feat") ) return;
  render5eSpellTemplateConfig(app, html, data);
}

/**
 * Given a template, add configuration from the attached item, if any.
 * Called in the drawMeasuredTemplate hook. At that point, the template may not have an id.
 * @param {AbilityTemplate} template    Template created from item in dnd5e
 */
export function addDnd5eItemConfigurationToTemplate(template) {
  const item = template.item;
  if ( !item ) return;

  // Constants
  const templateD = template.document;
  const shape = templateD.t;

  // Determine wall settings, falling back to global defaults.
  let wallsBlock = item.getFlag(MODULE_ID, FLAGS.WALLS_BLOCK);
  let wallRestriction = item.getFlag(MODULE_ID, FLAGS.WALL_RESTRICTION);
  if ( !wallsBlock
    || wallsBlock === LABELS.GLOBAL_DEFAULT ) wallsBlock = Settings.get(Settings.KEYS.DEFAULT_WALLS_BLOCK[shape]);
  if ( !wallRestriction || wallRestriction === LABELS.GLOBAL_DEFAULT ) {
    wallRestriction = Settings.get(Settings.KEYS.DEFAULT_WALL_RESTRICTION[shape]);
  }

  // Determine autotargeting, falling back to global.
  const noAutotarget = item.getFlag(MODULE_ID, FLAGS.NO_AUTOTARGET) ?? false;

  // Determine hide settings, falling back to global defaults.
  const hideBorder = item.getFlag(MODULE_ID, FLAGS.HIDE.BORDER) ?? LABELS.GLOBAL_DEFAULT;
  const hideHighlighting = item.getFlag(MODULE_ID, FLAGS.HIDE.HIGHLIGHTING) ?? LABELS.GLOBAL_DEFAULT;
  const showOnHover = item.getFlag(MODULE_ID, FLAGS.HIDE.SHOW_ON_HOVER) ?? LABELS.GLOBAL_DEFAULT;

  // Attach items to the template.
  templateD.updateSource({
    flags: {
      [MODULE_ID]: {
        [FLAGS.WALLS_BLOCK]: wallsBlock,
        [FLAGS.WALL_RESTRICTION]: wallRestriction,
        [FLAGS.NO_AUTOTARGET]: noAutotarget,
        [FLAGS.HIDE.BORDER]: hideBorder,
        [FLAGS.HIDE.HIGHLIGHTING]: hideHighlighting,
        [FLAGS.HIDE.SHOW_ON_HOVER]: showOnHover
      }
    }
  });

  if ( item.getFlag(MODULE_ID, FLAGS.ADD_TOKEN_SIZE) ) {
    // Does the template originate on a token? (Use the first token found.)
    const templateOrigin = new PIXI.Point(templateD.x, templateD.y);
    const token = canvas.tokens.placeables.find(t => templateOrigin.almostEqual(t.center));
    if ( token ) {
      // Add 1/2 token size to the template distance.
      const { width, height } = token.document;
      const size = Math.min(width, height) * canvas.dimensions.distance;
      templateD.updateSource({ distance: templateD.distance + size });
    }
  }
}

/**
 * Hook dnd template creation from item, to attach the caster or target to the template.
 * Must wait until after template preview is done, for at least two reasons:
 * (1) No template id during preview, which breaks attaching.
 * (2) Could cause tokens to move around during preview, which is not good.
 * Other flags set up earlier, with the draw hook.
 */
function dnd5eUseItemHook(item, config, options, templates) {
  log("dnd5e.useItem hook", item);
  if ( !templates || !item ) return;

  // Add item flags to the template(s)
  const attachToken = item.getFlag(MODULE_ID, FLAGS.ATTACHED_TOKEN.SPELL_TEMPLATE);
  if ( !attachToken ) return;
  let token;
  switch ( attachToken ) {
    case "caster": token = item.parent.token ?? item.parent.getActiveTokens()[0]; break;
    case "target": token = options.flags.lastTargeted; break; // tokenId
    default: return;
  }
  templates.forEach(templateD => templateD.object.attachToken(token));
}

PATCHES_dnd5e.dnd5e.HOOKS = {
  renderItemSheet5e: renderItemSheet5eHook,
  ["dnd5e.useItem"]: dnd5eUseItemHook
};

/**
 * Inject html to add controls to the measured template configuration:
 * 1. Switch to have the template be blocked by walls.
 *
 * templates/scene/template-config.html
 */
async function render5eSpellTemplateConfig(app, html, data) {
  const navTabs = html.find(".tabs")[0];
  if ( !navTabs ) return;
  const sheetBodySection = html.find(".sheet-body")[0];
  if ( !sheetBodySection) return;

  // By default, rely on the global settings.
  if (typeof data.document.getFlag(MODULE_ID, FLAGS.WALLS_BLOCK) === "undefined") {
    data.document.setFlag(MODULE_ID, FLAGS.WALLS_BLOCK, LABELS.GLOBAL_DEFAULT);
  }

  if (typeof data.document.getFlag(MODULE_ID, FLAGS.WALL_RESTRICTION) === "undefined") {
    data.document.setFlag(MODULE_ID, FLAGS.WALL_RESTRICTION, LABELS.GLOBAL_DEFAULT);
  }

  // Set variable to know if we are dealing with a template
  const areaType = data.system.target.type;
  data.isTemplate = areaType in CONFIG.DND5E.areaTargetTypes;
  data.walledtemplates = {
    blockoptions: LABELS.SPELL_TEMPLATE.WALLS_BLOCK,
    walloptions: LABELS.SPELL_TEMPLATE.WALL_RESTRICTION,
    attachtokenoptions: LABELS.SPELL_TEMPLATE.ATTACH_TOKEN,
    hideoptions: LABELS.TEMPLATE_HIDE
  };

  const template = TEMPLATES.DND5E;
  const myHTML = await renderTemplate(template, data);

  // Create a new tab entry for the module.
  const newTab = constructTabElement(MODULE_ID, "walledtemplates.MeasuredTemplateConfiguration.LegendTitle");
  navTabs.appendChild(newTab);

  // Construct the new tab div to go with it.
  const tabDiv = constructTabDivision(MODULE_ID, "primary");
  tabDiv.innerHTML = myHTML;
  sheetBodySection.appendChild(tabDiv);
}
