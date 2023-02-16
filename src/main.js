import plugin from '../plugin.json';

const appSettings = acode.require('settings');

class FontZoomer {
    KEY_SHORTCUT="Key Shortcut"
    VOLUME_BTN="Volume Button"
    constructor() {
        if (!appSettings.value[plugin.id]) {
          appSettings.value[plugin.id] = {
            fontsizeChangingMode: this.KEY_SHORTCUT,
          };
          appSettings.update(false);
        }
    }
    
    async init() {
        try{
            if (this.settings.fontsizeChangingMode === this.KEY_SHORTCUT) {
                this.removeEvents();
                this.addCommands();
            } else if(this.settings.fontsizeChangingMode === this.VOLUME_BTN){
                this.removeCommands();
                this.addEvents();
            }
        }catch(err){
            window.toast(err,3000)
        }
    }
    
    addCommands(){
        editorManager.editor.commands.addCommand({
            name: "fontzoomer:increase_font",
            description: "Increase Font",
            bindKey: {win: 'Shift-+',  mac: 'Shift-+'},
            exec: this.increaseFont.bind(this)
        });
        editorManager.editor.commands.addCommand({
            name: "fontzoomer:decrease_font",
            description: "Decrease Font",
            bindKey: {win: 'Shift--',  mac: 'Shift--'},
            exec: this.decreaseFont.bind(this)
        });
    }
    
    addEvents(){
        document.addEventListener("volumeupbutton", this.increaseFont.bind(this));
        document.addEventListener("volumedownbutton", this.decreaseFont.bind(this));
    }
    
    removeCommands(){
        editorManager.editor.commands.removeCommand("fontzoomer:increase_font");
        editorManager.editor.commands.removeCommand("fontzoomer:decrease_font");
    }
    
    removeEvents(){
        document.removeEventListener("volumeupbutton",this.increaseFont.bind(this));
        document.removeEventListener("volumedownbutton",this.decreaseFont.bind(this));
    }
    
    increaseFont(){
        try{
            const element = editorManager.editor.container;
            const font_size = window.getComputedStyle(element, null).getPropertyValue("font-size");
            let size = `${parseInt(font_size.replace("px","")) + 1}px`;
            if(size == "70px"){
                return;
            }
            editorManager.editor.container.style.fontSize = size;
            appSettings.value.fontSize = size;
            appSettings.update(false);
        } catch(err){
            window.toast(err,3000);
        }
    }
    
    decreaseFont(){
        try{
            const element = editorManager.editor.container;
            const font_size = window.getComputedStyle(element, null).getPropertyValue("font-size");
            let size = `${parseInt(font_size.replace("px","")) - 1}px`;
            if(size == "8px"){
                return;
            }
            editorManager.editor.container.style.fontSize = size;
            appSettings.value.fontSize = size;
            appSettings.update(false);
        } catch(err){
            window.toast(err,3000);
        }
    }
    
    get settingsObj() {
        return {
          list: [
            {
              key: 'fontsizeChangingMode',
              text: 'FontSize Changing Mode',
              value: this.settings.fontsizeChangingMode,
              select: [
                this.KEY_SHORTCUT,
                this.VOLUME_BTN,
              ]
            }
          ],
          cb: (key, value) => {
            this.settings[key] = value;
            appSettings.update();
            if (this.settings.fontsizeChangingMode === this.KEY_SHORTCUT) {
                this.removeEvents();
                this.addCommands();
            } else if(this.settings.fontsizeChangingMode === this.VOLUME_BTN){
                this.removeCommands();
                this.addEvents();
            }
          },
        }
    }
    
    get settings() {
        return appSettings.value[plugin.id];
    }
    
    async destroy() {
        this.removeCommands();
        this.removeEvents();
    }
}

if (window.acode) {
    const acodePlugin = new FontZoomer();
    acode.setPluginInit(plugin.id, (baseUrl, $page, {
        cacheFileUrl, cacheFile
    }) => {
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        acodePlugin.baseUrl = baseUrl;
        acodePlugin.init($page, cacheFile, cacheFileUrl);
    },acodePlugin.settingsObj);
    acode.setPluginUnmount(plugin.id, () => {
        acodePlugin.destroy();
    });
}