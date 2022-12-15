import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import { P2CameraState, P2OpticalState } from 'p2-camera-connection';
import { ModuleInstance } from './main';

export function initOpticalVariables(instance: ModuleInstance, opticalState: P2OpticalState): void {
    const variables: CompanionVariableDefinition[] = [];

    for (const key of Object.keys(opticalState)) {
        variables.push({
            name: `Optical: ${key}`,
            variableId: `optical.${key}`,
        });
    }        

    instance.opticalVariables = variables;
    setVariables(instance);
}

export function updateOpticalVariables(instance: ModuleInstance, opticalState: P2OpticalState): void {
    const variables: CompanionVariableValues = {};
    for (const [key, value] of Object.entries(opticalState)) {
        variables[`optical.${key}`] = value;
    }

    instance.setVariableValues(variables as any);
}
export function initCameraVariables(instance: ModuleInstance, opticalState: P2CameraState): void {
    const variables: CompanionVariableDefinition[] = [];

    for (const key of Object.keys(opticalState)) {
        variables.push({
            name: `Camera: ${key}`,
            variableId: `camera.${key}`,
        });
    }        

    instance.cameraVariables = variables;
    setVariables(instance);
}

export function updateCameraVariables(instance: ModuleInstance, opticalState: P2CameraState): void {
    const variables: CompanionVariableValues = {};
    for (const [key, value] of Object.entries(opticalState)) {
        variables[`camera.${key}`] = value;
    }

    instance.setVariableValues(variables as any);
}

export function setVariables(instance: ModuleInstance) {
    const variables = [...instance.opticalVariables, ...instance.cameraVariables];
    instance.setVariableDefinitions(variables);
}