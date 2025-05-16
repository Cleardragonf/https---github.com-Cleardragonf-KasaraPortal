import React, { useState } from 'react';

const PreferencesPage: React.FC = () => {
    const [logo, setLogo] = useState<File | null>(null);
    const [password, setPassword] = useState('');

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogo(e.target.files[0]);
        }
    };

    const handleSave = () => {
        console.log('Saving preferences:', { logo, password });
        alert('Preferences saved!');
    };

    return (
        <div className="preferences-container">
            <h1>Preferences</h1>
            <div className="form-group">
                <label htmlFor="logo">Upload Logo</label>
                <input type="file" id="logo" onChange={handleLogoChange} />
            </div>
            <div className="form-group">
                <label htmlFor="password">Change Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                />
            </div>
            <button onClick={handleSave}>Save Preferences</button>
        </div>
    );
};

export default PreferencesPage;
