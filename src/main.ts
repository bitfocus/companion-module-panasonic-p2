import { CompanionVariableDefinition, InstanceBase, Regex, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base';
import { updateActions } from './actions';
import { Config } from './config';
import { P2CameraState, P2CameraConnection, P2OpticalState } from 'p2-camera-connection';
import { initCameraVariables, initOpticalVariables, updateCameraVariables, updateOpticalVariables } from './variables';

export class ModuleInstance extends InstanceBase<Config> {
    private config: Config | null = null;
    public p2Connection: P2CameraConnection | null = null;
    
    public opticalVariables: CompanionVariableDefinition[] = [];
    public cameraVariables: CompanionVariableDefinition[] = [];

    private opticalVariablesInitialized: boolean = false;
    private cameraVariablesInitialized: boolean = false;

	async init(config: Config) {
		this.config = config;

		this.updateStatus(InstanceStatus.Disconnected);
		this.updateActions();
        this.connect();
	}

	// When module gets deleted
	async destroy() {
        this.p2Connection?.disconnect();
	}

	async configUpdated(config: Config) {
        const reconnect = !this.config || config.host !== this.config.host || config.port !== this.config.port || config.username !== this.config?.username || config.password !== this.config?.password;
		
        this.config = config;

        if (reconnect) {
            this.connect();
        }
	}

    private connect() {
        if (!this.config?.host || !this.config.port || !this.config.username || !this.config.password) {
            this.updateStatus(InstanceStatus.BadConfig);
            return;
        }

        this.p2Connection = new P2CameraConnection(this.config.host, this.config.port, this.config.username, this.config.password);
        
        this.p2Connection.on('connecting', () => {
            this.updateStatus(InstanceStatus.Connecting);
        });

        this.p2Connection.on('connected', () => {
            this.updateStatus(InstanceStatus.Ok);
        });

        this.p2Connection.on('disconnected', () => {
            this.updateStatus(InstanceStatus.Disconnected);
        });

        this.p2Connection.on('debug', (message) => {
		    this.log('debug', message);
        });

        this.p2Connection.on('log', (message) => {
		    this.log('info', message);
        });

        this.p2Connection.on('error', (message) => {
		    this.log('error', message);
            this.updateStatus(InstanceStatus.UnknownError);
        });

        this.p2Connection.on('opticalState', (state) => {
            this.onOpticalState(state);
        });

        this.p2Connection.on('cameraState', (state) => {
            this.onCameraState(state);
        });

        this.p2Connection.connect();
    }

    onOpticalState(state: P2OpticalState) {
        if (!this.opticalVariablesInitialized) {
            initOpticalVariables(this, state);
            this.opticalVariablesInitialized = true;
        }

        updateOpticalVariables(this, state);
    }

    onCameraState(state: P2CameraState) {
        if (!this.cameraVariablesInitialized) {
            initCameraVariables(this, state);
            this.cameraVariablesInitialized = true;
        }

        updateCameraVariables(this, state);
    }

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return [
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
				type: 'textinput',
				id: 'irisSteps',
				label: 'Iris Steps',
				width: 4,
                default: '2.8:2970;3:3150;3.2:3350;3.4:3550;3.6:3700;3.8:3850;4:4000;4.2:4150;4.5:4350;4.8:4550;5:4650;5.3:4800;5.6:5000;6:5150;6.4:5350;6.8:5550;7.2:5700;7.6:5850;8:6000;8.5:6200;9:6450;9,6:6550;10:6650;11:6900;CLOSE:8174'
			},
		]
	}

    getConfig() {
        return this.config;
    }

	updateActions() {
		updateActions(this)
	}
}

runEntrypoint(ModuleInstance, [])
