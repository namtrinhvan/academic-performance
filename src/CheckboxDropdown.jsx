import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaCheckSquare, FaRegSquare, FaChevronDown } from 'react-icons/fa';
import styles from './CheckboxDropdown.module.scss';

const CheckboxDropdown = ({
                              options = [],
                              value = [], // Bắt buộc là Array
                              onChange,
                              placeholder = "Select options",
                              className = "",
                              maxDisplayTags = 2, // Số lượng item hiển thị tên cụ thể trước khi gộp
                              zIndex = 1000 // Default zIndex cao để nổi lên trên
                          }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // Xử lý click outside để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter options theo search term
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    // Xử lý hiển thị Label ở Trigger Button
    const displayLabel = useMemo(() => {
        if (!value || value.length === 0) return placeholder;

        // Lấy danh sách label của các item đang được chọn để hiển thị đúng thứ tự
        const selectedLabels = options
            .filter(opt => value.includes(opt.value))
            .map(opt => opt.label);

        if (selectedLabels.length <= maxDisplayTags) {
            return selectedLabels.join(", ");
        }
        return `${value.length} đã chọn`;
    }, [value, options, placeholder, maxDisplayTags]);

    // Toggle chọn 1 item
    const handleToggle = (optionValue) => {
        const currentIndex = value.indexOf(optionValue);
        let newValues = [...value];

        if (currentIndex === -1) {
            newValues.push(optionValue); // Chưa có thì thêm
        } else {
            newValues.splice(currentIndex, 1); // Có rồi thì xóa
        }
        onChange(newValues);
        // Không đóng dropdown để user có thể chọn tiếp nhiều item
    };

    // Chọn tất cả các item ĐANG HIỂN THỊ (hỗ trợ khi đang search)
    const handleSelectAll = () => {
        const visibleValues = filteredOptions.map(opt => opt.value);
        // Hợp nhất mảng cũ và mảng mới (Set để loại bỏ trùng lặp)
        const uniqueValues = [...new Set([...value, ...visibleValues])];
        onChange(uniqueValues);
    };

    // Bỏ chọn tất cả các item ĐANG HIỂN THỊ
    const handleClearVisible = () => {
        const visibleValues = filteredOptions.map(opt => opt.value);
        const newValues = value.filter(val => !visibleValues.includes(val));
        onChange(newValues);
    };

    // Check xem tất cả item hiển thị đã được chọn chưa (để đổi text nút Select All)
    const isAllVisibleSelected = useMemo(() => {
        if (filteredOptions.length === 0) return false;
        // Kiểm tra xem mọi option đang hiển thị có nằm trong list value không
        return filteredOptions.every(opt => value.includes(opt.value));
    }, [filteredOptions, value]);

    return (
        <div className={`${styles.container} ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <div
                className={`${styles.trigger} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`${styles.label} ${value.length === 0 ? styles.placeholder : ''}`}>
                    {displayLabel}
                </span>
                <span className={`${styles.icon} ${isOpen ? styles.rotate : ''}`}>
                    <FaChevronDown size={12} />
                </span>
            </div>

            {/* Dropdown Menu */}
            {/* LƯU Ý QUAN TRỌNG:
                Để dropdown không đẩy nội dung bên dưới, nó bắt buộc phải có position: absolute.
                Tôi thêm style inline ở đây để đảm bảo logic này hoạt động ngay cả khi SCSS thiếu thuộc tính absolute.
            */}
            {isOpen && (
                <div
                    className={styles.dropdown}
                    style={{
                        zIndex: zIndex,
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%'
                    }}
                >
                    {/* Search Bar */}
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Quick Actions (Select All / Clear) */}
                    {filteredOptions.length > 0 && (
                        <div className={styles.actionsBar}>
                            <button
                                className={styles.actionBtn}
                                onClick={isAllVisibleSelected ? handleClearVisible : handleSelectAll}
                                type="button"
                            >
                                {isAllVisibleSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                            </button>
                            {value.length > 0 && (
                                <button
                                    className={`${styles.actionBtn} ${styles.clearBtn}`}
                                    onClick={() => onChange([])}
                                    type="button"
                                >
                                    Xóa hết
                                </button>
                            )}
                        </div>
                    )}

                    {/* Options List */}
                    <ul className={styles.list}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <li
                                        key={option.value}
                                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                                        onClick={() => handleToggle(option.value)}
                                    >
                                        <div className={styles.optionContent}>
                                            {isSelected ? (
                                                <FaCheckSquare className={styles.checkboxIcon} />
                                            ) : (
                                                <FaRegSquare className={styles.checkboxIconUnchecked} />
                                            )}
                                            <span className={styles.optionText}>{option.label}</span>
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <li className={styles.empty}>Không tìm thấy kết quả</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

CheckboxDropdown.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
    })).isRequired,
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    maxDisplayTags: PropTypes.number,
    zIndex: PropTypes.number, // Prop mới thêm
};

export default CheckboxDropdown;