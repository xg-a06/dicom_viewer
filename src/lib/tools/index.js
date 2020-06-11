import { TOOLTYPES, TXEVENTS } from '../../const'
import WWWC from './wwwc';
import SCALE from './scale';
import MOVE from './move';
import STACKSCROLL from './stackScroll';

const tools = {
  [TOOLTYPES.WWWC]: WWWC,
  [TOOLTYPES.SCALE]: SCALE,
  [TOOLTYPES.MOVE]: MOVE,
  [TOOLTYPES.STACKSCROLL]: STACKSCROLL
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
    this.initEvents();
    this.defaultActivateTools = {
      right: null
    };
  }
  initEvents () {
    this.manager.on([TXEVENTS.TOUCHDOWN, TXEVENTS.TOUCHUP, TXEVENTS.TAP, TXEVENTS.TOUCHMOVE], (e) => {
      this.activeTools.forEach(tool => {
        let action = this.getAction(e.eventName);
        tool[action] && tool[action](e)
      });
    });


    this.manager.on([TXEVENTS.RIGHT_TOUCH_DOWN, TXEVENTS.RIGHT_TOUCH_UP, TXEVENTS.RIGHT_TOUCH_MOVE], (e) => {
      const defaultTool = this.defaultActivateTools.right;
      if (defaultTool) {
        let action = this.getAction(e.eventName);
        defaultTool[action] && defaultTool[action](e)
      }
    });
  }
  getAction (eventName) {
    let tmp = eventName.toLocaleLowerCase().split('_');
    return tmp[tmp.length - 1];
  }
  setDefaultActivateTool (toolType, options) {
    const { shortcutKey } = options;
    const tool = new tools[toolType](options);
    this.defaultActivateTools[shortcutKey] = tool;
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