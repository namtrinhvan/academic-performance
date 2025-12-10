import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import styles from './RadioDropdown.module.scss';

const RadioDropdown = ({
                           options = [],
                           value,
                           onChange,
                           placeholder = "Select an option",
                           className = "",
                           zIndex = 100 // Giá trị mặc định là 100
                       }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Xử lý sự kiện click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm(""); // Reset search khi đóng
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Focus vào ô tìm kiếm khi mở dropdown
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Lọc options dựa trên từ khóa tìm kiếm
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    // Lấy label của option đang được chọn để hiển thị
    const selectedOption = options.find(opt => opt.value === value);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className={`${styles.container} ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <div
                className={`${styles.trigger} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`${styles.label} ${!selectedOption ? styles.placeholder : ''}`}>
                    {displayLabel}
                </span>
                <span className={`${styles.icon} ${isOpen ? styles.rotate : ''}`}>
                    <FaChevronDown size={12} />
                </span>
            </div>

            {/* Dropdown Menu */}
            {/* position: absolute trong CSS kết hợp với zIndex ở đây giúp nó nổi lên trên */}
            {isOpen && (
                <div
                    className={styles.dropdown}
                    style={{ zIndex: zIndex }}
                >
                    {/* Search Bar */}
                    <div className={styles.searchWrapper}>
                        <input
                            ref={searchInputRef}
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Options List */}
                    <ul className={styles.list}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <li
                                        key={option.value}
                                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                                        onClick={() => handleSelect(option.value)}
                                    >
                                        <span className={styles.optionLabel}>{option.label}</span>
                                        {isSelected && <FaCheck className={styles.checkIcon} size={12} />}
                                    </li>
                                );
                            })
                        ) : (
                            <li className={styles.empty}>No results found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

RadioDropdown.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
    })).isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    zIndex: PropTypes.number, // Định nghĩa kiểu dữ liệu cho zIndex
};

export default RadioDropdown;