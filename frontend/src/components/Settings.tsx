import type { SettingsType } from "@/types";
import { useEffect } from 'react';
import { aiModels, modelDetails } from '../constants/models.ts';
import { useAiStore } from "@/stores/aiStore.ts";
import '@/styles/Settings.css';

const Settings = ({
    settings, setSettings
} : SettingsType) => {
    const modelsDetails = useAiStore((s) => s.modelsDetails)
    const setModelsDetails = useAiStore((s) => s.setModelsDetails)
    const setModelKey = useAiStore((s) => s.setModelKey)

    function saveKeys() {
        for (const model of aiModels) {
            console.log(model)
            console.log(modelsDetails.find(m => m.name === model)!.key || '')
            localStorage.setItem(model, modelsDetails.find(m => m.name === model)!.key || '')
        }
    }

    useEffect(()=>{
        setModelsDetails(aiModels.map(m => modelDetails[m]));

        for (const model of aiModels) {
            const key = localStorage.getItem(model)
            if (key) {
                setModelKey(model, key)
            }
        }
    }, [])

    return settings && (
        <div
            className="overlay"
        >
            <div
                className="settings"
            >
                <div
                    className="title"
                >
                    Settings
                </div>
                <div
                    className="section-title"
                >
                    API keys
                </div>
                {
                    modelsDetails.map(m =>
                        <div
                            className="field"
                            key={m.name}
                        >
                            <img src={m.logo} />
                            <input
                                key={m.name}
                                type="text"
                                value={m.key || ''}
                                onChange={(e) => setModelKey(m.name, e.target.value)}
                            />
                        </div>
                    )
                }
                <div style={{ flex: 1 }}></div>
                <div
                    className="button-row"
                >
                    <button
                        className="save-solid"
                        onClick={() => saveKeys()}
                    >
                        Save
                    </button>
                    <button
                        className="close-solid"
                        onClick={() => setSettings(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;