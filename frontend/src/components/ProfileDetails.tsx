import { useMemo } from 'react';
import { useUserStore } from "@/stores/userStore";
import '@/styles/ProfileDetails.css';
import { useUiStore } from '@/stores/uiStore';

const ProfileDetails = () => {
    const editingProfile = useUiStore((s) => s.editingProfile);
    const setEditingProfile= useUiStore((s) => s.setEditingProfile);
    
    const profiles = useUserStore((s) => s.profiles)
    const updateProfileField = useUserStore((s) => s.updateProfileField)

    const profilesById = useMemo(
        () => Object.fromEntries(profiles.map(p => [p.id, p])),
        [profiles]
    );

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
                        style={{ color: profilesById[editingProfile].color, fontWeight: 'bold', filter: 'brightness(2)' }}
                    >
                        {profilesById[editingProfile].name + ' '}
                    </span>
                </div>
                <div className="field">
                    <label htmlFor="profile-name">Profile name</label>
                    <input
                        id="profile-name"
                        type="text"
                        value={profilesById[editingProfile].name}
                        onChange={e =>
                            updateProfileField(editingProfile, 'name', e.target.value)
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
                            value={profilesById[editingProfile].temperature}
                            onChange={e =>
                                updateProfileField(
                                    editingProfile,
                                    'temperature',
                                    Number(e.target.value)
                                )
                            }
                        />
                        <span className="value">
                            {profilesById[editingProfile].temperature.toFixed(1)}
                        </span>
                    </div>
                </div>

                <div className="field checkbox">
                    <label htmlFor="stream">Streaming responses</label>
                    <input
                        id="stream"
                        type="checkbox"
                        checked={profilesById[editingProfile].stream}
                        onChange={e =>
                            updateProfileField(
                                editingProfile,
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
                        checked={profilesById[editingProfile].autoReply}
                        onChange={e =>
                            updateProfileField(
                                editingProfile,
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
                        value={profilesById[editingProfile].maxTokens}
                        onChange={e =>
                            updateProfileField(
                                editingProfile,
                                'maxTokens',
                                Number(e.target.value)
                            )
                        }
                    />
                </div>
                <button
                    className="close-solid"
                    onClick={() => setEditingProfile(null)}
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default ProfileDetails;