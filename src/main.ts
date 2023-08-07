import plugin from "../plugin.json";
import { KEY_SHORTCUT, VOLUME_BTN } from "./constant";

declare var ace: any;

const appSettings = acode.require("settings");
const HashHandler = ace.require("ace/keyboard/hash_handler").HashHandler;

class FontZoomer {
    public baseUrl: string | undefined;
    private increaseFontHandler = new HashHandler();
    private decreaseFontHandler = new HashHandler();

    constructor() {
        if (!appSettings.value[plugin.id]) {
            appSettings.value[plugin.id] = {
                fontsizeChangingMode: KEY_SHORTCUT,
            };
            appSettings.update(false);
        }
    }

    async init(
        $page: WCPage,
        cacheFile: any,
        cacheFileUrl: string
    ): Promise<void> {
        try {
            if (this.settings.fontsizeChangingMode === KEY_SHORTCUT) {
                this.removeEvents();
                this.addCommands();
            } else if (this.settings.fontsizeChangingMode === VOLUME_BTN) {
                this.removeCommands();
                this.addEvents();
            }
        } catch (error: any) {
            window.toast(error, 3000);
        }
    }

    private addCommands(): void {
        const commands = this.commands;
        this.increaseFontHandler.addCommand(commands.increaseFont);
        this.decreaseFontHandler.addCommand(commands.decreaseFont);
        editorManager.editor.keyBinding.addKeyboardHandler(
            this.increaseFontHandler
        );
        editorManager.editor.keyBinding.addKeyboardHandler(
            this.decreaseFontHandler
        );
    }

    private addEvents(): void {
        document.addEventListener(
            "volumeupbutton",
            this.increaseFont.bind(this)
        );
        document.addEventListener(
            "volumedownbutton",
            this.decreaseFont.bind(this)
        );
    }

    private removeCommands(): void {
        const commands = this.commands;
        this.increaseFontHandler.removeCommand(commands.increaseFont);
        this.decreaseFontHandler.removeCommand(commands.decreaseFont);
        editorManager.editor.keyBinding.removeKeyboardHandler(
            this.increaseFontHandler
        );
        editorManager.editor.keyBinding.removeKeyboardHandler(
            this.decreaseFontHandler
        );
    }

    private removeEvents(): void {
        document.removeEventListener(
            "volumeupbutton",
            this.increaseFont.bind(this)
        );
        document.removeEventListener(
            "volumedownbutton",
            this.decreaseFont.bind(this)
        );
    }

    private increaseFont(): void {
        try {
            const element: HTMLElement = editorManager.editor.container;
            const font_size: string = window
                .getComputedStyle(element, null)
                .getPropertyValue("font-size");
            let size: string = `${parseInt(font_size.replace("px", "")) + 1}px`;
            if (size == "70px") return;
            editorManager.editor.container.style.fontSize = size;
            appSettings.value.fontSize = size;
            appSettings.update(false);
        } catch (error: any) {
            window.toast(error, 3000);
        }
    }

    private decreaseFont(): void {
        try {
            const element: HTMLElement = editorManager.editor.container;
            const font_size: string = window
                .getComputedStyle(element, null)
                .getPropertyValue("font-size");
            let size: string = `${parseInt(font_size.replace("px", "")) - 1}px`;
            if (size == "8px") return;
            editorManager.editor.container.style.fontSize = size;
            appSettings.value.fontSize = size;
            appSettings.update(false);
        } catch (error: any) {
            window.toast(error, 3000);
        }
    }

    private get commands() {
        return {
            increaseFont: {
                name: "increaseFont",
                bindKey: "Ctrl-+",
                exec: this.increaseFont.bind(this),
                readOnly: true,
            },
            decreaseFont: {
                name: "decreaseFont",
                bindKey: "Ctrl-_",
                exec: this.decreaseFont.bind(this),
                readOnly: true,
            },
        };
    }

    public get settingsObj() {
        return {
            list: [
                {
                    key: "fontsizeChangingMode",
                    text: "FontSize Changing Mode",
                    value: this.settings.fontsizeChangingMode,
                    select: [KEY_SHORTCUT, VOLUME_BTN],
                },
            ],
            cb: (key: string, value: string) => {
                this.settings[key] = value;
                appSettings.update();
                if (this.settings.fontsizeChangingMode === KEY_SHORTCUT) {
                    this.removeEvents();
                    this.addCommands();
                } else if (this.settings.fontsizeChangingMode === VOLUME_BTN) {
                    this.removeCommands();
                    this.addEvents();
                }
            },
        };
    }

    private get settings() {
        return appSettings.value[plugin.id];
    }

    async destroy(): Promise<void> {
        this.removeCommands();
        this.removeEvents();
    }
}

if (window.acode) {
    const acodePlugin = new FontZoomer();
    acode.setPluginInit(
        plugin.id,
        async (
            baseUrl: string,
            $page: WCPage,
            { cacheFileUrl, cacheFile }: any
        ) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            acodePlugin.baseUrl = baseUrl;
            await acodePlugin.init($page, cacheFile, cacheFileUrl);
        },
        acodePlugin.settingsObj
    );
    acode.setPluginUnmount(plugin.id, () => {
        acodePlugin.destroy();
    });
}
