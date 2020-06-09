import { TOOLTYPES, TXEVENTS } from '../../const'
import WWWC from './wwwc';

const tools = {
  [TOOLTYPES.WWWC]: WWWC
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
  }
  initEvents () {
    this.manager.on([TXEVENTS.TOUCHDOWN, TXEVENTS.TOUCHUP, TXEVENTS.TAP, TXEVENTS.TOUCHMOVE], (e) => {
      this.activeTools.forEach(tool => {
        let action = this.getAction(e.eventName);
        tool[action] && tool[action](e)
      });
    });
  }
  getAction (eventName) {
    return eventName.toLocaleLowerCase().replace('tx_', '');
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