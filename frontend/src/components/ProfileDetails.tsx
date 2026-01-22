import { useMemo, useState, useEffect } from 'react';
import { useUserStore } from "@/stores/userStore";
import '@/styles/ProfileDetails.css';
import { useUiStore } from '@/stores/uiStore';
import type { Profile } from '@/types/index';
import { modifyProfile } from '@/services/userService';

const ProfileDetails = () => {
    const editingProfile = useUiStore((s) => s.editingProfile);
    const setEditingProfile= useUiStore((s) => s.setEditingProfile);

    
    const profiles = useUserStore((s) => s.profiles)
    const updateProfile = useUserStore((s) => s.updateProfile)
    const dummyProfile = useUserStore((s) => s.dummyProfile)
    const [oldVal, setOldVal] = useState<Profile>(dummyProfile);

    const profilesById = useMemo(
        () => Object.fromEntries(profiles.map(p => [p.id, p])),
        [profiles]
    );

    useEffect(() => {
        if(editingProfile) {
            const profile = profilesById[editingProfile]
            if (profile) setOldVal(profilesById[editingProfile])
        }
    }, [editingProfile, profiles])

    function handleUpdateProfileField(field: string, value: any) {
        if (oldVal) setOldVal({ ...oldVal, [field]: value})
    }

    async function saveUpdatedProfile() {
        if(!oldVal) return
        const newVal = await modifyProfile(oldVal);
        if(newVal) { 
            updateProfile(newVal)
        }
    }

    return editingProfile && (
        <div
            className="overlay"
        >
            <div
                className="edit-profile"
            >
                <div
                    className="title"
                >
                    Editing
                    <span
                        style={{ color: oldVal.color, fontWeight: 'bold', filter: 'brightness(2)' }}
                    >
                        {oldVal.name + ' '}
                    </span>
                </div>
                <div className="field">
                    <label htmlFor="profile-name">Profile name</label>
                    <input
                        id="profile-name"
                        type="text"
                        value={oldVal.name}
                        onChange={e =>
                            handleUpdateProfileField('name', e.target.value)
                        }
                    />
                </div>

                <div className="field">
                    <label htmlFor="temperature">
                        Temperature
                    </label>
                    <div
                        className="inner-field"
                    >
                        <input
                            id="temperature"
                            type="range"
                            min={0}
                            max={2}
                            step={0.1}
                            value={oldVal.temperature}
                            onChange={e =>
                                handleUpdateProfileField(
                                    'temperature',
                                    Number(e.target.value)
                                )
                            }
                        />
                        <span className="value">
                            {oldVal.temperature.toFixed(1)}
                        </span>
                    </div>
                </div>

                <div className="field checkbox">
                    <label htmlFor="stream">Streaming responses</label>
                    <input
                        id="stream"
                        type="checkbox"
                        checked={oldVal.stream}
                        onChange={e =>
                            handleUpdateProfileField(
                                'stream',
                                e.target.checked
                            )
                        }
                    />
                </div>

                <div className="field checkbox">
                    <label htmlFor="autoreply">Auto reply</label>
                    <input
                        id="autoreply"
                        type="checkbox"
                        checked={oldVal.autoReply}
                        onChange={e =>
                            handleUpdateProfileField(
                                'autoReply',
                                e.target.checked
                            )
                        }
                    />
                </div>

                <div className="field">
                    <label htmlFor="max-tokens">Max tokens</label>
                    <input
                        id="max-tokens"
                        type="number"
                        step="1"
                        min={1}
                        value={oldVal.maxTokens}
                        onChange={e =>
                            handleUpdateProfileField(
                                'maxTokens',
                                Number(e.target.value)
                            )
                        }
                    />
                </div>
                <div
                    className="button-row"
                >
                    <button
                        className="close-solid"
                        onClick={() => setEditingProfile(null)}
                    >
                        Close
                    </button>
                    <button
                        className="save-solid"
                        onClick={() => saveUpdatedProfile()}
                    >
                        Save 
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileDetails;