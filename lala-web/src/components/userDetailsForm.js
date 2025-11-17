// src/components/UserDetailsForm.js
import React from 'react';
import FormInput from '@/components/formInput'; 

// Daftar Pilihan untuk Dropdown
const deliveryOptions = ["Kirim ke Lokasi", "Ambil Sendiri"];

const UserDetailsForm = ({ 
    userData, 
    setUserData, 
    editable = true 
}) => {
    
    const handleChange = (field, e) => {
        if (editable) {
            setUserData(prev => ({
                ...prev,
                [field]: e.target.value
            }));
        }
    };
    
    return (
        <div className="w-full space-y-4"> 
            <FormInput
                label="Nama Lengkap"
                value={userData.name}
                onChange={(e) => handleChange('name', e)}
                editable={editable}
                type="text"
            />
            
            <FormInput
                label="No Handphone"
                value={userData.phone}
                onChange={(e) => handleChange('phone', e)}
                editable={editable}
                type="tel"
            />
            
            <FormInput
                label="Email"
                value={userData.email}
                onChange={(e) => handleChange('email', e)}
                editable={editable}
                type="email"
            />
            
            {/* Dropdown Metode Kirim */}
            <FormInput
                label="Metode Kirim"
                value={userData.deliveryMethod}
                onChange={(e) => handleChange('deliveryMethod', e)}
                editable={editable}
                isSelect={true}
                options={deliveryOptions}
            />
            
            <FormInput
                label="Alamat Lengkap"
                value={userData.address}
                onChange={(e) => handleChange('address', e)}
                editable={editable}
                type="text"
            />
            
        </div>
    );
};

export default UserDetailsForm;