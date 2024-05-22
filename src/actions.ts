import { ModuleInstance } from './main'

export function updateActions(instance: ModuleInstance) {
    const irisSteps = getIrisSteps(instance);

    instance.setActionDefinitions({
        customXML: {
            name: 'Custom XML',
            options: [
                {
                    id: 'xml',
                    type: 'textinput',
                    label: 'XML',
                    default: ''
                },
            ],
            callback: async (event) => {
                const xml = event.options.xml?.toString();
                if (!xml) return;
                instance.p2Connection?.sendP2Control(xml);
            },
        },

        set_tally: {
            name: 'Set Tally',
            options: [
                {
                    id: 'color',
                    type: 'dropdown',
                    label: 'Color',
                    choices: [
                        { id: 'RED', label: 'Red' },
                        { id: 'GREEN', label: 'Green' },
                    ],
                    default: 'RED'
                },
                {
                    id: 'state',
                    type: 'dropdown',
                    label: 'State',
                    choices: [
                        { id: 'ON', label: 'On' },
                        { id: 'OFF', label: 'Off' },
                    ],
                    default: 'ON'
                },
            ],
            callback: async (event) => {
                const color = event.options.color?.toString();
                if (color !== 'RED' && color !== 'GREEN') return;
                instance.p2Connection?.camCtl.setTally(color, event.options.state == 'ON');
            },
        },

        change_masterGain: {
            name: 'Change Master Gain',
            options: [
                {
                    id: 'value',
                    type: 'dropdown',
                    label: 'Relative Value',
                    choices: [
                        { id: 1, label: '+1' },
                        { id: -1, label: '-1' },
                    ],
                    default: 1
                },
            ],
            callback: async (event) => {
                const value = event.options.value;
                if (value !== 1 && value !== -1) return;

                instance.p2Connection?.camCtl.changeMasterGain(value);
            },
        },

        set_irisStep: {
            name: 'Set Iris (Step)',
            options: [
                {
                    id: 'value',
                    type: 'dropdown',
                    label: 'Value',
                    choices: irisSteps.map(step => {
                        return {id: step.value, label: step.label}
                    }),
                    default: irisSteps?.[0]?.value
                }
            ],
            callback: async (event) => {
                const value = event.options.value;
                if (typeof value !== 'number') return;
                instance.p2Connection?.camCtl.setIris(value);
            },
        },

        change_irisStep: {
            name: 'Change Iris (Step)',
            options: [
                {
                    id: 'direction',
                    type: 'dropdown',
                    label: 'Direction',
                    choices: [
                        { id: 1, label: '+' },
                        { id: -1, label: '-' },
                    ],
                    default: 1
                },
            ],
            callback: async (event) => {
                const direction = event.options.direction;
                if (typeof direction !== 'number') return;

                const currentStep = getCurrentIrisStep(instance, irisSteps);
                const index = irisSteps.findIndex(step => step === currentStep);
                const nextIndex = Math.max(Math.min(index + direction, irisSteps.length-1), 0);
                const nextStep = irisSteps[nextIndex];
                instance.log('debug', JSON.stringify({index, nextIndex, nextStep, irisSteps}));
                instance.p2Connection?.camCtl.setIris(nextStep.value);
            },
        },

        set_iris: {
            name: 'Set Iris (Stepless)',
            options: [
                {
                    id: 'value',
                    type: 'number',
                    label: 'Value',
                    default: 1,
                    min: 0,
                    max: 100000
                }
            ],
            callback: async (event) => {
                const value = event.options.value;
                if (typeof value !== 'number') return;
                instance.p2Connection?.camCtl.setIris(value);
            },
        
        },

        change_iris: {
            name: 'Change Iris (Stepless)',
            options: [
                {
                    id: 'value',
                    type: 'number',
                    label: 'Relative Value',
                    default: 100,
                    min: -100000,
                    max: 100000
                }
            ],
            callback: async (event) => {
                const value = event.options.value;
                if (typeof value !== 'number') return;
                let iris = instance.p2Connection?.getCameraState()?.iris;
                if (!iris) return; 
                iris = Math.max(Math.max(0, (iris + value)), irisSteps[0].value);
                instance.p2Connection?.camCtl.setIris(iris);
            },
        },

        set_whiteBalanceChannel: {
            name: 'Set White Balance Channel',
            options: [
                {
                    id: 'channel',
                    type: 'dropdown',
                    label: 'Channel',
                    choices: [
                        { id: 'A', label: 'A' },
                        { id: 'B', label: 'B' },
                        { id: 'Preset', label: 'Preset' },
                    ],
                    default: 'A'
                },
            ],
            callback: async (event) => {
                const channel = event.options.channel?.toString();
                if (channel !== 'A' && channel !== 'B' && channel !== 'Preset') return;
                instance.p2Connection?.camCtl.setWhiteBalanceChannel(channel);
            },
        },

        set_gain: {
            name: 'Set Gain',
            options: [
                {
                    id: 'color',
                    type: 'dropdown',
                    label: 'Color',
                    choices: [
                        { id: 'R', label: 'Red' },
                        { id: 'B', label: 'Blue' },
                    ],
                    default: 'R'
                },
                {
                    id: 'value',
                    type: 'number',
                    label: 'Value',
                    default: 1,
                    min: -100000,
                    max: 100000
                }
            ],
            callback: async (event) => {
                const color = event.options.color?.toString();
                if (color !== 'R' && color !== 'B') return;
                const value = event.options.value;
                if (typeof value !== 'number') return;
                instance.p2Connection?.camCtl.setGain(color, value);
            },
        },

        change_gain: {
            name: 'Change Gain',
            options: [
                {
                    id: 'color',
                    type: 'dropdown',
                    label: 'Color',
                    choices: [
                        { id: 'R', label: 'Red' },
                        { id: 'B', label: 'Blue' },
                    ],
                    default: 'R'
                },
                {
                    type: "checkbox",
                    id: "useAbsolute",
                    label: "Send absolute instead of relative values",
                    default: false
                },
                {
                    id: 'value',
                    type: 'number',
                    label: 'Relative Value',
                    default: 1,
                    min: -100000,
                    max: 100000
                }
            ],
            callback: async (event) => {
                const color = event.options.color?.toString();
                if (color !== 'R' && color !== 'B') return;
                const value = event.options.value;
                if (typeof value !== 'number') return;
                if (event.options.useAbsolute) {
                    const gain = ((color == 'R' ?
                        instance.p2Connection?.getCameraState()?.redGain
                        : instance.p2Connection?.getCameraState()?.blueGain
                        ) ?? 0) + value;
                    instance.p2Connection?.camCtl.setGain(color, gain);
                } else {
                instance.p2Connection?.camCtl.changeGain(color, value);
                }
            },
        },

        set_pedestal: {
            name: 'Set Pedestal',
            options: [
                {
                    id: 'color',
                    type: 'dropdown',
                    label: 'Color',
                    choices: [
                        { id: 'R', label: 'Red' },
                        { id: 'G', label: 'Green' },
                        { id: 'B', label: 'Blue' },
                    ],
                    default: 'R'
                },
                {
                    id: 'value',
                    type: 'number',
                    label: 'Value',
                    default: 1,
                    min: -100000,
                    max: 100000
                }
            ],
            callback: async (event) => {
                const color = event.options.color?.toString();
                if (color !== 'R' && color !== 'G' && color !== 'B') return;
                const value = event.options.value;
                if (typeof value !== 'number') return;
                instance.p2Connection?.camCtl.setPedestal(color, value);
            },
        },

        change_pedestal: {
            name: 'Change Pedestal',
            options: [
                {
                    id: 'color',
                    type: 'dropdown',
                    label: 'Color',
                    choices: [
                        { id: 'R', label: 'Red' },
                        { id: 'B', label: 'Blue' },
                    ],
                    default: 'R'
                },
                {
                    id: 'value',
                    type: 'number',
                    label: 'Relative Value',
                    default: 1,
                    min: -100000,
                    max: 100000
                }
            ],
            callback: async (event) => {
                const color = event.options.color?.toString();
                if (color !== 'R' && color !== 'G' && color !== 'B') return;
                const value = event.options.value;
                if (typeof value !== 'number') return;
                instance.p2Connection?.camCtl.setPedestal(color, value);
            },
        },

        set_screenOverlayDisplay: {
            name: 'Set Screen Overlay Display',
            options: [
                {
                    id: 'output',
                    type: 'dropdown',
                    label: 'Output',
                    choices: [
                        { id: 1, label: 'Out 1' },
                        { id: 2, label: 'Out 2' },
                    ],
                    default: 1
                },
                {
                    id: 'state',
                    type: 'dropdown',
                    label: 'State',
                    choices: [
                        { id: 'ON', label: 'On' },
                        { id: 'OFF', label: 'Off' },
                        { id: 'TOGGLE', label: 'Toggle' },
                    ],
                    default: 'TOGGLE'
                },
            ],
            callback: async (event) => {
                const output = event.options.output;
                if (output !== 1 && output !== 2) return;
                const state = event.options.state;

                if (state === 'TOGGLE') {
                    instance.p2Connection?.camCtl.toggleScreenOverlayDisplay(output);
                    return;
                }

                instance.p2Connection?.camCtl.setScreenOverlayDisplay(output, state == 'ON');
            },
        },

        set_menu: {
            name: 'Set Menu',
            options: [
                {
                    id: 'state',
                    type: 'dropdown',
                    label: 'State',
                    choices: [
                        { id: 'ON', label: 'On' },
                        { id: 'OFF', label: 'Off' },
                        { id: 'TOGGLE', label: 'Toggle' },
                    ],
                    default: 'TOGGLE'
                },
            ],
            callback: async (event) => {
                const state = event.options.state;

                if (state === 'TOGGLE') {
                    instance.p2Connection?.camCtl.toggleMenu();
                    return;
                }

                instance.p2Connection?.camCtl.setMenu(state == 'ON');
            },
        },

        send_menuCommand: {
            name: 'Send Menu Command',
            options: [
                {
                    id: 'command',
                    type: 'dropdown',
                    label: 'Command',
                    choices: [
                        { id: 'UP', label: 'Up' },
                        { id: 'DOWN', label: 'Down' },
                        { id: 'LEFT', label: 'Left' },
                        { id: 'RIGHT', label: 'Right' },
                        { id: 'SET', label: 'Set' },
                        { id: 'EXIT', label: 'Exit' },
                    ],
                    default: 'UP'
                },
            ],
            callback: async (event) => {
                const command = event.options.command?.toString();
                if (command !== 'UP' && command !== 'DOWN' && command !== 'LEFT' && command !== 'RIGHT' && command !== 'SET' && command !== 'EXIT') return;
                instance.p2Connection?.camCtl.sendMenuCommand(command);
            },
        },

        change_focus: {
            name: 'Change Focus',
            options: [
                {
                    id: 'value',
                    type: 'dropdown',
                    label: 'Relative Value',
                    choices: [
                        { id: 1, label: '+1' },
                        { id: -1, label: '-1' },
                    ],
                    default: 1
                },
            ],
            callback: async (event) => {
                const value = event.options.value;
                if (value !== 1 && value !== -1) return;

                instance.p2Connection?.camCtl.changeFocus(value);
            },
        },

        change_zoom: {
            name: 'Change Zoom',
            options: [
                {
                    id: 'value',
                    type: 'dropdown',
                    label: 'Relative Value',
                    choices: [
                        { id: 1, label: '+1' },
                        { id: -1, label: '-1' },
                    ],
                    default: 1
                },
            ],
            callback: async (event) => {
                const value = event.options.value;
                if (value !== 1 && value !== -1) return;

                instance.p2Connection?.camCtl.changeZoom(value);
            },
        },

        set_focusSpeed: {
            name: 'Set Focus Speed',
            options: [
                {
                    id: 'value',
                    type: 'number',
                    label: 'Speed',
                    default: 1,
                    min: -100000,
                    max: 100000
                }
            ],
            callback: async (event) => {
                const value = event.options.value;
                if (typeof value !== 'number') return;
                instance.p2Connection?.camCtl.setFocusSpeed(value);
            },
        },

        set_zoomSpeed: {
            name: 'Set Zoom Speed',
            options: [
                {
                    id: 'value',
                    type: 'number',
                    label: 'Speed',
                    default: 1,
                    min: -100000,
                    max: 100000
                }
            ],
            callback: async (event) => {
                const value = event.options.value;
                if (typeof value !== 'number') return;
                instance.p2Connection?.camCtl.setZoomSpeed(value);
            },
        },
    })
}

function getIrisSteps(instance: ModuleInstance): IrisStep[] {
    const stepsString = instance.getConfig()?.irisSteps
    const steps = stepsString?.split(';').map(stepString => {
        const [label, value] = stepString.split(':');
        return {label, value: parseInt(value)};
    });

    return steps ?? [];
}

function getCurrentIrisStep(instance: ModuleInstance, irisSteps: IrisStep[]): IrisStep|null {
    const iris = instance.p2Connection?.getCameraState()?.iris;
    if (!iris) return null;

    return irisSteps.reduce((a, b) => {
        return Math.abs(b.value - iris) < Math.abs(a.value - iris) ? b : a;
    });
}

interface IrisStep {
    label: string;
    value: number;
}