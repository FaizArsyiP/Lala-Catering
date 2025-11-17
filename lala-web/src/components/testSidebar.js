"use client";

import React, { useState } from 'react';

const TestSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* TOMBOL TRIGGER - Posisi fixed, margin top 600px */}
            <button
                onClick={() => {
                    console.log('Tombol diklik!');
                    setIsOpen(!isOpen);
                }}
                style={{
                    position: 'fixed',
                    right: '0px',
                    top: '600px', // MT 600px seperti permintaan
                    zIndex: 999999,
                    backgroundColor: '#E5713A',
                    color: 'white',
                    padding: '16px 12px',
                    borderRadius: '8px 0 0 8px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '-2px 2px 10px rgba(0,0,0,0.3)',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.right = '5px';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.right = '0px';
                }}
            >
                {isOpen ? '→' : '←'}
            </button>

            {/* OVERLAY - Muncul saat sidebar dibuka */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999998,
                        transition: 'opacity 0.3s ease'
                    }}
                />
            )}

            {/* SIDEBAR PANEL */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: isOpen ? '0' : '-450px', // Slide in/out
                    width: '400px',
                    height: '100vh',
                    backgroundColor: 'white',
                    zIndex: 999999,
                    boxShadow: '-5px 0 15px rgba(0,0,0,0.3)',
                    transition: 'right 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* HEADER */}
                <div style={{
                    padding: '24px',
                    borderBottom: '2px solid #E5713A',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ 
                            margin: 0, 
                            fontSize: '28px', 
                            fontWeight: 'bold',
                            color: '#002683'
                        }}>
                            Test Sidebar
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                fontSize: '32px',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '0',
                                lineHeight: '1'
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* CONTENT - Scrollable */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px'
                }}>
                    <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#002683' }}>
                            Item 1
                        </h3>
                        <p style={{ color: '#666', margin: 0 }}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#002683' }}>
                            Item 2
                        </h3>
                        <p style={{ color: '#666', margin: 0 }}>
                            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#002683' }}>
                            Item 3
                        </h3>
                        <p style={{ color: '#666', margin: 0 }}>
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco.
                        </p>
                    </div>

                    {/* Tambahkan lebih banyak konten untuk test scroll */}
                    {[4, 5, 6, 7, 8, 9, 10].map(num => (
                        <div key={num} style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#002683' }}>
                                Item {num}
                            </h3>
                            <p style={{ color: '#666', margin: 0 }}>
                                Konten dummy untuk testing scroll functionality.
                            </p>
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div style={{
                    padding: '24px',
                    borderTop: '1px solid #ddd',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
                        <span>Total:</span>
                        <span style={{ color: '#002683' }}>Rp 150.000</span>
                    </div>
                    <button
                        onClick={() => {
                            alert('Tombol diklik!');
                            setIsOpen(false);
                        }}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: '#E5713A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#D46029';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#E5713A';
                        }}
                    >
                        Konfirmasi
                    </button>
                </div>
            </div>
        </>
    );
};

export default TestSidebar;