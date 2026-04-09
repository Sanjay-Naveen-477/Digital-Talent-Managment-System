import React, { useState, useEffect, useRef } from 'react';

const CustomDropdown = ({ options, value, onChange, placeholder, style, dropdownStyle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="custom-dropdown" ref={dropdownRef} style={{ position: 'relative', minWidth: '160px', ...style }}>
            <div 
                className="filter-select"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderRadius: isOpen ? '12px 12px 0 0' : '12px',
                    minWidth: '160px',
                    padding: '10px 14px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    color: '#f8fafc',
                    fontSize: '14px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    minHeight: '44px',
                    boxSizing: 'border-box',
                    flex: 1,
                    ...dropdownStyle
                }}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <span style={{ fontSize: '10px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: '10px' }}>▼</span>
            </div>
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    overflow: 'hidden',
                    zIndex: 100000,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    maxHeight: '250px',
                    overflowY: 'auto'
                }}>
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            style={{
                                padding: '10px 15px',
                                cursor: 'pointer',
                                color: opt.disabled ? '#64748b' : '#f8fafc',
                                fontSize: '0.9rem',
                                borderBottom: opt.value !== options[options.length - 1].value ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                backgroundColor: value === opt.value ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                transition: 'background-color 0.2s',
                                pointerEvents: opt.disabled ? 'none' : 'auto',
                                opacity: opt.disabled ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (opt.value !== value && !opt.disabled) e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                if (opt.value !== value && !opt.disabled) e.target.style.backgroundColor = 'transparent';
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
