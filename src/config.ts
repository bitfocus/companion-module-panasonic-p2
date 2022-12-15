import { Regex, SomeCompanionConfigField } from "@companion-module/base";

export interface Config {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    irisSteps?: string;
}

export function getConfigFields(): SomeCompanionConfigField[] {
    return [
        {
            id: 'port-notice',
            type: 'static-text',
            label: '',
            value: '<b>Warning:</b> Due to the way the P2 Protocol works, every camera must have a different port to work with this Companion module. This can be changed in the cameras network config.',
            width: 12
        },
        {
            type: 'textinput',
            id: 'host',
            label: 'Target IP',
            width: 8,
            regex: Regex.IP,
        },
        {
            type: 'textinput',
            id: 'port',
            label: 'P2 TCP Port',
            width: 4,
            regex: Regex.PORT,
        },
        {
            type: 'textinput',
            id: 'username',
            label: 'Username',
            width: 4,
        },
        {
            type: 'textinput',
            id: 'password',
            label: 'Password',
            width: 4,
        },
        {
            id: 'iris-notice',
            type: 'static-text',
            label: 'Iris Steps',
            value: 'For the Action "Change Iris (Step)" to work, you have to manually set the control value for every Iris Step. Every step has a label(which isn\'t currently used), then a colon and then the iris control value. All steps are seperated by semicolons. The current iris control value can be read from the variable $(Panasonic-P2:camera.iris)',
            width: 12
        },
        {
            type: 'textinput',
            id: 'irisSteps',
            label: 'Iris Steps',
            width: 12,
            default: '2.8:2970;3:3150;3.2:3350;3.4:3550;3.6:3700;3.8:3850;4:4000;4.2:4150;4.5:4350;4.8:4550;5:4650;5.3:4800;5.6:5000;6:5150;6.4:5350;6.8:5550;7.2:5700;7.6:5850;8:6000;8.5:6200;9:6450;9,6:6550;10:6650;11:6900;CLOSE:8174'
        }
    ];
}