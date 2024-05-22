import { CompanionVariableDefinition, InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base';
import { updateActions } from './actions';
import { Config, getConfigFields } from './config';
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
        if (!this.config?.host || !this.config.port) {
            this.updateStatus(InstanceStatus.BadConfig);
            return;
        }
        
        this.config.username = this.config?.username ?? '';
        this.config.password = this.config?.password ?? '';

        const udpSocket = this.createSharedUdpSocket("udp4");
        this.p2Connection = new P2CameraConnection(this.config.host, this.config.port, this.config.username, this.config.password, 500, udpSocket);
        
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
        return getConfigFields();
    }

    getConfig() {
        return this.config;
    }

    updateActions() {
        updateActions(this)
    }
}

runEntrypoint(ModuleInstance, [])
