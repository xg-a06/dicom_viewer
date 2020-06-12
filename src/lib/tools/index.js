import { TOOL_TYPES, TX_EVENTS, SHORTCUT_KEYS } from '../../const'
import WWWC from './wwwc';
import SCALE from './scale';
import MOVE from './move';
import STACKSCROLL from './stackScroll';

const tools = {
  [TOOL_TYPES.WWWC]: WWWC,
  [TOOL_TYPES.SCALE]: SCALE,
  [TOOL_TYPES.MOVE]: MOVE,
  [TOOL_TYPES.STACKSCROLL]: STACKSCROLL
}

const baseOptions = {

}

// 快捷键待设计
class ToolsManager {
  constructor(options) {
    this.config = Object.assign({}, baseOptions, options);
    this.manager = this.config.manager;
    this.activeTools = [];
    this.toolsData = []

    this.defaultShortcutKeyTools = {
      [SHORTCUT_KEYS.MIDDLE_BUTTON]: {
        target: null,
        events: [TX_EVENTS.MIDDLE_TOUCHDOWN, TX_EVENTS.MIDDLE_TOUCHUP, TX_EVENTS.MIDDLE_TOUCHMOVE]
      },
      [SHORTCUT_KEYS.RIGHT_BUTTON]: {
        target: null,
        events: [TX_EVENTS.RIGHT_TOUCHDOWN, TX_EVENTS.RIGHT_TOUCHUP, TX_EVENTS.RIGHT_TOUCHMOVE]
      },
      [SHORTCUT_KEYS.PIN]: {
        target: null,
        events: [TX_EVENTS.PIN_TOUCHDOWN, TX_EVENTS.PIN_TOUCHUP, TX_EVENTS.PIN_TOUCHMOVE]
      }
    };

    this.initEvents();
  }
  initEvents () {
    this.manager.on([TX_EVENTS.TOUCHDOWN, TX_EVENTS.TOUCHUP, TX_EVENTS.TAP, TX_EVENTS.TOUCHMOVE], (e) => {
      this.activeTools.forEach(tool => {
        let action = this.getAction(e.eventName);
        tool[action] && tool[action](e)
      });
    });

    Object.entries(this.defaultShortcutKeyTools).forEach(([k, v]) => {
      this.manager.on(v.events, (e) => {
        const defaultTool = v.target;
        if (defaultTool) {
          let action = this.getAction(e.eventName);
          defaultTool[action] && defaultTool[action](e)
        }
      });
    });
  }
  getAction (eventName) {
    let tmp = eventName.toLocaleLowerCase().split('_');
    return tmp[tmp.length - 1];
  }
  setDefaultActivateTool (toolType, options) {
    const { shortcutKey } = options;
    const tool = new tools[toolType](options);
    if (this.defaultShortcutKeyTools[shortcutKey]) {
      this.defaultShortcutKeyTools[shortcutKey].target = tool;
    }
  }
  activateTool (toolType, options = {}) {
    const tool = new tools[toolType](options);
    this.activeTools.push(tool)
  }
  deactivateTool (toolType) {
    this.activeTools = this.activeTools.filter(tool => tool.toolType !== toolType);
  }
  clearToolsData (toolsData = null) {
    if (toolsData) {
      return;
    }
    this.toolsData = []
  }
}

export default ToolsManager;